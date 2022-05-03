const express = require('express');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const { initializePowerSupply, sendCommand } = require('../utilities/SCPIHelpers');
const { decToHex2c } = require('../utilities/hexHelpers');
const { sendRDM, getAddress, getFirmwareAndWattage } = require('../utilities/rdmDmxHelpers');
const { readPowerSupplyStatus } = require('../utilities/psStatusHelpers');

const router = express.Router();

/* GET manual testing home page. */
router.get('/', (req, res) => {
  res.render('.\\manual\\manual', { title: 'Manual Commands' });
});

/* Send power commands to power supply */
router.post('/powerControl', async (req, res) => {
  if (req.body.psCommand === 'On') {
    //const volt = (req.body.wattage === '150') ? '26.75' : '24';
    const volt = '26'
    const watt = '3.2';
    try {
      await initializePowerSupply(volt, watt);
      await sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
      res.redirect('/manual');
    } catch (err) {
      res.render('.\\error', { message: 'Error Communicating with Power Supply', error: err });
    }
  } else {
    sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
    res.redirect('/manual');
  }
});

/* Send DAC BCCU to device */
router.post('/sendRDM', async (req, res) => {
  const unlockCode = process.env.UNLOCK_CODE;
  const dacBccuHexObject = [unlockCode];
  const values = Object.keys(req.body);
  const dutAddress = await getAddress();

  // console.log(dutAddress);
  for (let i = 0; i < values.length; i += 1) {
    if (values[i].includes('Dac')) {
      dacBccuHexObject.push(decToHex2c(parseInt(req.body[values[i]], 10)));
    } else if (values[i].includes('Bccu')) {
      dacBccuHexObject.push(decToHex2c(parseInt(req.body[values[i]], 10)));
      // onOff time comes after bccu
      dacBccuHexObject.push('0000');
    }
  }

  // format rdm parameters
  const rdmParams = {
    command_class: '30',
    destination: dutAddress,
    pid: '8625',
    data: dacBccuHexObject.join(''),
  };
  // console.log(req.body);
  sendRDM(rdmParams);
  res.send(200);
});

/* Print Label */
router.get('/labelInfo', async (req, res) => {
  const printValues = {};
  const psStatus = await initializePowerSupply('24', '3.2');

  if (psStatus.Config[3].includes('OFF')) {
    res.render('.\\manual\\manual', { title: 'Manual Commands', printMessage: 'Check Power Supply!' });
  } else {
    const address = await getAddress();
    const firmWatt = await getFirmwareAndWattage(address);
    printValues.address = address;
    printValues.firmware = firmWatt.firmware;
    printValues.wattage = firmWatt.wattage;

    res.render('.\\manual\\manual', { title: 'Manual Commands', printValues });
  }
});

module.exports = router;
