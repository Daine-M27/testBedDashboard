const { resolve } = require("dns");
const express = require("express");
const fs = require("fs");
const fsPromises = fs.promises;

const firmwareFolder = "//192.168.0.76/ls/software/ledfirmware";
const _40watt = "40Watt";
const _80watt = "80Watt";
const _120watt = "120Watt";
const _150watt = "150Watt";

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
      resolve({filename, displayText: filename.replace(/-|_|\.hex/g, (match) => mapObj[match])})
    })
  }

  const folders = await fsPromises.readdir(`${firmwareFolder}`)
  
  const finalData = () => {
    return new Promise(async (resolve, reject) => {
      for (const folder of folders) {        
          counter ++;
          outputObj[folder] = [];
          const files = await fsPromises.readdir(`${firmwareFolder}/${folder}`)
          files.forEach(async file => {
            const conditionedFilename = await conditionFilenames(file)
            outputObj[folder].push(conditionedFilename);
          })
          //console.log(outputObj);
        };
        if (counter === folders.length) {
          resolve();
        }        
      }
    )
  }

  await finalData().then(() => {
    console.log(outputObj);
    res.render('.\\firmware', { title: 'Firmware Upload', firmwareObj: outputObj });
  })
});

module.exports = router;
