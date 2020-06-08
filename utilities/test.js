const net = require("net");
const client = new net.Socket();
const command = {
    "parameters": {
        "address": "TCPIP0::192.168.1.170",
        "command": "MEASure:VOLTage?",
        "convert": "false"
    }
};

client.connect(5001, "127.0.0.1", function(){
    console.log("Connected to C# Socket");
    let payload = JSON.stringify(command);
    //            (IP address command, SCPI Command, Scientific Notation Convert)
    //client.write("TCPIP0::192.168.1.170,*IDN?,false")
    client.write(payload);
    //client.write("exit")
})

client.on('data', (data) => {
    let reading = new TextDecoder().decode(data);    
    console.log(reading);
})

client.on('error', (error) => {
    console.log(error);
})

client.on('close', () =>{
    console.log("connection closed");
})

//write function to connect and send command with IPaddress parameters to c# SCPI server