const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const { getReading, initializePowerSupply } = require('../utilities/SCPIHelpers');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });


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

  // take test template id and redirect to test page
  // power up pps with initial config values
  // check board to ensure it matches test selected wattage
  // if pps is ready and board matches enable start test button`

});

module.exports = router;
