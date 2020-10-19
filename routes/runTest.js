/* eslint-disable quote-props */
/* eslint-disable max-len */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const { initializePowerSupply, sendCommand } = require('../utilities/SCPIHelpers');
const { runTestById } = require('../utilities/testHelpers');
const { getAddress, rdmDiscoverAddress, getFirmwareAndWattage } = require('../utilities/rdmDmxHelpers');
const { getTestById, getMeasurementsByTestId, getBoardIds } = require('../utilities/databaseHelpers');

const router = express.Router();

/* GET test home page. */
router.get('/', (req, res) => {
  const deviceAddresses = [
    process.env.DMM_CHAN_0,
    process.env.DMM_CHAN_1,
    process.env.DMM_CHAN_2,
    process.env.DMM_CHAN_3,
    process.env.PPS,
  ];

  scpi.checkInsturments(deviceAddresses, '*IDN?', 'false')
    .then((instrumentCheck) => {
      dbhelper.getTestTemplate()
        .then((testTemplates) => {
          initializePowerSupply()
            .then((psReading) => {
              res.render('.\\runTest\\runTest', {
                title: 'Test Setup',
                instruments: instrumentCheck,
                templates: testTemplates.recordset,
                status: psReading,
              });
            });
        });
    }).catch((err) => {
      res.render('.\\runTest\\testError', { title: 'SCPI Server Not Responding', message: err });
    });
});

/*  */
router.get('/startTest/:id/:testName/:wattage', async (req, res) => {
  // setup Server Sent Event Communication
  const client = res;
  req.socket.setTimeout((1000 * 120));
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
      const devSpec = await getFirmwareAndWattage(dutAddress);
      // check firware wattage to prevent wrong test from running
      if (devSpec.wattage.includes(testInfo.wattage) === true) {
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
        client.write('event: error\ndata: Device wattage does not match the selected test!\n\n');
        client.end();
      }
    } else {
      // console.log(3);
      client.write('data: Power supply off...\n\n');
      sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
      client.write('event: error\ndata: No device address found with RDM!\n\n');
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
    });
  // res.render('.\\runTest\\testResults', { title: 'Test Results: '+ req.params.testId });
});

/** */
router.get('/testResults/:boardId', (req, res) => {
  console.log(req.params.BoardId);
});

/** */
router.get('/testResults/:startDate/:endData', (req, res) => {

});

/** */
router.get('/searchTestResults', (req, res) => {
  // add promise all to handle all data collection for page
  getBoardIds()
    .then((IdResults) => {
      res.render('.\\runTest\\searchTestResults', { title: 'Search Test Results', BoardIds: IdResults.recordset });
    })
    .catch((error) => {
      res.render('.\\runTest\\testError', { title: 'Testing Error', message: error });
    });
});

module.exports = router;
