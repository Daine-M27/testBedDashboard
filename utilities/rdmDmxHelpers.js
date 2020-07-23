/* eslint-disable no-console */
const qs = require('qs');
const axios = require('axios');
const util = require('util');
const { getTestTemplate, getMeasurementTemplate } = require('./databaseHelpers');
const { hexToAscii, rdmHexResponseParse } = require('./hexHelpers');

// const green = {
//   1: '128',
//   2: '0',
//   3: '255',
//   4: '0',
//   5: '0',
//   6: '0',
// };

// const rdmParams = {
//   command_class: '10',
//   destination: '7151:31323334',
//   pid: '1000',
//   data: '01',
// };

function RdmParamsObject(cc, des, pid, data) {
  this.command_class = cc;
  this.destination = des;
  this.pid = pid;
  this.data = data;
}

function sendDMX(params) {
  axios({
    method: 'post',
    url: 'http://127.0.0.1:5000/v1/dmx',
    data: qs.stringify(params),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  }).then((res) => res, (err) => {
    console.log(err);
  });
}

/**
 * This function send commands via rdm and returns the response.
 * @param {rdmObject} params
 */
function sendRDM(params) {
  // console.log(`function : ${util.inspect(params)}`);
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/v1/rdm',
      data: qs.stringify(params),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * This function get the address of a device if
 * there is only one device on the network.
 */
function rdmDiscoverAddress() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const discoverData = {
        destination: 'FFFF:FFFFFFFF',
        high: 'FFFF:FFFFFFFF',
        low: '0000:00000000',
      };

      axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/v1/rdm_discovery',
        data: qs.stringify(discoverData),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      }).then((res) => {
        const output = (res.data.fixture_address).split(' ').join('');
        // resolve with address formatted for rdm commands 'xxxx:xxxxxxxx'
        resolve(`${output.substr(0, 4)}:${output.substr(4)}`);
      }).catch((err) => {
        console.log(`rdmDiscover: ${err}`);
        reject(err);
      });
    }, 1000);
  });
}

/**
 * This function takes an address and gets the firmware and wattage
 * of the device at the address.  Returns an object with firmware and wattage
 * @param {string} address
 */
function getFirmwareAndWattage(address) {
  return new Promise((resolve, reject) => {
    const infoRDM = {
      command_class: '20',
      destination: address,
      pid: '00c0',
      data: '',
    };

    // get firmware and wattage
    sendRDM(infoRDM).then((res) => {
      const fullResponse = hexToAscii(rdmHexResponseParse(res.response));
      const individualData = fullResponse.split(' ');
      resolve({
        firmware: individualData[0],
        wattage: individualData[1],
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

module.exports = {
  sendDMX,
  sendRDM,
  RdmParamsObject,
  rdmDiscoverAddress,
  getFirmwareAndWattage,
};
