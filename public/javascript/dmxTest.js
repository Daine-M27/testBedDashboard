let testNumber = 1;

function addDMXTest () {
  const whiteValue = document.getElementById('white').value;
  const redValue = document.getElementById('red').value;
  const greenValue = document.getElementById('green').value;
  const blueValue = document.getElementById('blue').value;
  const delayValue = document.getElementById('delay').value;

  $('#testValues').append(`
    <div id='test${testNumber}' style='padding: 10px 10px 10px 10px; border: solid black 1px; margin-bottom: 6px; max-width: 901px'>
      <div style='padding-bottom:3px'>
        <div style="display:inline-block">
          <label for='whiteTest${testNumber}'> White Test Value
          <br>
          <input type='text' id='whiteTest${testNumber}' name='whiteTest${testNumber}'></input>
        </div>

        <div style="display:inline-block">
          <label for='redTest${testNumber}'> Red Test Value
          <br>
          <input type='text' id='redTest${testNumber}' name='redTest${testNumber}'></input>
        </div>        
        
        <div style="display:inline-block">
          <label for='greenTest${testNumber}'> Green Test Value
          <br>
          <input type='text' id='greenTest${testNumber}' name='greenTest${testNumber}'></input>
        </div>        
        
        <div style="display:inline-block">
          <label for='blueTest${testNumber}'> Blue Test Value
          <br>
          <input type='text' id='blueTest${testNumber}' name='blueTest${testNumber}'></input>
        </div>        
        
        <div style="display:inline-block">
          <label for='delayTest${testNumber}'> Delay Test Value
          <br>
          <input type='text' id='delayTest${testNumber}' name='delayTest${testNumber}'></input>
        </div>
      </div>              
      <button type='button' onclick='removeDMXTest("test${testNumber}")'>Remove Test</button>
    </div>
  `);

  document.getElementById(`whiteTest${testNumber}`).value = `${whiteValue}`;
  document.getElementById(`redTest${testNumber}`).value = `${redValue}`;
  document.getElementById(`greenTest${testNumber}`).value = `${greenValue}`;
  document.getElementById(`blueTest${testNumber}`).value = `${blueValue}`;
  document.getElementById(`delayTest${testNumber}`).value = `${delayValue}`;

  testNumber += 1;
}

function removeDMXTest(idValue) {
  $(`#${idValue}`).remove();
}

$('#submit').click((event) => {
  event.preventDefault();
  const formData = $('#form').serialize();
  $('#Status').removeClass('hidden');
  // setup SSE
  const source = new EventSource(`/runTest/runDMXTest?${formData}`);
  
  source.addEventListener('message', (e) => {
    if (!e.data.includes('TestId')) {
      $('#messageBox').append(`${e.data}<br>`);
    }

    if(e.data.includes('Finished')) {
      source.close();
    }

    // testId means test is complete
    if (e.data.includes('Address found:')) {
      const data = e.data.split(': ');
      devAddress = data[1];
    }

    if (e.data.includes('Device firmware:')) {
      const data = e.data.split(': ');
      devFirmware = data[1];
    }

    if (e.data.includes('Device wattage:')) {
      const data = e.data.split(': ');
      devWattage = data[1];
    }

    if (e.data.includes('Failure detected:')) {
      $('#messageBox').addClass('errorBorder');
    }

    if (e.data.includes('TestId') === true) {
      const data = JSON.parse(e.data);
      // console.log(`testId${data.TestId}`);
      url = `runTest/testResults/${data.TestId}`;
      console.log(url);
      source.close();

      // Enable buttons to continue with user flow
      $('#buttonBox > button:disabled').prop('disabled', false).removeClass('hidden');
    }


  });



  source.addEventListener('error', (e) => {
    $('#messageBox').append(`${e.data}<br>`);
    // autoScroll();
    source.close();
  });






});

// document.getElementById('submit').addEventListener('click', function(event){
//   event.preventDefault();
//   $('#Status').removeClass('hidden');
// });
