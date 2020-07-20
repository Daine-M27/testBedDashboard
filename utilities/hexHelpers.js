/**
 * This function returns a string in ascii format from a hex value
 * @param {string} inputHex
 */
function hexToAscii(inputHex) {
  // remove spaces if any exist
  // inputHex = inputHex.split(' ').join('');
  // convert to string incase its not already
  const hex = inputHex.split(' ').join('').toString();

  let asciiValue = '';

  for (let i = 0; i < hex.length; i += 2) {
    asciiValue += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return asciiValue;
}

/**
 * This function returns a 10 digit binary number from hex input
 * @param {string} inputHex
 */
function hexToBinary(inputHex) {
  const output = (parseInt(inputHex, 16).toString(2)).padStart(10, 0);
  return output;
}

/**
 * This function returns a section of a string based on index values
 * @param {string} inputString
 * @param {number} posStart
 * @param {number} posEnd
 */
function rdmHexResponseParse(inputString) {
  // remove spaces from hex if any exist
  const rdmString = inputString.split(' ').join('');
  const start = 48;
  // set end position if one is not specified
  const stop = (rdmString.length - 4);
  // remove segment of string
  const hexString = (rdmString.toString()).substring(start, stop);

  return hexString;
}

/**
 * This function converts a decimal number into a Hex string in signed 2's complement format
 * @param {number} num
 */
function decToHex2c(num) {
  const output = (num).toString(16);
  // console.log(output.length / 4);
  if ((output.length / 4).toString().includes('.25')) {
    return `000${output}`;
  } if ((output.length / 4).toString().includes('.5')) {
    return `00${output}`;
  } if ((output.length / 4).toString().includes('.75')) {
    return `0${output}`;
  }
  return output;
}

module.exports = { hexToAscii, hexToBinary, rdmHexResponseParse, decToHex2c };
