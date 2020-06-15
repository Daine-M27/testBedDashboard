// Async / Await / Promise - version of SCPI function
const net = require( "net" );

/**
 * This function sends a command to the scpi server, no response from server
 * @param {string} address 
 * @param {string} command 
 */
function sendCommand( address, command ){
    return new Promise(( resolve, reject ) => {
        const cs = new net.Socket();
        const params = {
            "parameters": {
                "address": address,
                "command": command                
            }
        };

        function cleanUp() {
            cs.destroy();
            resolve();
        }

        cs.connect( 5001, "127.0.0.1", () => {
            cs.write( JSON.stringify( params ));
        })

        cs.on( 'close', () => {
            console.log("closing connection");
            cleanUp();
        })

        cs.on( 'error', ( err ) => {
            reject('error detected: '+ err )
        })
    })
}

/**
 * This function sends a command to the scpi server and gets a value in return
 * @param {string} address 
 * @param {string} command 
 * @param {string} convert 
 */
function getReading( address, command, convert ){
    return new Promise(( resolve, reject ) => {
        const cs = new net.Socket();
        const params = {
            "parameters": {
                "address": address,
                "command": command,
                "convert": convert                
            }
        };

        function cleanUp( value ){
            cs.destroy();
            resolve(value);
        }

        cs.connect( 5001, "127.0.0.1", () => {
            cs.write( JSON.stringify( params ));
        })

        cs.on( 'data', ( data ) => {
            let reading = new TextDecoder().decode( data );
            cleanUp(reading)
        })

        cs.on( 'close', () => {
            console.log("closing connection");
            cleanUp();
        })

        cs.on( 'error', ( err ) => {
            reject( 'error detected: '+ err )
        })  
    })
}


module.exports(sendCommand, getReading);




// old way created object that would hold response along with command that was sent.
// const net = require("net");


// function sendCommand (address, command, convert) { 
//     this.address = address;
//     this.command = command;
//     this.convert = convert;
//     this.response;
//         try {
//             const params = {
//                 "parameters": {
//                     "address": this.address,
//                     "command": this.command,
//                     "convert": this.convert
//                 }
//             };            
//             //initialize new socket
//             const client = new net.Socket();

//             // establish connection
//             client.connect(5001, "127.0.0.1", function () {
//                 console.log("Connected to C# Socket");
//                 // convert json to pretty string
//                 let payload = JSON.stringify(params);
//                 console.log("sending payload: " + payload);
//                 // send payload to destination socket
//                 client.write(payload);                
//             });

//             // get response
//             client.on('data', (data) => {
//                 // reading for sending a one way command should be 0 if no errors are detected in sending, otherwise it will be request specific
//                 let reading = new TextDecoder().decode(data);
//                 this.response = reading;
//                 client.destroy();
//             });

//             // close connection
//             client.on('close', () => {
//                 console.log("connection closed");
//                 //return this.response;
//             });

//             // handle error from SCPI server
//             // client.on('error', (error) => {
//             //     console.log(error);
//             //     this.res = error;
//             //     return this.res;
//             // });
//         } catch (error) {
//             // log error and return false
//             console.log(error)
//             //this.res = 1;
//             this.response = error;
//             //return this.response;
//         }         
// }    
// module.exports = { sendCommand: sendCommand };
