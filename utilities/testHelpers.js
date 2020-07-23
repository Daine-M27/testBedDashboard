/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const util = require('util');
const { getMeasurementTemplate, insertMeasurement, insertTest } = require('./databaseHelpers');
const { decToHex2c } = require('./hexHelpers');
const { sendRDM, rdmDiscoverAddress, getFirmwareAndWattage } = require('./rdmDmxHelpers');
const { checkInsturments, sendCommand } = require('./SCPIHelpers');

const dmmAddresses = [
  process.env.DMM_CHAN_0,
  process.env.DMM_CHAN_1,
  process.env.DMM_CHAN_2,
  process.env.DMM_CHAN_3,
];
const unlockCode = process.env.UNLOCK_CODE;

/**
 * This function uses a test template Id to get all measurement
 * data and run each series of commands on DUT.  It then saves all
 * measurements into the database
 * @param {string} id
 */
async function runTestById(testTemplate) {
  const output = [];
  // get new test information
  let OutputTestId = 0;
  // create test in db

  const dacBccuData = await getMeasurementTemplate(testTemplate.id).catch((err) => { console.log(err); });
  // console.log(dacBccuData);
  const measurementTemplates = dacBccuData.recordset;
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON').catch((err) => { console.log(err); });
  const dutAddress = await rdmDiscoverAddress().catch((err) => { console.log(err); }); // '7151:31323334'

  await getFirmwareAndWattage(dutAddress).then(async (res) => {
    const testData = {
      TestTemplateId: testTemplate.id,
      TestTemplateName: testTemplate.testName,
      DeviceWattage: res.wattage,
      DeviceFirmware: res.firmware,
      BoardId: dutAddress,
    };

    await insertTest(testData).then((res) => {
      // set output Id with return from insertTest
      OutputTestId = res[0].Id;
    });
  });
  // for/of loop finishes one iteration before moving on.
  for (const [index, template] of measurementTemplates.entries()) {
    // add code to setup return object for db storage !!!!!!
    output.push(template);

    const dacBccuHexObject = [unlockCode];
    const measurement = Object.keys(template);
    //
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
      destination: dutAddress,
      pid: '8625',
      data: dacBccuHexObject.join(''),
    };
    await sendRDM(rdmParams).catch((err) => { console.log(err); });
    await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').then((readings) => {
      for (let r = 0; r < readings.length; r += 1) {
        output[index][`Current${r}`] = parseFloat(readings[r].deviceReading);
      }
      output[index].DidPass = 0;
      output[index].TestId = OutputTestId;
      insertMeasurement(output[index]);
      // create measurement in db with output object;

      // console.log(output)
      // console.log(`name: ${template.MeasurementName}`);
      // console.log(`readings: ${util.inspect(readings)}`);
    });

    // console.log(index)
    // console.log(`name: ${template.MeasurementName}`);
    // console.log(`readings: ${util.inspect(readings)}`);
    // save to db here.
  }
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
}

module.exports = { runTestById };
// /**
//  * This function uses a test template Id to get all measurement
//  * data and run each series of commands on DUT.
//  * @param {string} id
//  */
// async function runTestById(id) {
//   const dacBccuData = await getMeasurementTemplate(id);
//   // console.log(dacBccuData);
//   const measurementTemplates = dacBccuData.recordset;
//   // for/of loop finishes one iteration before moving on.
//   for (const template of measurementTemplates) {
//     const dacBccuHexObject = [unlockCode];
//     const measurement = Object.keys(template);
//     for (let i = 0; i < measurement.length; i += 1) {
//       if (measurement[i].includes('Dac')) {
//         dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
//       } else if (measurement[i].includes('Bccu')) {
//         dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
//         // onOff time comes after bccu
//         dacBccuHexObject.push('0000');
//       }
//     }
//     // console.log(dacBccuHexObject);

//     // format rdm parameters
//     const rdmParams = {
//       command_class: '30',
//       destination: '7151:31323334',
//       pid: '8625',
//       data: dacBccuHexObject.join(''),
//     };
//     sendRDM(rdmParams);

//     const readings = await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true'); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

//     console.log(`readings: ${util.inspect(readings)}`);

//     // save to db here.
//   }
// }

// /**
//  * This function uses a test template Id to get all measurement
//  * data and run each series of commands on DUT.
//  * @param {string} id
//  */
// async function runTestById(id) {
//   const output = {};
//   const dacBccuData = await getMeasurementTemplate(id).catch((err) => { console.log(err); });
//   // console.log(dacBccuData);
//   const measurementTemplates = dacBccuData.recordset;
//   sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON').catch((err) => { console.log(err); });

//   const dutAddress = await rdmDiscoverAddress().catch((err) => { console.log(err); }); // '7151:31323334'

//   // for/of loop finishes one iteration before moving on.
//   for (const template of measurementTemplates) {
//     // add code to setup return object for db storage !!!!!!

//     const dacBccuHexObject = [unlockCode];
//     const measurement = Object.keys(template);
//     //
//     for (let i = 0; i < measurement.length; i += 1) {
//       if (measurement[i].includes('Dac')) {
//         dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
//       } else if (measurement[i].includes('Bccu')) {
//         dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
//         // onOff time comes after bccu
//         dacBccuHexObject.push('0000');
//       }
//     }
//     // console.log(dacBccuHexObject);

//     // format rdm parameters
//     const rdmParams = {
//       command_class: '30',
//       destination: dutAddress,
//       pid: '8625',
//       data: dacBccuHexObject.join(''),
//     };
//     await sendRDM(rdmParams).catch((err) => { console.log(err); });

//     const readings = await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').catch((err) => { console.log(err); }); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

//     console.log(`name: ${template.MeasurementName}`);
//     console.log(`readings: ${util.inspect(readings)}`);

//     // save to db here.
//   }

//   sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
// }
