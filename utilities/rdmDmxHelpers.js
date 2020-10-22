/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const qs = require('qs');
const axios = require('axios');
const retry = require('axios-retry');
const util = require('util');
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
  retry(axios, { retries: 3 });
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/v1/dmx',
      data: qs.stringify(params),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => {
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * This function send commands via rdm and returns the response.
 * @param {rdmObject} params
 */
function getRDMResponse(params) {
  retry(axios, { retries: 3 });
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
      // console.log(`sendRDM: ${util.inspect(res.data)}`);
      // if (res.data.rdm_response_type === 'nack' || res.data.rdm_response_type === '' || res.data.rdm_response_type === null || res.data.rdm_response_type === 'none') {
      //   reject(res);
      // }
      resolve(res);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * This function retries getRDMResponse 3 time if the response type is incorrect
 * @param {object} params
 */
async function sendRDM(params) {
  console.log('sendRDM funciton running');
  let counter = 0;
  let res;
  while (counter !== 3) {
    res = await getRDMResponse(params);
    if (res.data.rdm_response_type === 'ack' || res.data.rdm_response_type === 'other') {
      // console.log(`good response:${res.data.rdm_response_type}`);
      return res;
    }
    console.log('Trying RDM again');
    counter += 1;
    console.log(`Send RDM counter: ${counter}`);
  }
  return res;
}


/**
 * This function get the address of a device if
 * there is only one device on the network.
 */
function rdmDiscoverAddress() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      retry(axios, { retries: 3 });
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
        // console.log(`${res.data.fixture_address} discover address`);
        const output = (res.data.fixture_address).split(' ').join('');
        // resolve with address formatted for rdm commands 'xxxx:xxxxxxxx'
        resolve(`${output.substr(0, 4)}:${output.substr(4)}`);
      }).catch((err) => {
        console.log(`rdmDiscover: ${err}`);
        reject(err);
      });
    }, 5000);
  });
}

/**
 * This function will retry rdmDiscoverAddress() 3 times then return an empty response
 * if no address is found.
 */
async function getAddress() {
  console.log('getAddress funciton running');
  let counter = 0;
  let address;
  while (counter !== 3) {
    address = await rdmDiscoverAddress();
    if (address.length > 3) {
      return address;
    }
    console.log('Trying address again');
    counter += 1;
    console.log(`counter: ${counter}`);
  }
  return address;
}

/**
 * This function takes an address and gets the firmware and wattage
 * of the device at the address.  Returns an object with firmware and wattage
 * @param {string} address
 */
function getFirmwareAndWattage(address) {
  console.log('getFirmware enter');
  return new Promise((resolve, reject) => {
    const infoRDM = {
      command_class: '20',
      destination: address,
      pid: '00c0',
      data: '',
    };

    // get firmware and wattage
    sendRDM(infoRDM).then((res) => {
      const fullResponse = hexToAscii(rdmHexResponseParse(res.data.response));
      const individualData = fullResponse.split(' ');
      resolve({
        firmware: individualData[0],
        wattage: individualData[1],
      });
    }).catch((err) => {
      console.log(`getfirmwarewattage reject${infoRDM.address}`);
      reject(err);
    });
  });
}

/**
 * This function gets a reading back from the rdm device
 * @param {number} sensor
 * @param {string} address
 */
function getTempReading(sensor, address) {
  return new Promise((resolve, reject) => {
    const tempRDM = {
      command_class: '20',
      destination: address,
      pid: '0201',
      data: sensor,
    };

    // get only current temp from board or led
    sendRDM(tempRDM).then(async (res) => {
      // console.log(`tempRes: ${util.inspect(res.data.rdm_response_type)}`);
      // console.log(`response full: ${res.data.response}`);
      const responseHex = rdmHexResponseParse(res.data.response);
      // console.log(`ResHex: ${util.inspect(responseHex)}`);
      const tempHex = responseHex.split(' ').join('').substring(2, 6);
      // console.log(`tempHex: ${tempHex}`);
      const decTemp = parseInt(tempHex, 16);
      // console.log(`decTemp: ${decTemp}`);
      resolve(decTemp);
    }).catch((err) => {
      console.log(`getTempError${err}`);
      reject(err);
    });
  });
}

/**
 * This function retries the getTempReading function if the data is incorrect or missing
 * @param {number} sensor
 * @param {string} address
 */
async function getSensorTemp(sensor, address) {
  console.log('getSensorTemp funciton running');
  let counter = 0;
  let temp;
  while (counter !== 3) {
    temp = await getTempReading(sensor, address);
    if (temp > 0 && temp < 90) {
      return temp;
    }
    console.log(`Trying temp again: ${temp}`);
    counter += 1;
    console.log(`counter: ${counter}`);
  }
  return temp;
}

module.exports = {
  sendDMX,
  sendRDM,
  RdmParamsObject,
  rdmDiscoverAddress,
  getFirmwareAndWattage,
  getSensorTemp,
  getAddress,
};
