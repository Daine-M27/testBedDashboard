const net = require("net");


function sendCommand (address, command, convert) { 
    this.address = address;
    this.command = command;
    this.convert = convert;
    this.response;
        try {
            const params = {
                "parameters": {
                    "address": this.address,
                    "command": this.command,
                    "convert": this.convert
                }
            };            
            //initialize new socket
            const client = new net.Socket();

            // establish connection
            client.connect(5001, "127.0.0.1", function () {
                console.log("Connected to C# Socket");
                // convert json to pretty string
                let payload = JSON.stringify(params);
                console.log("sending payload: " + payload);
                // send payload to destination socket
                client.write(payload);                
            });

            // get response
            client.on('data', (data) => {
                // reading for sending a one way command should be 0 if no errors are detected in sending, otherwise it will be request specific
                let reading = new TextDecoder().decode(data);
                this.response = reading;
                client.destroy();
            });

            // close connection
            client.on('close', () => {
                console.log("connection closed");
                //return this.response;
            });

            // handle error from SCPI server
            // client.on('error', (error) => {
            //     console.log(error);
            //     this.res = error;
            //     return this.res;
            // });
        } catch (error) {
            // log error and return false
            console.log(error)
            //this.res = 1;
            this.response = error;
            //return this.response;
        }         
}    
module.exports = { sendCommand: sendCommand };
