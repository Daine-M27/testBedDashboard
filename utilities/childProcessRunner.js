// import { execFile as child } from 'child_process';
// const getCurrentPath = "somepath to exe here";
// const setVoltagePath = "somepath to exe here";
// const setCurrentPath = "somepath to exe here";


// const runSetVoltage = (argsGoHere) => {
//     const process = new child();
//     process(setVoltagePath, args, (err, response) => {
//         if (!err) {
//             return response
//         }
//         return err;
//     })
// } 

// const runSetCurrent = (argsGoHere) => {
//     const process = new child();
//     process(setCurrentPath, args, (err, response) => {
//         if (!err) {
//             return response
//         }
//         return err;
//     })
// }

// /**
//  * This function will run an executable file with a set of arguments
//  * @param {string} dmmAddress 
//  * @param {number} testID 
//  * @param {string} command 
//  * @param {string} dbColumnName 
//  */
// const runGetCurrent = (dmmAddress, testID, command, dbColumnName) => {
//     const args = [dmmAddress, testID, command, dbColumnName];
//     const process = new child();
//     process(getCurrentPath, args, (err, response) => {
//         if (!err) {
//             return response
//         }
//         return err;
//     })
// }

module.exports = { };
