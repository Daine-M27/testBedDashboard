let testNumber = 1;
const displayElement = document.getElementById('timer');


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

function resetPage() {
  console.log('reset page called');
  $('#submit').prop('disabled', true);
  // $('#Status').addClass('hidden');
  $('#messageBox').empty();
  // $('#messageBox').removeClass('errorBorder');
  // $('#buttonBox > button').prop('disabled', true).addClass('hidden');
  // $('#confirmConnected').prop('disabled', false);
}

function autoScroll() {
  const box = document.getElementById('messageBox');
  box.scrollTop = box.scrollHeight;
}

function CountDownTimer(duration, granularity) {
  this.duration = duration;
  this.granularity = granularity | 1000;
  this.tickFtns = [];
  this.running = false;
}

CountDownTimer.prototype.start = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  const start = Date.now();
  const that = this;
  let diff;
  let obj;

  (function timer() {
    diff = that.duration - (((Date.now() - start) / 1000) | 0);

    if (diff > 0) {
      setTimeout(timer, that.granularity);
    } else {
      diff = 0;
      that.running = false;
    }

    obj = CountDownTimer.parse(diff);
    that.tickFtns.forEach(function(ftn) {
      ftn.call(this, obj.minutes, obj.seconds);
    }, that);
  }());
};

CountDownTimer.prototype.onTick = function(ftn) {
  if (typeof ftn === 'function') {
    this.tickFtns.push(ftn);
  }
  return this;
};

CountDownTimer.prototype.expired = function() {
  return !this.running;
};

CountDownTimer.parse = function(seconds) {
  return {
    'minutes': (seconds / 60) | 0,
    'seconds': (seconds % 60) | 0
  };
};

function format(display) {
  return function (minutes, seconds) {
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.textContent = minutes + ":" + seconds;
  };
}

$('#submit').click((event) => {
  window.scrollTo(0, document.body.scrollHeight);
  event.preventDefault();
  resetPage();
  const formData = $('#form').serialize();
  $('#Status').removeClass('hidden');
  // setup SSE
  const source = new EventSource(`/runTest/runDMXTest?${formData}`);
  
  source.addEventListener('message', (e) => {
    autoScroll();
    if (!e.data.includes('TestId')) {
      $('#messageBox').append(`${e.data}<br>`);
    }

    if(e.data.includes('Finished')) {
      document.getElementById('Action').textContent = 'Finished Testing';
      $('#submit').prop('disabled', false);
      source.close();
    }

    if(e.data.includes('Measurement Delay')) {
      $('#timer').removeClass('hidden');
      document.getElementById('Action').textContent = '';
      const split = e.data.split(' ', 4);
      const delay = parseInt(split[2]*60);
      const timer1 = new CountDownTimer(delay);
      timer1.onTick(format(displayElement)).start();
    }

    if(e.data.includes('Taking Measurements')) {
      $('#timer').addClass('hidden');
      document.getElementById('Action').textContent = 'Measuring Current';
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
      // $('#buttonBox > button:disabled').prop('disabled', false).removeClass('hidden');
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
