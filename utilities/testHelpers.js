/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({
  path: require('find-config')('.env'),
});
const { Console } = require('console');
const util = require('util');
const {
  getMeasurementTemplate,
  insertMeasurement,
  insertTest,
  insertDMXTest,
  insertDMXMeasurement,
} = require('./databaseHelpers');
const { decToHex2c } = require('./hexHelpers');
const {
  sendRDM,
  getSensorTemp,
  getAddress,
  rdmDiscoverAddress,
  getFirmwareAndWattage,
  getHardwareWattage,
  sendDMX,
} = require('./rdmDmxHelpers');
const {
  checkInstruments,
  initializePowerSupply,
  sendCommand,
} = require('./SCPIHelpers');

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
async function runTestById(
  testTemplate,
  dutAddress,
  firmware,
  wattage,
  client
) {
  // variables
  client.write('data: Test Started...\n\n');
  const output = [];
  client.write('data: Getting testing template from database...\n\n');
  const dacBccuData = await getMeasurementTemplate(testTemplate.id).catch(
    (err) => {
      console.log(err);
    }
  );
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
    client.write(`data: CommandValue = ${rdmParams.data}\n\n`);

    // get temperature
    await sendRDM(rdmParams)
      .then(() => {
        client.write('data: Gathering readings...\n\n');
      })
      .catch((err) => {
        console.log(err);
      });

    // ---------- add time delay at this point to allow led to reach operating temp ------------ //

    // get readings from multimeters
    await checkInstruments(dmmAddresses, 'MEASure:CURRent?', 'true').then(
      async (readings) => {
        let passFail = 0;
        for (let r = 0; r < readings.length; r += 1) {
          const reading = parseFloat(readings[r].deviceReading);
          const high = template[`PassHighCurrent${r}`];
          const low = template[`PassLowCurrent${r}`];
          output[index][`Current${r}`] = reading;
          client.write(`data: Current${r}: ${reading}\n\n`);
          if (reading <= high && reading >= low) {
            passFail += 1;
          }
          // console.log(template[`PassLowCurrent${r}`]);
          // console.log(template[`PassHighCurrent${r}`]);
        }

        // get Temperature readings
        const cpuTemp = await getSensorTemp('00', dutAddress);
        const ledTemp = await getSensorTemp('01', dutAddress);
        output[index].CPUTemp = cpuTemp;
        output[index].LEDTemp = ledTemp;
        client.write(`data: CPU Temp: ${cpuTemp}\n\n`);
        client.write(`data: LED Temp: ${ledTemp}\n\n`);

        // check for pass fail
        if (passFail !== 4) {
          output[index].DidPass = 0;
          client.write(
            'data: Failure detected: Current outside acceptable range!\n\n'
          );
        } else {
          output[index].DidPass = 1;
        }
        // console.log(output[index].DidPass);
        output[index].TestId = OutputTestId;

        // insert all data to db
        await insertMeasurement(output[index]);

        // console.log(output)
        console.log(`name: ${template.MeasurementName}`);
        console.log(`readings: ${util.inspect(readings)}`);
      }
    );
  }
  return output;
}

/**
 * This function runs a dmx test and writes results to the database
 * @param {array of objects} tests
 * @param {string} dutAddress
 * @param {Object} specs
 */
async function runDMXTest(tests, dutAddress, specs, client) {
  console.log(tests)
  function sleep(sec) {
    // client.write(`data: Delay value ${test.Delay} Min(s)`);
    // console.log('sleep', sec);
    return new Promise((resolve) => setTimeout(resolve, sec * 1000 * 60));
  }
  const { wattage, firmware } = specs;

  const testData = {
    DeviceWattage: wattage,
    DeviceFirmware: firmware,
    BoardId: dutAddress,
  };

  let outputTestId;
  const output = [];

  await insertDMXTest(testData).then((res) => {
    outputTestId = res[0].Id;
    console.log({ testId: outputTestId });
  });

  client.write('data: Test Started...\n\n');

  try {
    for (const [index, test] of tests.entries()) {
      client.write(`data: DMX Values White: ${test.White}, Red: ${test.Red}, Green: ${test.Green}, Blue: ${test.Blue}\n\n`);
      output.push({});
      // console.log(test, index);
      const data = {
        1: test.White,
        2: test.Red,
        3: test.Green,
        4: test.Blue,
        5: '0',
        6: '0',
      };
      // console.log('sendingDMX.....');
      client.write('data: Sending DMX command...');
      await sendDMX(data);
      
      await sleep(test.Delay);
      // console.log('checking instruments.....');
      await checkInstruments(dmmAddresses, 'MEASure:CURRent?', 'true').then(
        async (readings) => {
          // console.log(readings);
          for (let r = 0; r < readings.length; r += 1) {
            const reading = parseFloat(readings[r].deviceReading);
            // console.log(reading);
            output[index][`Current${r}`] = reading;
            // client.write(`data: Current${r}: ${reading}\n\n`);
          }

          const cpuTemp = await getSensorTemp('00', dutAddress);
          client.write(`data: CPU Temp: ${cpuTemp}\n\n`);
          // console.log(cpuTemp);
          const ledTemp = await getSensorTemp('01', dutAddress);
          client.write(`data: LED Temp: ${ledTemp}\n\n`);
          // console.log(ledTemp);

          output[index].WhiteValue = parseInt(test.White);
          output[index].RedValue = parseInt(test.Red);
          output[index].GreenValue = parseInt(test.Green);
          output[index].BlueValue = parseInt(test.Blue);
          output[index].DelayValue = parseInt(test.Delay);
          output[index].CPUTemp = cpuTemp;
          output[index].LEDTemp = ledTemp;

          output[index].TestId = outputTestId;
          console.log(output[index]);
          // insert all data to db
          await insertDMXMeasurement(output[index]);
        }
      );
    }
  } catch (error) {
    return error;
  }
  console.log(output);
  return output;
}
module.exports = { runTestById, runDMXTest };
