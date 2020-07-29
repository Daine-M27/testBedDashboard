const express = require('express');
const xlsx = require('xlsx');
const dbhelper = require('../utilities/databaseHelpers');

const router = express.Router();

/* GET admin page. */
router.get('/', (req, res) => {
  res.render('.\\admin\\admin', { title: 'Admin Page' });
});

/* GET createTest page. */
router.get('/createTest', (req, res) => {
  res.render('.\\admin\\createTest', { title: 'Create Test' });
});

/* GET createMeasurement page. */
router.get('/createMeasurement', (req, res) => {
  dbhelper.getTestTemplate()
    .then((data) => {
    // console.log(data);
      res.render('.\\admin\\createMeasurement', { title: 'Create Measurement', templates: data.recordset });
    }).catch((err) => {
      console.log(err);
    });
});

/* POST to create a test template. */
router.post('/createTest', (req, res) => {
  dbhelper.insertTestTemplate(req.body)
    .then(() => {
      res.redirect('/admin/createMeasurement');
    }).catch((err) => {
      console.log(`createTest POST error ${err}`);
    });
});

/* POST to create a measurement template. */
router.post('/createMeasurement', (req, res) => {
  dbhelper.insertMeasurementTemplate(req.body)
    .then(
      res.redirect('/admin/createMeasurement'),
    ).catch((err) => {
      console.log(`createMeasurement POST error ${err}`);
    });
});

router.post('/export', (req, res) => {
  dbhelper.getTestById(req.body.TestId)
    .then((testResponse) => {
      dbhelper.getMeasurementsByTestId(req.body.TestId)
        .then((meausrementResponse) => {
          const test = xlsx.utils.json_to_sheet(testResponse.recordset);
          const measures = xlsx.utils.json_to_sheet(meausrementResponse.recordset);
          const wb = xlsx.utils.book_new();

          xlsx.utils.book_append_sheet(wb, test, 'Test Data');
          xlsx.utils.book_append_sheet(wb, measures, 'Measurement Data');

          xlsx.writeFile(wb, 'Export.xlsx');
          // console.log(util.inspect(testResponse));
          // console.log(util.inspect(meausrementResponse));
          // console.log('done');
          res.download('Export.xlsx');
        });
    });
})

module.exports = router;
