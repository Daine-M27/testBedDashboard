/* eslint-disable space-before-blocks */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-template */

// Async / Await / Promise - version of SCPI function
const net = require('net');
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const psStatus = require('../utilities/psStatusHelpers');
const hexHelper = require('../utilities/hexHelpers');

const infoCommand = '*IDN?';

/**
 * This function sends a command to the scpi server, no response from server
 * @param {string} address
 * @param {string} command
 */
function sendCommand(address, command) {
  return new Promise((resolve, reject) => {
    const cs = new net.Socket();
    const params = {
      parameters: {
        address,
        command,
      },
    };

    function cleanUp() {
      cs.destroy();
      resolve();
    }

    cs.connect(5001, '127.0.0.1', () => {
      cs.write(JSON.stringify(params));
    });

    cs.on('close', () => {
      // console.log('closing connection');
      cleanUp();
    });

    cs.on('error', (err) => {
      reject('error detected :' + err);
    });
  });
}

/**
 * This function sends a command to the scpi server and gets a value in return
 * @param {string} address
 * @param {string} command
 * @param {string} convert
 */
function getReading(address, command, convert) {
  return new Promise((resolve, reject) => {
    const cs = new net.Socket();
    const params = {
      parameters: {
        address,
        command,
        convert,
      },
    };

    function cleanUp(value) {
      cs.destroy();
      resolve(value);
    }

    cs.connect(5001, '127.0.0.1', () => {
      cs.write(JSON.stringify(params));
    });

    cs.on('data', (data) => {
      const reading = new TextDecoder().decode(data);
      cleanUp(reading);
    });

    cs.on('close', () => {
      // console.log('closing connection');
      cleanUp();
    });

    cs.on('error', (err) => {
      reject(`error detected: ${err}`);
    });
  });
}

/**
 * This function takes an address list and command to query multiple instruments for command.
 * @param {array} addressList
 * @param {string} command
 */
function checkInsturments(addressList, command, convert) {
  return new Promise((resolve, reject) => {
    const readingPromises = [];
    const output = [];
    const complete = (data) => {
      resolve(data);
    };
    addressList.forEach(async (deviceAddress) => {
      if (convert) {
        readingPromises.push(getReading(deviceAddress, command, convert));
      } else {
        readingPromises.push(getReading(deviceAddress, command, 'false'));
      }
    });
    // return after all promises complete
    Promise.all(readingPromises).then((readings) => {
      readings.forEach((reading, index) => {
        output.push({ address: addressList[index], deviceReading: reading });
      });
      if (output.length === addressList.length) {
        complete(output);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

async function initializePowerSupply(volt, curr) {
  const output = {
    Voltage: '',
    Current: '',
    Config: '',
  };
  const powerSupplyAddress = process.env.PPS;
  await sendCommand(powerSupplyAddress, 'OUTPut:TRACK 1');
  await sendCommand(powerSupplyAddress, `CH1:VOLTage ${volt}`);
  await sendCommand(powerSupplyAddress, `CH1:CURRent ${curr}`);
  output.Voltage = await getReading(powerSupplyAddress, 'VOLTage?', 'false');
  output.Current = await getReading(powerSupplyAddress, 'CURRent?', 'false');
  const statusCodes = await getReading(powerSupplyAddress, 'SYSTem:STATus?');
  output.Config = psStatus.readPowerSupplyStatus(hexHelper.hexToBinary(statusCodes));
  return output;
}

module.exports = {
  sendCommand, getReading, checkInsturments, infoCommand, initializePowerSupply,
};
