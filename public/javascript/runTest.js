/* eslint-disable no-console */
$('#confirmConnected').click(() => {
  console.log('confirmed button')
  $('#submit').prop('disabled', false);
});

$('#submit').click((event) => {
  event.preventDefault();
  $('#Status').removeClass('hidden')

  const values = $('#templateDropDown').val();
  const testTemplate = JSON.parse(values);
  console.log(testTemplate);
  // setup SSE
  const source = new EventSource("runTest/startTest/" + testTemplate.id.toString() + "/" + testTemplate.testName.toString() + "/" + testTemplate.wattage.toString() + "/");
  let url;
  source.addEventListener('message', (e) => {
    $('#messageBox').append(`${e.data}<br>`);

    if (e.data.includes('TestId') === true) {
      const data = JSON.parse(e.data);
      console.log('testId' + data.TestId);
      url = 'runTest/testResults/' + data.TestId;
      console.log(url);
      source.close();
      // document.location = url;
    }
  });

  source.addEventListener('error', (e) => {
    $('#messageBox').append(`${e.data}<br>`);
    source.close();
  })
});
