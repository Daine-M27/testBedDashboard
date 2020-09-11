const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const { initializePowerSupply, sendCommand } = require('../utilities/SCPIHelpers');
const { runTestById } = require('../utilities/testHelpers');
const { rdmDiscoverAddress, getFirmwareAndWattage } = require('../utilities/rdmDmxHelpers');
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
      // if(instrumentCheck){

      // }
      // console.log(data);
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
router.post('/startTest', (req, res) => {
  // console.log(req.body.TestTemplateId);
  const testInfo = JSON.parse(req.body.TestTemplate);
  // power on device
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON').catch((err) => { console.log(err); });
  // get address of connected device if one exists, acts as a check to verify device is connected
  rdmDiscoverAddress().then((dutAddress) => {
    if (dutAddress.length > 3) {
      // console.log(`run test rdm discover${dutAddress}`);
      // check wattage of device
      getFirmwareAndWattage(dutAddress).then((data) => {
        // check for wattage before running test
        if (data.wattage.includes(testInfo.wattage) === true) {
          runTestById(testInfo, dutAddress, data.firmware, data.wattage).then((testOutput) => {
            // passing test
            sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
            res.redirect(`./testResults/${testOutput[0].TestId}`);
          }).catch((error) => { // error from runTestById
            sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
            res.render('.\\runTest\\testError', { title: 'Testing Error', message: error });
          });// take test template id and redirect to test page
        } else {
          res.render('.\\runTest\\testError', { title: 'Testing Error', message: 'Device Wattage does not match the selected test!' });
        }
      }).catch((error) => {
        sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
        res.render('.\\runTest\\testError', { title: 'Testing Error', message: error });
      });
    } else {
      sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
      res.render('.\\runTest\\testError', { title: 'Testing Error', message: 'No Device Found with RDM!' });
    }
  }).catch((error) => {
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
    res.render('.\\runTest\\testError', { title: 'Testing Error', message: error });
  });
});

/** */
router.get('/testResults/:testId', (req, res) => {
  getTestById(req.params.testId)
    .then((testResponse) => {
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
