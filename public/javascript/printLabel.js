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
  const wattageString = watt;

  if (!fw || !watt || !addr) {
    alert(`Missing data for label!
    Firmware: ${fw}
    Wattage: ${watt}
    Address: ${addr}`);
    return;
  }

  const split = addr.split(":");
  const serial = parseInt(split[1], 16).toString();

  if (jspmWSStatus()) {
    // Create a ClientPrintJob
    const cpj = new JSPM.ClientPrintJob();

    if (watt === '150W') {
      wattageString = '100+';
    }

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
    cmds += `^W50${  CR}`; // label width in mm
    cmds += `^H10${  CR}`; // Darkness of print
    cmds += `^P1${  CR}`; // Number of copies
    cmds += `^S6${  CR}`; // Speed setting inch/sec
    cmds += `^R0${  CR}`; // Left margin
    cmds += `^D0${  CR}`; // labels per cut 0 is none
    cmds += `^E30${  CR}`; // Feed stop position
    cmds += `^L${  CR}`; // Normal or Inverse
    cmds += `AT,20,16,48,30,0,0B,0,0,${fw} ${wattageString} ${addr}${  CR}`; // Text format options
    cmds += `BA,280,50,2,6,30,0,3,${serial}${  CR}`;
    cmds += `E${  CR}`; // End

    cpj.printerCommands = cmds;
    // Send print job to printer!
    cpj.sendToClient();
  }
}
