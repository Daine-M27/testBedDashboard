const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dbhelper = require('../utilities/databaseHelpers');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });

const router = express.Router();

/* GET test home page. */
router.get('/', (req, res) => {
  const devices = [
    process.env.DMM_CHAN_0,
    process.env.DMM_CHAN_1,
    process.env.DMM_CHAN_2,
    process.env.DMM_CHAN_3,
    process.env.PPS,
  ];

  scpi.checkInsturments(devices, '*IDN?', 'false')
    .then((instrumentCheck) => {
      // console.log(data);
      dbhelper.getTestTemplate()
        .then((testTemplates) => {
          res.render('.\\runTest\\runTest', { title: 'Run Test Page', instruments: instrumentCheck, templates: testTemplates.recordset });
        });
    });
});

/* GET test specific page */
router.get('/instrumentCheck', (req, res) => {
  res.render('.\\runTest\\runTest', { title: 'Test Specific Page' });
});

/*  */
router.post('/startTest', (req, res) => {
  // console.log(req.body.TestTemplateId);
  
  // take test template id and redirect to test page
  res

});

module.exports = router;
