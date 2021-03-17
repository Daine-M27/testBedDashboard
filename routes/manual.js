const express = require('express');
const SCPI = require('../utilities/SCPIHelpers');

const router = express.Router();

/* GET manual testing home page. */
router.get('/', (req, res, next) => {
  res.render('.\\manual\\manual', { title: 'Manual Commands' });
});

/* Send power commands to power supply */
router.post('/powerControl', (req, res) => {
  if (req.body.psCommand === 'On') {
    const volt = (req.body.wattage === '150') ? '26.75' : '24';
    const watt = '3.2';
    try {
      SCPI.initializePowerSupply(volt, watt).then(() => {
        SCPI.sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
        res.redirect('/manual');
      });
    } catch (err) {
      res.render('.\\error', { message: 'Error Communication with PS', error: err });
    }
  } else {
    SCPI.sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
    res.redirect('/manual');
  }
});

/* Send DAC BCCU to device */
router.post('/sendRDM', (req, res) => {
    
})

module.exports = router;
