/* eslint-disable no-alert */
// WebSocket settings
JSPM.JSPrintManager.auto_reconnect = true;
JSPM.JSPrintManager.start();
JSPM.JSPrintManager.WS.onStatusChanged = function () {
  if (jspmWSStatus()) {
    // get client installed printers
    JSPM.JSPrintManager.getPrinters().then(function (myPrinters) {
      var options = '';
      for (var i = 0; i < myPrinters.length; i++) {
        options += `<option>${  myPrinters[i]  }</option>`;
      }
      $('#installedPrinterName').html(options);
    });
  }
};

// Check JSPM WebSocket status
function jspmWSStatus() {
  if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Open) {
    return true;
  }
  if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Closed) {
    alert('JSPrintManager (JSPM) is not installed or not running! Download JSPM Client App from https://neodynamic.com/downloads/jspm');
    return false;
  }
  if (JSPM.JSPrintManager.websocket_status == JSPM.WSStatus.Blocked) {
    // eslint-disable-next-line no-alert
    alert('JSPM has blocked this website!');
    return false;
  }
}

// function print(fw, watt, addr) {
//     console.log(fw + watt + addr)
// }

// Do printing...
function print(fw, watt, addr) {
  if (!fw || !watt || !addr) {
    alert(`Missing data for label!
    Firmware: ${fw}
    Wattage: ${watt}
    Address: ${addr}`);
    return;
  }
  if (jspmWSStatus()) {
    // Create a ClientPrintJob
    var cpj = new JSPM.ClientPrintJob();
    // Set Printer type (Refer to the help, there many of them!)
    // if ($('#useDefaultPrinter').prop('checked')) {
    //   cpj.clientPrinter = new JSPM.DefaultPrinter();
    // } else {
    //   cpj.clientPrinter = new JSPM.InstalledPrinter($('#installedPrinterName').val());
    // }
    cpj.clientPrinter = new JSPM.DefaultPrinter();
    // Set content to print...
    // Create Godex EZPL commands for sample label

    var CR = "\x0D";
    // working format for C200X038YJT labels
    var cmds = `^Q10,3${  CR}`;
    cmds += `^W50${  CR}`;
    cmds += `^H10${  CR}`;
    cmds += `^P1${  CR}`;
    cmds += `^S6${  CR}`;
    cmds += `^R0${  CR}`;
    cmds += `^D0${  CR}`;
    cmds += `^E30${  CR}`; // Feed stop position        
    cmds += `^L${  CR}`;        
    cmds += `AT,20,30,48,48,0,0B,0,0,${fw} ${watt} ${addr}${  CR}`;
    cmds += `E${  CR}`;


    // var cmds = "^Q100,0,0" + CR;
    // cmds += "^W102" + CR;
    // cmds += "^H5" + CR;
    // cmds += "^P1" + CR;
    // cmds += "^S4" + CR;
    // cmds += "^AD" + CR;
    // cmds += "^C1" + CR;
    // cmds += "^R0" + CR;
    // cmds += "~Q+0" + CR;
    // cmds += "^O0" + CR;
    // cmds += "^D0" + CR;
    // cmds += "^E15" + CR;
    // cmds += "~R200" + CR;
    // cmds += "^L" + CR;
    // cmds += "Dy4-me-dd" + CR;
    // cmds += "Th:m:s" + CR;
    // cmds += "Lo,294,12,297,633" + CR;
    // cmds += "BG,428,32,2,5,100,0,1,12345678901212345" + CR;
    // cmds += "BQ,148,184,3,7,100,1,1,CODE128" + CR;
    // cmds += "BH,288,212,3,7,100,1,1,12345678901" + CR;
    // cmds += "AG,358,175,1,1,0,0,GODEX EZPL" + CR;
    // cmds += "BA,448,461,2,6,95,0,1,CODE39" + CR;
    // cmds += "AB,14,22,2,2,0,0,SOME TEXT" + CR;
    // cmds += "Lo,296,164,799,165" + CR;
    // cmds += "Lo,296,268,799,269" + CR;
    // cmds += "AA,306,38,1,1,0,0,EAN13 ADD5" + CR;
    // cmds += "W449,296,5,1,M,8,4,17,0" + CR;
    // cmds += "QRCODE 0123456789" + CR;
    // cmds += "XRB591,297,4,0,21" + CR;
    // cmds += "DATAMATRIX 0123456789" + CR;
    // cmds += "E" + CR;

    cpj.printerCommands = cmds;
    // Send print job to printer!
    cpj.sendToClient();
  }
}
