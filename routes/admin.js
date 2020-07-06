const express = require('express');
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
  dbhelper.getTestTemplate().then((data) => {
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

module.exports = router;
