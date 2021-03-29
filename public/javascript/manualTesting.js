$


$('#printLabelButton').click(function() {
  const printAddress = $(this).attr('data-address');
  const printFirmware = $(this).data('firmware');
  const printWattage = $(this).data('wattage');

  console.log(printAddress);
  console.log(printFirmware);
  console.log(printWattage);
  print(printFirmware, printWattage, printAddress);
})