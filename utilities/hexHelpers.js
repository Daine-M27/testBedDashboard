/**
 * This function returns a string in ascii format from a hex value
 * @param {string} inputHex 
 */
const hexToAscii = inputHex => {
    let hex = inputHex.toString();
    let asciiValue = '';
    
    for (let i = 0; i < hex.length; i++) {
        str += String.fromCharCode(parseInt(hex.substr(n,2),16));        
    }
    
    return asciiValue;
}


/**
 * This function returns a section of a string based on index values
 * @param {string} inputString 
 * @param {number} posStart 
 * @param {number} posEnd 
 */
 const rdmHexResponseParse = (inputString, posStart, posEnd) => {
    // remove spaces from hex if any exist
    inputString = inputString.split(" ").join("");
    // set end position if one is not specified
    posEnd = posEnd || (inputString.length - 4);
    // remove segment of string
    let hexString = (inputString.toString()).substring(posStart, posEnd) 
   
    return hexString;
}


const _rdmHexResponseParse = rdmHexResponseParse;
const _hexToAscii = hexToAscii;
export { 
    _hexToAscii as hexToAscii,
    _rdmHexResponseParse as rdmHexResponseParse
};