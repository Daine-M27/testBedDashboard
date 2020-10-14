/* eslint-disable no-undef */
/* eslint-disable no-console */
let url;
function resetPage() {
  $('#submit').prop('disabled', true);
  $('#Status').addClass('hidden');
  $('#messageBox').empty();
  $('#newTestYes').prop('disabled', true).addClass('hidden');
  $('#newTestNo').prop('disabled', true).addClass('hidden');
}

$('#confirmConnected').click(() => {
  console.log('confirmed button')
  $('#submit').prop('disabled', false);
});

$('#newTestYes').click((event) => {
  event.preventDefault();
  resetPage();
});

$('#newTestNo').click((event) => {
  event.preventDefault();
  document.location = '/';
});

$('#testResultsYes').click((event) => {
  event.preventDefault();
  document.location = url;
});

$('#submit').click((event) => {
  event.preventDefault();
  $('#Status').removeClass('hidden');
  const values = $('#templateDropDown').val();
  const testTemplate = JSON.parse(values);
  // console.log(testTemplate);

  // setup SSE
  const source = new EventSource(`runTest/startTest/${testTemplate.id.toString()}/${testTemplate.testName.toString()}/${testTemplate.wattage.toString()}/`);

  source.addEventListener('message', (e) => {
    if (!e.data.includes('TestId')) {
      $('#messageBox').append(`${e.data}<br>`);
    }
    $(document).scrollTop($(document).height());

    // testId means test is complete
    if (e.data.includes('TestId') === true) {
      const data = JSON.parse(e.data);
      // console.log(`testId${data.TestId}`);
      url = `runTest/testResults/${data.TestId}`;
      console.log(url);
      source.close();

      // Enable buttons to continue with user flow
      $('#buttonBox > button:disabled').prop('disabled', false).removeClass();
      // $('#newTestYes').prop('disabled', false).removeClass('hidden');
      // $('#newTestNo').prop('disabled', false).removeClass('hidden');
    }
  });

  source.addEventListener('error', (e) => {
    $('#messageBox').append(`${e.data}<br>`);
    source.close();
    resetPage();
  });
});
