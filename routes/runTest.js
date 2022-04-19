/* eslint-disable no-plusplus */
/* eslint-disable quote-props */
/* eslint-disable max-len */
const fs = require('fs');
const xlsx = require('xlsx');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const { initializePowerSupply, sendCommand } = require('../utilities/SCPIHelpers');
const { runTestById, runDMXTest } = require('../utilities/testHelpers');
const { getAddress, rdmDiscoverAddress, getFirmwareAndWattage, getHardwareWattage } = require('../utilities/rdmDmxHelpers');
const { getTestById, getMeasurementsByTestId, getBoardIds, getFirmwares, getWattages } = require('../utilities/databaseHelpers');

const router = express.Router();
const deviceAddresses = [
  process.env.DMM_CHAN_0,
  process.env.DMM_CHAN_1,
  process.env.DMM_CHAN_2,
  process.env.DMM_CHAN_3,
  process.env.PPS,
];

/* GET test home page. */
router.get('/', (req, res) => {
  scpi.checkInstruments(deviceAddresses, '*IDN?', 'false')
    .then((instrumentCheck) => {
      dbhelper.getTestTemplate()
        .then((testTemplates) => {
          res.render('.\\runTest\\runTest', {
            title: 'Test Setup',
            instruments: instrumentCheck,
            templates: testTemplates.recordset,
            // status: psReading,
          });
        })
        .catch((dbErr) => {
          res.render('.\\runTest\\testError', { title: 'Database not responding, check connection and try again.', message: dbErr });
        });
    }).catch((err) => {
      res.render('.\\runTest\\testError', { title: 'SCPI Server Not Responding', message: err });
    });
});

/*  */
router.get('/startTest/:id/:testName/:wattage', async (req, res) => {
  // setup Server Sent Event Communication
  const client = res;
  req.socket.setTimeout((1000 * 180));
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');

  // run test routine
  try {
    // get form information on test to run
    const testInfo = {
      'id': req.params.id,
      'testName': req.params.testName,
      'wattage': req.params.wattage,
    };

    client.write('data: Initializing power supply...\n\n');
    // let psStatus;

    // if (req.params.wattage.includes('150')) {
    //   psStatus = await initializePowerSupply('26', '3.2');
    // } else {
    //   psStatus = await initializePowerSupply('24', '3.2');
    // }
    const psStatus = await initializePowerSupply('26', '3.2');

    client.write(`data: Power Supply set to ${psStatus.Voltage * 2} Volts...\n\n`); // multiply voltage because two channels are run in series to achieve proper voltage
    // add check for ps settings is accurate with psStatus

    client.write('data: Power Supply On...\n\n');
    // power on device
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
    // get address of connected device if one exists, acts as a check to verify device is connected
    client.write('data: Getting device address...\n\n');
    const dutAddress = await getAddress();
    // an empty address means a device was not found
    if (dutAddress.length > 3) {
      client.write(`data: Address found: ${dutAddress}\n\n`);
      client.write('data: Getting firmware and wattage...\n\n');
      const hardwareWattage = await getHardwareWattage(dutAddress);
      // console.log('HWWatt: '+ hardwareWattage);
      const devSpec = await getFirmwareAndWattage(dutAddress);
      // check firware wattage to prevent wrong test from running
      if (devSpec.wattage.includes(testInfo.wattage) === true && devSpec.wattage.includes(hardwareWattage.toString()) === true) {
        client.write(`data: Hardware wattage reading: ${hardwareWattage.toString()}W\n\n`);
        client.write(`data: Device firmware: ${devSpec.firmware}\n\n`);
        client.write(`data: Device wattage: ${devSpec.wattage}\n\n`);
        // run test, power off device and return test result page
        const testOutput = await runTestById(testInfo, dutAddress, devSpec.firmware, devSpec.wattage, client);
        // console.log(1);
        client.write('data: \n\n');
        client.write('data: Testing Complete.\n\n');
        client.write('data: Power supply off...\n\n');
        sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
        const testIdData = JSON.stringify({ TestId: testOutput[0].TestId });
        client.write(`data: ${testIdData}\n\n`);
        client.end();
      } else if (hardwareWattage.toString === '150') {
        client.write(`data: Hardware wattage reading: ${hardwareWattage.toString()}W\n\n`);
        client.write(`data: Device firmware: ${devSpec.firmware}\n\n`);
        client.write(`data: Device wattage: ${devSpec.wattage}\n\n`);
        // run test, power off device and return test result page
        const testOutput = await runTestById(testInfo, dutAddress, devSpec.firmware, devSpec.wattage, client);
        // console.log(1);
        client.write('data: \n\n');
        client.write('data: Testing Complete.\n\n');
        client.write('data: Power supply off...\n\n');
        sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
        const testIdData = JSON.stringify({ TestId: testOutput[0].TestId });
        client.write(`data: ${testIdData}\n\n`);
        client.end();
      } else {
        // console.log(2);
        client.write('data: Power supply off...\n\n');
        sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
        client.write(`data: Hardware wattage reading: ${hardwareWattage.toString()}W\n\n`);
        client.write(`data: Device firmware: ${devSpec.firmware}\n\n`);
        client.write(`data: Device wattage: ${devSpec.wattage}\n\n`);
        client.write('data: Failure detected: Device wattage or hardware wattage does not match the selected test, please check firmware and test selected!\n\n');
        client.end();
      }
    } else {
      // console.log(3);
      client.write('data: Power supply off...\n\n');
      sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
      client.write('event: error\ndata: No device address found with RDM, check connection and try again!\n\n');
      client.end();
    }
  } catch (error) {
    // console.log(error);
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
    client.write(`event: error\ndata: Error: ${error}\n\n`);
    client.end();
  }
});

/** */
router.get('/testResults/:testId', (req, res) => {
  getTestById(req.params.testId)
    .then((testResponse) => {
      if (testResponse.recordset.length < 1) {
        res.render('.\\runTest\\testError', { title: 'Test Results', message: 'No results found for that test ID.' });
        return;
      }
      getMeasurementsByTestId(req.params.testId)
        .then((meausrementResponse) => {
          res.render('.\\runTest\\testResults', { title: `Test Name: ${testResponse.recordset[0].TestTemplateName}`, testInfo: testResponse.recordset[0], measurementInfo: meausrementResponse.recordset });
        });
    })
    .catch((dbErr) => {
      res.render('.\\runTest\\testError', { title: 'Database not responding, check connection and try again.', message: dbErr });
    });
  // res.render('.\\runTest\\testResults', { title: 'Test Results: '+ req.params.testId });
});

/** */
router.get('/searchTestResults', async (req, res) => {
  const data = {};
  try {
    data.BoardIds = await getBoardIds();
    data.Firmwares = await getFirmwares();
    data.Wattages = await getWattages();

    if (data.BoardIds.recordset.length > 0 && data.Firmwares.recordset.length > 0 && data.Wattages.recordset.length > 0) {
      res.render('.\\runTest\\searchTestResults', { title: 'Search Test Results', BoardIds: data.BoardIds.recordset, FirmWares: data.Firmwares.recordset, Wattages: data.Wattages.recordset });
    } else {
      res.render('.\\runTest\\testError', { title: 'Testing Error', message: 'Missing data from Database' });
    }
  } catch (error) {
    res.render('.\\runTest\\testError', { title: 'Testing Error', message: `Error gathering data for search : ${error}` });
  }
});

/* export single test results to excel */
router.post('/searchTestResults/export', (req, res) => {
  // console.log(req.body);
  const params = req.body;
  dbhelper.searchDatabase(params.BoardIdInput, params.FirmWaresInput, params.WattagesInput, params.StartDate, params.EndDate)
    .then((results) => {
      // console.log(results);
      const searchResults = xlsx.utils.json_to_sheet(results.recordset);
      const wb = xlsx.utils.book_new();
      const fileName = 'SearchResults.xlsx';

      xlsx.utils.book_append_sheet(wb, searchResults, 'Search Results');
      xlsx.writeFile(wb, fileName);
      res.download(fileName, (err) => {
        if (err) {
          res.render('.\\runTest\\testError', { title: 'Error', message: err });
        }
        fs.unlink(fileName, (error) => {
          if (error) {
            console.log(error);
          }
        });
      });
    });
});

router.get('/dmxTest', (req, res) => {
  scpi.checkInstruments(deviceAddresses, '*IDN?', 'false')
    .then((instrumentCheck) => {
      res.render('.\\runTest\\dmx', {
        title: 'DMX Test Setup',
        instruments: instrumentCheck,
      });
    }).catch((err) => {
      res.render('.\\runTest\\testError', { title: 'SCPI Server Not Responding', message: err });
    });
});

// const dmxClient = [];

// router.get('/testStatus', (req, res) => {
//   // req.socket.setTimeout((1000 * 180));
//   res.writeHead(200, {
//     'Content-Type': 'text/event-stream',
//     'Cache-Control': 'no-cache',
//     'Connection': 'keep-alive',
//   });
//   res.write('\n');

//   const clientId = Date.now();
//   const newClient = {
//     id: clientId,
//     response: res,
//   };

//   dmxClient.push(newClient);
//   console.log(dmxClient[0].id);
//   req.on('close', () => {
//     console.log(`${clientId} Connection Closed`);
//     dmxClient.pop();
//   });
// });

// function sendTestUpdate(update) {
//   console.log(update);
//   dmxClient[0].response.write(`data: ${update}\n\n`);
// }

router.get('/runDMXTest', async (req, res) => {
  // setup Server Sent Event Communication
  const client = res;
  // req.socket.setTimeout((1000 * 180));
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');
  // console.log(req.query);
  const data = req.query;
  // get all test keys and values into single object
  const testValues = Object.fromEntries(Object.entries(data).filter(([key]) => key.includes('Test')));
  const tests = [];
  const conditionedTests = [];

  // create test group objects
  for (const cols = Object.entries(testValues); cols.length;) {
    // eslint-disable-next-line no-return-assign
    tests.push(cols.splice(0, 5).reduce((o, [k, v]) => (o[k] = v, o), {}));
  }

  // condition test key names for dmxTest helper
  tests.forEach((test) => {
    const output = {};
    const testKeys = Object.keys(test);
    testKeys.forEach((key) => {
      if (key.includes('white')) {
        output.White = test[key];
      } else if (key.includes('red')) {
        output.Red = test[key];
      } else if (key.includes('green')) {
        output.Green = test[key];
      } else if (key.includes('blue')) {
        output.Blue = test[key];
      } else if (key.includes('delay')) {
        output.Delay = test[key];
      }
    });
    conditionedTests.push(output);
  });

  client.write('data: Initializing power supply...\n\n');

  // run tests on tests array of objects
  try {
    const psStatus = await initializePowerSupply('26', '3.2');
    client.write(
      `data: Power Supply set to ${psStatus.Voltage * 2} Volts...\n\n`
    );
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
    client.write('data: Power Supply On...\n\n');
    client.write('data: Getting device address...\n\n');

    const dutAddress = await getAddress();
    if (dutAddress.length > 3) {
      client.write(`data: Address found: ${dutAddress}\n\n`);
      client.write('data: Getting firmware and wattage...\n\n');
      const devSpec = await getFirmwareAndWattage(dutAddress);
      await runDMXTest(conditionedTests, dutAddress, devSpec, client);
      sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
      // dmxClient[0].response.end();
      client.write('data: Testing Finished...\n\n');
      res.status(200);
    } else {
      sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
      client.write('error: Unable to get Address\n\n');
    }
  } catch (error) {
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
    res.status(200).send({ Error: error });
  }
});

module.exports = router;


// const green = {
//   1: '128',
//   2: '0',
//   3: '255',
//   4: '0',
//   5: '0',
//   6: '0',
// };