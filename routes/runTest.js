const express = require('express');
const scpi = require('../utilities/SCPIHelpers');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('.\\runTest\\runTest', { title: 'Run Test Page' });
});

/* GET data from test instruments */
router.get('/instrumentCheck', (req, res) => {
  const devices = [
    process.env.DMM_CHAN_0,
    process.env.DMM_CHAN_0,
    process.env.DMM_CHAN_0,
    process.env.DMM_CHAN_0,
  ];

  scpi.checkInsturments(devices, '*IDN?', 'false')
    .then((data) => {
      console.log(data);
      res.send(data);
    });
});

/* GET data from test instruments */
router.get('/startTest', (req, res) => {

});

module.exports = router;
