const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const { initializePowerSupply, sendCommand } = require('../utilities/SCPIHelpers');
const { runTestById } = require('../utilities/testHelpers');
const { rdmDiscoverAddress, getFirmwareAndWattage} = require('../utilities/rdmDmxHelpers');

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
    });
});

/*  */
router.post('/startTest', (req, res) => {
  // console.log(req.body.TestTemplateId);
  const testInfo = JSON.parse(req.body.TestTemplate);
  
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON').catch((err) => { console.log(err); });
  rdmDiscoverAddress().then((dutAddress) => {
    getFirmwareAndWattage(dutAddress).then((data) => {
      if (data.wattage.includes(testInfo.wattage) === true) {
        runTestById(testInfo).then(() => {
          res.render('.\\runTest\\testResults', { title: 'Test Results' });
        });// take test template id and redirect to test page
      } else {
        res.render('.\\runTest\\testError', { title: 'Testing Error', message: 'Device Wattage does not match the selected test!' });
      }
    });
  });
  
});

module.exports = router;
