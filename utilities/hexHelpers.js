/**
 * This function returns a string in ascii format from a hex value
 * @param {string} inputHex
 */
const hexToAscii = (inputHex) => {
  // remove spaces if any exist
  // inputHex = inputHex.split(' ').join('');
  // convert to string incase its not already
  const hex = inputHex.split(' ').join('').toString();

  let asciiValue = '';

  for (let i = 0; i < hex.length; i += 2) {
    asciiValue += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return asciiValue;
};

/**
 * This function returns a section of a string based on index values
 * @param {string} inputString
 * @param {number} posStart
 * @param {number} posEnd
 */
const rdmHexResponseParse = (inputString, posStart, posEnd) => {
  // remove spaces from hex if any exist
  inputString = inputString.split(' ').join('');
  // set end position if one is not specified
  posEnd = posEnd || (inputString.length - 4);
  // remove segment of string
  const hexString = (inputString.toString()).substring(posStart, posEnd);

  return hexString;
};

/**
 * This function converts a decimal number into a Hex string in signed 2's complement format
 * @param {number} num 
 */
function decToHex(num) {
  const output = (num).toString(16);
  // console.log(output.length / 4);
  if (output.length % 4 === 0) {
    return output;
  } if ((output.length / 4).toString().includes('.25')) {
    return `000${output}`;
  } if ((output.length / 4).toString().includes('.5')) {
    return `00${output}`;
  } if ((output.length / 4).toString().includes('.75')) {
    return `0${output}`;
  }
}
module.exports = { hexToAscii, rdmHexResponseParse }