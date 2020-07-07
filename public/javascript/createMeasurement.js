// console.log("javascript dude")

$(document).ready(() => {
  if (window.localStorage.getItem('TestTemplateId')) {
    $('#testTemplateIdField').val(window.localStorage.getItem('TestTemplateId'));
    $('#templateDropDown').val(window.localStorage.getItem('TestTemplateId'));
  }
});

// get id and set id in storage
$('#templateDropDown').on('change', () => {
  const value = ($('select option:selected').val());
  $('#testTemplateIdField').val(value);

  // set local storage
  if (!window.localStorage.getItem('TestTemplateId') || window.localStorage.getItem('TestTemplateId') !== value) {
    window.localStorage.setItem('TestTemplateId', value);
  }
});
