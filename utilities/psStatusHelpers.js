/**
 * This function takes in a 10 digit binary number from the power supply and outputs
 * readable status for each bit
 * @param {string} binary
 */
function readPowerSupplyStatus(binary) {
  // split string into array and then revers to match pattern for bit position object
  const bitsArray = binary.split('').reverse();
  const bitPosition = {
    0: {
      0: 'CH1 CV mode',
      1: 'CH1 CC mode',
    },
    1: {
      0: 'CH2 CV mode',
      1: 'CH2 CC mode',
    },
    2: {
      0: 'Combine with bit 3',
      1: 'Combine with bit 3',
    },
    3: {
      0: 'Combine with bit 2',
      1: 'Combine with bit 2',
    },
    4: {
      0: 'CH1 OFF',
      1: 'CH1 ON',
    },
    5: {
      0: 'CH2 OFF',
      1: 'CH2 ON',
    },
    6: {
      0: 'TIMER1 OFF',
      1: 'TIMER1 ON',
    },
    7: {
      0: 'TIMER2 OFF',
      1: 'TIMER2 ON',
    },
    8: {
      0: 'CH1 digital display',
      1: 'CH1 waveform display',
    },
    9: {
      0: 'CH2 digital display',
      1: 'CH2 waveform display',
    },
  };

  const output = [];
  // console.log(bitsArray);

  for (let i = 0; i < bitsArray.length; i += 1) {
    if (i === 2) {
      if (bitsArray[2] === '0' && bitsArray[3] === '1') {
        output.push('Independent mode');
        i = 3;
      } else if (bitsArray[2] === '1' && bitsArray[3] === '0') {
        output.push('Parallel mode');
        i = 3;
      } else if (bitsArray[2] === '1' && bitsArray[3] === '1') {
        output.push('Series mode');
        i = 3;
      }
    } else {
      output.push(bitPosition[i][bitsArray[i]]);
    }
  }
  // console.log(output);
  return output;
}

module.exports = { readPowerSupplyStatus };
