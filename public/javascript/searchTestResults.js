$(() => {
  const idObjs = JSON.parse($('#BoardIdHolder').val());
  const arrayOfIds = [];
  idObjs.map((item) => {
    arrayOfIds.push(item.BoardId);
  });

  $('#BoardIdInput').autocomplete({
    source: arrayOfIds,
  });
});
