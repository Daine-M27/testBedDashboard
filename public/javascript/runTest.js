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
  let source = new EventSource("runTest/startTest/" + testTemplate.id.toString() + "/" + testTemplate.testName.toString() + "/" + testTemplate.wattage.toString() + "/");
  source.onmessage = (e) => {
    let url;
    // console.log(e.data);
    // console.log(typeof e.data);
    // add element html update to display message
    $('#messageBox').append(e.data + "<br>");
    // if (e.data === 'Test-Complete') {
    //   setTimeout(() => {
    //     source.close();
    //     console.log(url);
    //   }, 800);
    //   // document.location = url;
    // }
    if (e.data.includes('TestId') === true) {
      const data = JSON.parse(e.data);
      console.log('testId' + data.TestId);
      url = 'runTest/testResults/'+ data.TestId;
      console.log(url);
      source.close();
      document.location = url;
    }
  };
});
