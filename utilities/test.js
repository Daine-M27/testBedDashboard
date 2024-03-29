/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const util = require('util');
const { ConnectionPool } = require('mssql');
const { reset } = require('nodemon');
const { searchDatabase, getTestsByDateRange, getMeasurementTemplate, insertTest, insertMeasurement, insertMeasurementTemplate, getTestById, getMeasurementsByTestId, getBoardIds } = require('./databaseHelpers');
const {
  decToHex2c, hexToBinary, rdmHexResponseParse, hexToAscii,
} = require('./hexHelpers');
const {
  RdmParamsObject, sendRDM, rdmDiscoverAddress, getFirmwareAndWattage, getSensorTemp, getAddress,
} = require('./rdmDmxHelpers');
const { getReading, checkInsturments, sendCommand } = require('./SCPIHelpers');
const xlsx = require('xlsx');
const dmx = require('./rdmDmxHelpers');
const qs = require('qs');
const axios = require('axios');

// 88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
const burnFolder = "C:\\FirmwareBurn";
var spawn = require('child_process').spawn,
ls = spawn('cmd.exe', ['/c', `cd ${burnFolder} && test.bat`]);

ls.stdout.on('data', function (data) {
console.log('stdout: ' + data);
});

ls.stderr.on('data', function (data) {
console.log('stderr: ' + data);
});

ls.on('exit', function (code) {
console.log('child process exited with code ' + code);
});

// async function getResults(bid, watt, fw, sd, ed) {
//   searchDatabase('', '', '', '', '').then((res) => {
//     console.log(res);
//   })
// }

// getResults();

// async function dmxTest() {
//   sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
//   const address = await getAddress();
//   const firmwareWattage = await getFirmwareAndWattage(address);
  
// }


// --------------------------------------------------------------------------------------------
// function getAddress() {
//   return new Promise((resolve, reject) => {
//     let counter = 0;
//     while (counter < 3) {
//       console.log('counter: '+counter);
//       counter += 1;
//       rdmDiscoverAddress()
//         .then((response) => {
//           console.log('response: '+ response)
//           if (response.length > 3) {
//             resolve(response);
//           }
//         });
//     }
//     if (counter > 3) {
//       reject();
//     }
//   });
// }

// async function getAddress() {
//   let counter = 0;
//   while (counter !== 3) {
//     const address = await rdmDiscoverAddress();
//     if (address.length > 3) {
//       return address;
//     }
//     counter += 1;
//   }
//   return 'No address found, check connection to device.';
// }

// getAddress()
//   .then((response) => getFirmwareAndWattage(response).then((res) => {
//     console.log(res);
//   }))
//   .catch(error => console.log(error))
// ------------------------------------------------------------------------------------------

// const rdmParams = {
//   command_class: '30',
//   destination: '7151:000099e4',
//   pid: '1000',
//   data: '00',
// };

// rdmDiscoverAddress().then((response) => console.log(response)).catch(err => console.log(err));

// ----------------------------------------------------------------------------------------

// const dmmAddresses = [
//   process.env.DMM_CHAN_0,
//   process.env.DMM_CHAN_1,
//   process.env.DMM_CHAN_2,
//   process.env.DMM_CHAN_3,
// ];

// checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').then(res => console.log(res));


//----------------------------------------------------------------------------------------
// const data = {
//   1: '255',
//   2: '255',
//   3: '0',
//   4: '0',
//   5: '0',
//   6: '0',
// };

// rdmDiscoverAddress().then(address => {
//   // console.log(address);
//   getSensorTemp('01', address).then((temp) => console.log(temp));
// });

// dmx.sendDMX(data);

// getBoardIds().then(response => console.log(response.recordset[0].BoardId));

// getTestsByDateRange('2020-07-23', '2020-08-06').then(response => console.log(response));
// getTestById(37)
//   .then((testResponse) => {
//     getMeasurementsByTestId(37)
//       .then((meausrementResponse) => {
//         var test = xlsx.utils.sheet_add_json(testResponse);
//         var measures = xlsx.utils.sheet_add_json(meausrementResponse);
//         var wb = xlsx.utils.book_new();

//         xlsx.utils.book_append_sheet(wb, test);
//         xlsx.utils.book_append_sheet(wb, measures);

//         var buf = xlsx.write(wb, {type: 'buffer', bookType: 'xlsx'})
//         //console.log(util.inspect(testResponse));
//         //console.log(util.inspect(meausrementResponse));
//         //console.log('done');


//       // res.render('.\\runTest\\testResults', { title: 'Test Results: '+ req.params.testId, testInfo: testResponse.recordset[0], measurementInfo: meausrementResponse.recordset });
//       });
//   });

// -----------------------------------------------------------------------------------------
// const infoRDM = {
//   command_class: '20',
//   destination: '7151:31323334',
//   pid: '00c0',
//   data: '',
// };
// const dmmAddresses = [
//   process.env.DMM_CHAN_0,
//   process.env.DMM_CHAN_1,
//   process.env.DMM_CHAN_2,
//   process.env.DMM_CHAN_3,
// ];

// sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
// checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').then(res => console.log(res));
// 7151:31323334
//getFirmwareAndWattage('7151:31323334').then(res => {console.log(res)})


// sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');    
//sendRDM(infoRDM).then(res => console.log(res))

//rdmDiscoverAddress().then(res => console.log(res))
//------------------------------------------------------------------------------------------


// const testData = {
//   TestTemplateId: '17',
//   TestTemplateName: 'InsertReturn Test',
//   DeviceWattage: '27',
//   DeviceFirmware: '108',
//   BoardId: '2160',
// };

// insertTest(testData).then(res => {
//   console.log(res[0].Id);
// })

//-----------------------------------------------------------------------------------------

// rdmDiscoverAddress().then((res) => {
//   getFirmwareAndWattage(res).then((data) => {
//     console.log(data);
//   });
// });
//-----------------------------------------------------------------------------------------
// const dmmAddresses = [
//   process.env.DMM_CHAN_0,
//   process.env.DMM_CHAN_1,
//   process.env.DMM_CHAN_2,
//   process.env.DMM_CHAN_3,
// ];
// const unlockCode = process.env.UNLOCK_CODE;

// /**
//  * This function uses a test template Id to get all measurement
//  * data and run each series of commands on DUT.
//  * @param {string} id
//  */
// async function runTestById(testTemplate) {
//   const output = [];
//   // get new test information

//   // create test in db

//   const dacBccuData = await getMeasurementTemplate(testTemplate.Id).catch((err) => { console.log(err); });
//   // console.log(dacBccuData);
//   const measurementTemplates = dacBccuData.recordset;
//   sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON').catch((err) => { console.log(err); });
//   const dutAddress = await rdmDiscoverAddress().catch((err) => { console.log(err); }); // '7151:31323334'

//   await getFirmwareAndWattage(dutAddress).then(async (res) => {
//     const testData = {
//       TestTemplateId: testTemplate.Id,
//       TestTemplateName: testTemplate.TestName,
//       DeviceWattage: res.wattage,
//       DeviceFirmware: res.firmware,
//       BoardId: dutAddress,
//     };

//     await insertTest(testData);
//   });
//   // for/of loop finishes one iteration before moving on.
//   for (const [index, template] of measurementTemplates.entries()) {
//     // add code to setup return object for db storage !!!!!!
//     output.push(template);

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

//     // const readings = await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').catch((err) => { console.log(err); });
//     await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true').then((readings) => {
//       for (let r = 0; r < readings.length; r += 1) {
//         output[index][`Current${r}`] = parseFloat(readings[r].deviceReading);
//       }
//       output[index].DidPass = 0;

//       insertMeasurement(output[index]);
//       // create measurement in db with output object;

//       // console.log(output)
//       // console.log(`name: ${template.MeasurementName}`);
//       // console.log(`readings: ${util.inspect(readings)}`);
//     });

//     // console.log(index)
//     // console.log(`name: ${template.MeasurementName}`);
//     // console.log(`readings: ${util.inspect(readings)}`);
//     // save to db here.
//   }
//   sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF').catch((err) => { console.log(err); });
// }
// sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
// runTestById({Id:'15', TestName: '150insertTest', Wattage:'150'});

//-------------------------------------------------------------------------------------------
// function getFirmwareAndWattage(address){
//   const infoRDM = {
//     command_class: '20',
//     destination: address,
//     pid: '00c0',
//     data: '',
//   };

//   // get firmware and wattage
//   sendRDM(infoRDM).then((res) => {
//    const fullResponse = hexToAscii(rdmHexResponseParse(res.response));
//    const individualData = fullResponse.split(" ");
//    console.log(individualData)
//   });
// }

// rdmDiscoverAddress().then((res) => {
//   getFirmwareAndWattage(res)
// });

// --------------------------------------------------------------------------------------------
// async function getTestData() {
//   const dacBccuData = await getMeasurementTemplate(15);
//   // console.log(dacBccuData);
//   const measurementTemplates = dacBccuData.recordset;
//   // const redHigh = Object.keys(dacBccuData.recordset[7]);

//   for (const template of measurementTemplates) {
//     const dacBccuHexObject = ['4c425646'];
//     const measurement = Object.keys(template);
//     for (let i = 0; i < measurement.length; i += 1) {
//       if (measurement[i].includes('Dac')) {
//         dacBccuHexObject.push(decToHex2c(template[measurement[i]]));
//       } else if (measurement[i].includes('Bccu')) {
//         dacBccuHexObject.push(`${decToHex2c(template[measurement[i]])}0000`);
//       }
//     }
//     console.log(dacBccuHexObject);

//     const rdmParams = {
//       command_class: '30',
//       destination: '7151:31323334',
//       pid: '8625',
//       data: dacBccuHexObject.join(''),
//     };
//     sendRDM(rdmParams);

//     const readings = await checkInsturments(addresses, 'MEASure:CURRent?', 'true'); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

//     console.log(`readings: ${util.inspect(readings)}`);
//   }

// for (let i = 0; i < redHigh.length; i += 1) {
//   if (redHigh[i].includes('Dac')) {
//     dacBccuHexObject.push(decToHex2c(dacBccuData.recordset[7][redHigh[i]]));
//   } else if (redHigh[i].includes('Bccu')) {
//     dacBccuHexObject.push(decToHex2c(dacBccuData.recordset[7][redHigh[i]]) + '0000');
//   }
// }
// console.log(dacBccuHexObject);

// const rdmObject = new RdmParamsObject('10', '7151:31323334', '1000', dacBccuHexObject.join(''));

// console.log(rdmObject);
// const rdmParams = {
//   command_class: '30',
//   destination: '7151:31323334',
//   pid: '8625',
//   data: dacBccuHexObject.join(''),
// };
// sendRDM(rdmParams);

// const readings = await checkInsturments(addresses, 'MEASure:CURRent?', 'true'); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

// console.log('readings: '+ util.inspect(readings));
// }

// getTestData();

// ------------------------------------------------------------------------------------

// const { checkInsturments, infoCommand, sendCommand, getReading } = require('./SCPIHelpers');
// const util = require('util');
// const { hexToBinary } = require('./hexHelpers');
// const { readPowerSupplyStatus } = require('./psStatusHelpers');
// const { sendRDM } = require('./rdmDmxHelpers');

// const addresses = ['TCPIP0::192.168.1.170', 'TCPIP0::192.168.1.10', 'TCPIP0::192.168.1.11', 'TCPIP0::192.168.1.12', 'TCPIP0::192.168.1.13'];

// const rdmParams = {
//   command_class: '30',
//   destination: '7151:31323334',
//   pid: '1000',
//   data: '01'
// };

// async function initializePowerSupply() {
//   await sendCommand('TCPIP0::192.168.1.170', 'OUTPut:TRACK 1');
//   await sendCommand('TCPIP0::192.168.1.170', 'CH1:VOLTage 24');
//   await sendCommand('TCPIP0::192.168.1.170', 'CH1:CURRent 3.2');
//   const reading1 = await getReading('TCPIP0::192.168.1.170', 'VOLTage?', 'false');
//   const reading2 = await getReading('TCPIP0::192.168.1.170', 'CURRent?', 'false');
//   const reading3 = await getReading(addresses[0], 'SYSTem:STATus?');
//   const reading3ToBinary = hexToBinary(reading3);
//   const binaryStatus = readPowerSupplyStatus(reading3ToBinary);
//   console.log(`Voltage Setting: ${reading1}`);
//   console.log(`Current Setting: ${reading2}`);
//   console.log(`Binary Code: ${reading3ToBinary}`);
//   console.log(`Device Status: ${binaryStatus}`);
// }

// initializePowerSupply();

// sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');

// setTimeout(() => {
//   sendRDM(rdmParams);
// }, 5000);

// ------------------------------------------------------------------------------------
// sendCommand(addresses[0], 'OUTPut CH1,ON')
//   .then(() => {
//     getReading(addresses[0], 'SYSTem:STATus?')
//     .then((response) => {
//       console.log(response);
//     });
//   });

// getReading(addresses[0], 'SYSTem:STATus?').then((response) => {
//           console.log(response);
//         });

//------------------------------------------------------
// Two working ways to use async function check instruments

// let checkData = [];
// const check = checkInsturments(addresses, infoCommand).then((res) => {
//     checkData = res;
//     console.log('res:' + util.inspect( checkData));
// });

// check

// async function getInstruments() {
//   const response = await checkInsturments(addresses, infoCommand);
//   const data = await response;
//   console.log(data);
//   return data;
// }

// getInstruments();

//--------------------------------------------------------

// function decToHex(num) {
//   const output = (num).toString(16);
//   // console.log(output.length / 4);
//   if ((output.length / 4).toString().includes('.25')) {
//     return `000${output}`;
//   } if ((output.length / 4).toString().includes('.5')) {
//     return `00${output}`;
//   } if ((output.length / 4).toString().includes('.75')) {
//     return `0${output}`;
//   }
//   return output;
// }

// console.log(decToHex(255));

// // MSSQL test
// const dotenv = require('dotenv').config({path: '..\\.env'});
// const sql = require('mssql');

// //use to check errors in dotenv
// if(dotenv.error){
//     console.log(dotenv.error)
// }
// console.log(dotenv.parsed);

// const config = {
//     user: process.env.SQL_USER,
//     password: process.env.SQL_PASSWORD,
//     server: process.env.SQL_SERVER,
//     database: process.env.SQL_DATABASE
// }
// async function getData() {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request()
//             .input('id', sql.Int, 3)
//             .query('SELECT * FROM dbo.TestResults WHERE TestID = @id');

//         console.log(result.recordset[0].DAC_CUR_L_1);
//     } catch( err) {
//         console.log(err);
//     }
// }

// getData();

// const qs = require('qs');
// const axios = require('axios');
// const green = {
//     1:'128',
//     2:'0',
//     3:'255',
//     4:'0',
//     5:'0',
//     6:'0'
// }

// const rdmParams = {
//     command_class:'10',
//     destination:'7151:31323334',
//     pid:'1000',
//     data: '01'
// }

// function sendDMX(params){
//     axios({
//         method: 'post',
//         url: 'http://127.0.0.1:5000/v1/dmx',
//         data: qs.stringify(params),
//         headers: {
//             'content-type':'application/x-www-form-urlencoded'
//         }
//     }).then((res)=>{
//         console.log(res.status);
//     }, (err) => {
//         console.log(err);
//     })
// }

// function sendRDM(params){
//     axios({
//         method: 'post',
//         url: 'http://127.0.0.1:5000/v1/rdm',
//         data: qs.stringify(params),
//         headers: {
//             'content-type':'application/x-www-form-urlencoded'
//         }
//     }).then((res)=>{
//         console.log(res.status);
//     }, (err) => {
//         console.log(err);
//     })
// }

// sendDMX(green);
// sendRDM(rdmParams);

// // Async / Await / Promise - version of SCPI function

// const net = require( "net" );

// function sendCommand( address, command ){
//     return new Promise(( resolve, reject ) => {
//         const cs = new net.Socket();
//         const params = {
//             "parameters": {
//                 "address": address,
//                 "command": command
//             }
//         };

//         function cleanUp() {
//             cs.destroy();
//             resolve();
//         }

//         cs.connect( 5001, "127.0.0.1", () => {
//             cs.write( JSON.stringify( params ));
//         })

//         cs.on( 'close', () => {
//             console.log("closing connection");
//             cleanUp();
//         })

//         cs.on( 'error', ( err ) => {
//             reject('error detected: '+ err )
//         })
//     })
// }

// function getReading( address, command, convert ){
//     return new Promise(( resolve, reject ) => {
//         const cs = new net.Socket();
//         const params = {
//             "parameters": {
//                 "address": address,
//                 "command": command,
//                 "convert": convert
//             }
//         };

//         function cleanUp( value ){
//             cs.destroy();
//             resolve(value);
//         }

//         cs.connect( 5001, "127.0.0.1", () => {
//             cs.write( JSON.stringify( params ));
//         })

//         cs.on( 'data', ( data ) => {
//             let reading = new TextDecoder().decode( data );
//             cleanUp(reading)
//         })

//         cs.on( 'close', () => {
//             console.log("closing connection");
//             cleanUp();
//         })

//         cs.on( 'error', ( err ) => {
//             reject( 'error detected: '+ err )
//         })
//     })
// }

// async function doIt(){
//     await sendCommand("TCPIP0::192.168.1.170", "OUTPut:TRACK 1");
//     await sendCommand("TCPIP0::192.168.1.170", "CH1:VOLTage 24");
//     await sendCommand("TCPIP0::192.168.1.170", "CH1:CURRent 3.2");
//     var reading1 = await getReading("TCPIP0::192.168.1.170", "VOLTage?", "false");
//     var reading2 = await getReading("TCPIP0::192.168.1.170", "CURRent?", "false");
//     console.log("Voltage Setting: " + reading1);
//     console.log("Current Setting: " + reading2);
// }

// doIt();

/*
good test using scpiHelper object to collect data and store it in the object.
use to collect readings as objects in variables that contain the parameters send and response
*/
// const scpi = require( "./SCPIHelper" );

// const queryDeviceID = "*IDN?";
// const queryCurrent = "CURRent?";
// const queryVoltage = "VOLTage?";

// const measureVolt = "MEASure:VOLTage?";
// const measureCurrent = "MEASure:CURRent?";
// const measurePower = "MEASure:POWEr?";

// const setCurrent = ( ch, val ) => {
//     return ( ch + ":CURRent " + val )
// };
// const setVoltage = ( ch, val ) => {
//     return ( ch + ":VOLTage " + val )
// };
// const setToSeries = "OUTPut:TRACK 1";

// const onOff = (position) => {
//     return ( "OUTPut CH1," + position )
// };

// const address = "TCPIP0::192.168.1.170";

// const initialPowerRoutine = () => {
//     let command = new scpi.sendCommand(address, queryDeviceID, "false");
//     setTimeout( runCommands, 3000 );
//     function runCommands(){
//         if (command.response.includes("SPD3XHCC4R0135")) {
//             // set values for initial power setup
//             scpi.sendCommand(address, setToSeries, "false");
//             scpi.sendCommand(address, setVoltage("CH1","24"));
//             scpi.sendCommand(address, setCurrent("CH1", "3.2"));

//             //check values for setup
//             let queryVolt = new scpi.sendCommand(address, queryVolt, "false");
//             let queryCurrent = new scpi.sendCommand(address, queryCurrent, "false");

//             if (queryVolt.response == "24" && queryCurrent.response == "3.2") {
//                 scpi.sendCommand(address, onOff("ON"), "false");
//                 return 0;
//             }
//             return 1;
//         }
//     }
// }

// module.exports = {
//     queryDeviceID, queryCurrent, queryVoltage, measureVolt, measureCurrent, measurePower, setCurrent, setVoltage, setToSeries, onOff, address, initialPowerRoutine
// }

/// ////////////////////////////////////////////////////////////

// const net = require("net");
// const client = new net.Socket();
// const params = {
//     "parameters": {
//         "address": "TCPIP0::192.168.1.170",
//         "command":"*IDN?",
//         "convert": "false"
//     }
// };

// const scpiData = () => {

//     client.connect(5001, "127.0.0.1", function(){
//         console.log("Connected to C# Socket");

//         //client.write("exit")
//     })

//     let payload = JSON.stringify(params);

//     client.write(payload);

// }

/// //////////////////////////////////////////////////////////////

// function testSCPI() {
//     let response = "";
// try {
//     client.connect(5001, "127.0.0.1", function(){
//         console.log("Connected to C# Socket");
//         let payload = JSON.stringify(params);

//         client.write(payload);
//         //client.write("exit")
//         client.on('data', (data) => {
//             let reading = new TextDecoder().decode(data);
//             //console.log(reading);
//             response = reading;

//             client.destroy();
//         })
//     })

//     client.on('error', (error) => {
//         console.log(error);
//     })

//     client.on('close', () => {
//         console.log("connection closed");
//     })

//     return response;

// } catch (error) {
//     console.log(error)
// }

// }

// var answer = testSCPI();
// module.exports = {testSCPI};
/// ////////////////////////////////////////////////////////////////

// write function to connect and send command with IPaddress parameters to c# SCPI server

// "command":"*IDN?",
// "command": "MEASure:VOLTage?",
// ""
