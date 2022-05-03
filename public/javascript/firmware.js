$('#wattage').change(function(){
  console.log(this.value)

  $(`[id*='WattForm']`).addClass('hidden')
  $(`#${this.value}Form`).removeClass('hidden')
})



function messageBox(){
  
  $('#messageBox').append('<p>Loading Firmware....</p>')
}