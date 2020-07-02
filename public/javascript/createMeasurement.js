console.log("javascript dude")

$('#templateDropDown').on('change', () => {
  let value = ($('select option:selected').val());
  $('#testTemplateIdField').val(value);
});
