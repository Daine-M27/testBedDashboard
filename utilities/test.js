const scpi = require("./SCPIHelper");

const queryDeviceID = "*IDN?";
const queryCurrent = "CURRent?";
const queryVoltage = "VOLTage?";

const measureVolt = "MEASure:VOLTage?";
const measureCurrent = "MEASure:CURRent?";
const measurePower = "MEASure:POWEr?";

const setCurrent = ( ch, val ) => {
    return ( ch + ":CURRent " + val )
};
const setVoltage = ( ch, val ) => {
    return ( ch + ":VOLTage " + val )
};
const setOutput = "OUTPut:TRACK 1";

const onOff = (position) => {
    return ( "OUTPut CH1,"+position ) 
};

const address = "TCPIP0::192.168.1.170";

///////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////

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


//var answer = testSCPI();
//module.exports = {testSCPI};
///////////////////////////////////////////////////////////////////

//write function to connect and send command with IPaddress parameters to c# SCPI server

//"command":"*IDN?",
//"command": "MEASure:VOLTage?",
//""