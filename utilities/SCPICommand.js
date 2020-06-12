// const net = require("net");
// const client = new net.Socket();

// function sendCommand(address, command, convert){
//     return new Promise((resolve, reject) => {
//         const params = {
//             "parameters": {
//                 "address": address,
//                 "command": command,
//                 "convert": convert
//             }
//         };            
    
//         let response = '';
        
//         // establish connection
//         client.connect(5001, "127.0.0.1", function () {
//             console.log("Connected to C# Socket");
//             // convert json to pretty string
//             let payload = JSON.stringify(params);
//             console.log("sending payload: " + payload);
//             // send payload to destination socket
//             client.write(payload);                
//         });
    
//         // get response
//         client.on('data', (data) => {
//             // reading for sending a one way command should be 0 if no errors are detected in sending, otherwise it will be request specific
//             let reading = new TextDecoder().decode(data);
//             // set response to reading
//             response = reading;
//             resolve();
//         });
    
//         // close connection
//         client.on('close', () => {
//             console.log("connection closed");        
//         });
    
//         // handle error from SCPI server
//         client.on('error', (error) => {
//             console.log( "Error: " + error );        
//         });    
    
//         return response;    
//     })
    
// }

// module.exports = { sendCommand };