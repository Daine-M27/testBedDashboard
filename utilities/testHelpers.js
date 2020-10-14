/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const util = require('util');
const { getMeasurementTemplate, insertMeasurement, insertTest } = require('./databaseHelpers');
const { decToHex2c } = require('./hexHelpers');
const { sendRDM, getSensorTemp } = require('./rdmDmxHelpers');
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
 * data and run each series of commands on DUT.  It then retireves
 * and saves all measurements into the database
 *
 */
async function runTestById(testTemplate, dutAddress, firmware, wattage, client) {
  // variables
  client.write('data: Test Started...\n\n');
  const output = [];
  client.write('data: Getting testing template from database...\n\n');
  const dacBccuData = await getMeasurementTemplate(testTemplate.id).catch((err) => { console.log(err); });
  const measurementTemplates = dacBccuData.recordset;
  const testData = {
    TestTemplateId: testTemplate.id,
    TestTemplateName: testTemplate.testName,
    DeviceWattage: wattage,
    DeviceFirmware: firmware,
    BoardId: dutAddress,
  };
  let OutputTestId = 0;

  // create test in db in order to get ID for measurements
  // client.write('data: Adding new test to database...\n\n');
  await insertTest(testData).then((res) => {
    // set output Id with return from insertTest
    OutputTestId = res[0].Id;
  });

  // for/of loop finishes one iteration before moving on.
  for (const [index, template] of measurementTemplates.entries()) {
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
    // format rdm parameters
    const rdmParams = {
      command_class: '30',
      destination: dutAddress,
      pid: '8625',
      data: dacBccuHexObject.join(''),
    };
    // send command to change light settings
    client.write('data: \n\n');
    client.write(`data: Testing ${template.MeasurementName}...\n\n`);
    await sendRDM(rdmParams).then(() => {
      // record CPU temp
      client.write('data: Gathering readings...\n\n');
      getSensorTemp('00', dutAddress).then((cpuTemp) => {
        client.write(`data: CPU Temp: ${cpuTemp}\n\n`);
        output[index].CPUTemp = cpuTemp;
      }).then(() => {
        // record LED temp
        getSensorTemp('01', dutAddress).then((ledTemp) => {
          client.write(`data: LED Temp: ${ledTemp}\n\n`);
          output[index].LEDTemp = ledTemp;
        });
      });
    }).catch((err) => { console.log(err); });

    // get readings from multimeters
    await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').then((readings) => {
      for (let r = 0; r < readings.length; r += 1) {
        const reading = parseFloat(readings[r].deviceReading);
        output[index][`Current${r}`] = reading;
        client.write(`data: Current${r}: ${reading}\n\n`);
      }
      // check for pass fail --- currently set to fail by default until values are available to check
      output[index].DidPass = 0;
      output[index].TestId = OutputTestId;

      // insert all data to db
      insertMeasurement(output[index]);
      // console.log(output)
      console.log(`name: ${template.MeasurementName}`);
      console.log(`readings: ${util.inspect(readings)}`);
    });
  }
  return output;
}

module.exports = { runTestById };
