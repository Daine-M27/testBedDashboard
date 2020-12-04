/* eslint-disable no-alert */
// WebSocket settings
JSPM.JSPrintManager.auto_reconnect = true;
JSPM.JSPrintManager.start();
JSPM.JSPrintManager.WS.onStatusChanged = function () {
  if (jspmWSStatus()) {
    // get client installed printers
    JSPM.JSPrintManager.getPrinters().then((myPrinters) => {
      let options = '';
      for (let i = 0; i < myPrinters.length; i++) {
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
    const cpj = new JSPM.ClientPrintJob();
    // Set Printer type (Refer to the help, there many of them!)
    // if ($('#useDefaultPrinter').prop('checked')) {
    //   cpj.clientPrinter = new JSPM.DefaultPrinter();
    // } else {
    //   cpj.clientPrinter = new JSPM.InstalledPrinter($('#installedPrinterName').val());
    // }
    cpj.clientPrinter = new JSPM.DefaultPrinter();
    // Set content to print...
    // Create Godex EZPL commands for sample label

    const CR = "\x0D";
    // working format for C200X038YJT labels
    let cmds = `^Q10,3${  CR}`;
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

    cpj.printerCommands = cmds;
    // Send print job to printer!
    cpj.sendToClient();
  }
}
