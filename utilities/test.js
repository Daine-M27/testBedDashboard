const net = require("net");
const client = new net.Socket();

client.connect(5001, "127.0.0.1", function(){
    console.log("Connected to C# Socket");
    //            (IP address command, SCPI Command, Scientific Notation Convert)
    client.write("TCPIP0::192.168.1.170,*IDN?,false")
})

client.on('data', (data) => {
    let reading = new TextDecoder().decode(data)
    
    console.log(reading);
})

//write function to connect and send command with IPaddress parameters to c# SCPI server