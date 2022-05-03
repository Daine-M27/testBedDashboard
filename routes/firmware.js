const { resolve } = require("dns");
const express = require("express");
const fs = require("fs");

const {
  initializePowerSupply,
  sendCommand,
  checkPSStatus,
} = require("../utilities/SCPIHelpers");
const fsPromises = fs.promises;

const firmwareFolder = "//192.168.0.76/ls/software/ledfirmware";
const burnFolder = "C:\\FirmwareBurn";

const router = express.Router();

/* GET firmware start page listing. */
router.get("/", async (req, res) => {
  let counter = 0;
  let fileCounter = 0;
  const outputObj = {};
  const mapObj = {
    "-": ".",
    _: " ",
    ".hex": "",
  };
  const conditionFilenames = (filename) => {
    return new Promise((resolve, reject) => {
      resolve({
        filename,
        displayText: filename.replace(/-|_|\.hex/g, (match) => mapObj[match]),
      });
    });
  };

  const folders = await fsPromises.readdir(`${firmwareFolder}`);

  const finalData = () => {
    return new Promise(async (resolve, reject) => {
      for (const folder of folders) {
        counter++;
        outputObj[folder] = [];
        const files = await fsPromises.readdir(`${firmwareFolder}/${folder}`);
        files.forEach(async (file) => {
          const conditionedFilename = await conditionFilenames(file);
          outputObj[folder].push(conditionedFilename);
        });
        //console.log(outputObj);
      }
      if (counter === folders.length) {
        resolve();
      }
    });
  };

  finalData().then(() => {
    console.log(outputObj);
    res.render(".\\firmware", {
      title: "Firmware to upload",
      firmwareObj: outputObj,
    });
  });
});

router.post("/installFirmware", async (req, res) => {
  const firmwareFile = Object.entries(req.body)[0][1];
  const firmwareDirectory = Object.entries(req.body)[0][0];
  const firmwareFilePath = `${firmwareFolder}/${firmwareDirectory}/${firmwareFile}`;
  console.log(firmwareFilePath);

  const burnFolder = "C:\\FirmwareBurn";
  const data = `Device XMC1402-0128\nSelectInterface SWD\nspeed 4000\nr\nloadfile ${firmwareFilePath}\nExit`;

  await fsPromises.writeFile(
    `${burnFolder}\\content\\command_file.jlink`,
    data,
    {
      encoding: "utf8",
      flag: "w",
      mode: 0o666,
    }
  );

  // Power Supply Config and Enable
  try {
    const volt = "26";
    const watt = "3.2";
    await initializePowerSupply(volt, watt);
    await sendCommand("TCPIP0::192.168.1.170", "OUTPut CH1,ON");
  } catch (err) {
    res.render(".\\error", {
      message: "Error Communicating with Power Supply",
      error: err,
    });
  }

  const status = await checkPSStatus();

  // check power supply status and then run firmware update
  if (status.Config[3] === "CH1 ON") {
    const spawn = require("child_process").spawn,
      ls = spawn("cmd.exe", ["/c", `cd ${burnFolder} && flash_firmware_X64.bat`]);

    ls.stdout.on("data", function (data) {
      console.log("stdout: " + data);
    });

    ls.stderr.on("data", function (data) {
      sendCommand("TCPIP0::192.168.1.170", "OUTPut CH1,OFF");
      console.log("child process exited with code " + code);
      console.log("stderr: " + data);
      res.render('..\\error', { title: 'Firmware Update Error', message: data });
    });

    ls.on("exit", function (code) {
      sendCommand("TCPIP0::192.168.1.170", "OUTPut CH1,OFF");
      console.log("child process exited with code " + code);
      res.render('.\\firmware\\updated', {title: '', message: `Firmware updated with ${firmwareFile}`})
    });
  } else {
    res.render('..\\error', { title: 'Power Supply Error', message: 'Check power supply status and try again' });
  }
});

module.exports = router;
