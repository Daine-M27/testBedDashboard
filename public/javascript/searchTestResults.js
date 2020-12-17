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
