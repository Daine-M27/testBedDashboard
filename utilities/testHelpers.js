/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const util = require('util');
const { getMeasurementTemplate } = require('./databaseHelpers');
const { decToHex2c } = require('./hexHelpers');
const { sendRDM } = require('./rdmDmxHelpers');
const { checkInsturments } = require('./SCPIHelpers');

const dmmAddresses = [
  process.env.DMM_CHAN_0,
  process.env.DMM_CHAN_1,
  process.env.DMM_CHAN_2,
  process.env.DMM_CHAN_3,
];
const unlockCode = process.env.UNLOCK_CODE;

/**
 * This function uses a test template Id to get all measurement
 * data and run each series of commands on DUT.
 * @param {string} id
 */
async function runTestById(id) {
  const dacBccuData = await getMeasurementTemplate(id);
  // console.log(dacBccuData);
  const measurementTemplates = dacBccuData.recordset;
  // for/of loop finishes one iteration before moving on.
  for (const template of measurementTemplates) {
    const dacBccuHexObject = [unlockCode];
    const measurement = Object.keys(template);
    for (let i = 0; i < measurement.length; i += 1) {
      if (measurement[i].includes('Dac')) {
        dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
      } else if (measurement[i].includes('Bccu')) {
        dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
        // onOff time comes after bccu
        dacBccuHexObject.push('0000');
      }
    }
    // console.log(dacBccuHexObject);

    // format rdm parameters
    const rdmParams = {
      command_class: '30',
      destination: '7151:31323334',
      pid: '8625',
      data: dacBccuHexObject.join(''),
    };
    sendRDM(rdmParams);

    const readings = await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true'); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

    console.log(`readings: ${util.inspect(readings)}`);
    
    // save to db here.
  }
}

module.exports = { runTestById };
