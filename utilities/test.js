/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const util = require('util');
const { getMeasurementTemplate } = require('./databaseHelpers');
const { decToHex2c, hexToBinary, rdmHexResponseParse, hexToAscii } = require('./hexHelpers');
const { RdmParamsObject, sendRDM } = require('./rdmDmxHelpers');
const { getReading, checkInsturments, sendCommand } = require('./SCPIHelpers');
const { ConnectionPool } = require('mssql');

// 88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888

//-----------------------------------------------------------------------------------------
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
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,ON');
  
  for (const template of measurementTemplates) {
    // add code to setup return object for db storage !!!!!!

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
      destination: '7151:31323334',
      pid: '8625',
      data: dacBccuHexObject.join(''),
    };
    sendRDM(rdmParams);

    const readings = await checkInsturments(dmmAddresses, 'MEASure:CURRent?', 'true'); // await getReading(addresses[0], 'MEASure:CURRent?', 'true');

    // console.log(`readings: ${util.inspect(readings)}`);
    console.log(`name: ${template.MeasurementName}`);
    // save to db here.
  }
  
  sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
}
//sendCommand('TCPIP0::192.168.1.170', 'OUTPut CH1,OFF');
//runTestById('15');


const infoRDM = {
  command_class: '20',
  destination: '7151:31323334',
  pid: '00c0',
  data: '',
};

sendRDM(infoRDM).then((res) => {
  //console.log(res)
  //console.log(rdmHexResponseParse(res.response))
  console.log(hexToAscii(rdmHexResponseParse(res.response)));
});




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
