$(() => {
  const idObjs = JSON.parse($('#BoardIdHolder').val());
  const fwObjs = JSON.parse($('#FirmWaresHolder').val());
  const wattObjs = JSON.parse($('#WattagesHolder').val());

  const arrayOfIds = [];
  const arrayOfFW = [];
  const arrayOfWattages = [];

  //------------------
  idObjs.map((item) => {
    arrayOfIds.push(item.BoardId);
  });

  $('#BoardIdInput').autocomplete({
    source: arrayOfIds,
  });

  //------------------
  fwObjs.map((item) => {
    arrayOfFW.push(item.DeviceFirmware);
  });

  $('#FirmWaresInput').autocomplete({
    source: arrayOfFW,
  });

  //------------------
  wattObjs.map((item) => {
    arrayOfWattages.push(item.DeviceWattage);
  });

  $('#WattagesInput').autocomplete({
    source: arrayOfWattages,
  });
});

function isNumber(input) {
  const rx = new RegExp(/^\d+$/);
  if (rx.test(input)) {
    return true;
  } return false;
}

$('#btn-submit').click(() => {
  const testNumber = $('#singleTest').val();
  if (isNumber(testNumber)) {
    window.location = `/runTest/testResults/${testNumber}`;
  } else {
    alert('Only accepst whole numbers, Please try again!');
  }
});
