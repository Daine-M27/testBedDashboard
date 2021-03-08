const express = require('express');
const fs = require('fs');
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

/* POST to create a test template. */
router.post('/createTest', (req, res) => {
  dbhelper.insertTestTemplate(req.body)
    .then(() => {
      res.redirect('/admin/createMeasurement');
    }).catch((err) => {
      console.log(`createTest POST error ${err}`);
    });
});

/* GET page for editing tests */
router.get('/editDeleteTest', (req, res) => {
  dbhelper.getTestTemplate()
    .then((data) => {
      res.render('.\\admin\\editDeleteTest', { title: 'Edit/Delete Test Template', templates: data.recordset, message: 'Edit name and submit to change.' });
    });
});

/* POST edits to test data or delete */
router.post('/editDeleteTest', (req, res) => {
  // console.log(req.body);
  if (req.body.delete === 'DELETE') {
    // console.log('delete')
    dbhelper.deleteTestTemplate(req.body)
      .then(() => {
        res.redirect('/admin/editDeleteTest');
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (req.body.testNameOriginal !== req.body.name) {
    dbhelper.editTestTemplate(req.body)
      .then(() => {
        res.redirect('/admin/editDeleteTest');
      })
      .catch((err) => {
        console.log(err);
      });
    //
    // if (req.body.testNameOriginal !== req.body.name) {
    //   dbhelper.editTestTemplate(req.body)
    //     .then(() => {
    //       res.redirect('/admin/editDeleteTest');
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // } else {
    //   res.redirect('/admin/editDeleteTest');
    // }
  } else {
    res.redirect('/admin/editDeleteTest');
  }
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

/* POST to create a measurement template. */
router.post('/createMeasurement', (req, res) => {
  dbhelper.insertMeasurementTemplate(req.body)
    .then(
      res.redirect('/admin/createMeasurement'),
    ).catch((err) => {
      console.log(`createMeasurement POST error ${err}`);
    });
});

/* GET page for editing measurements */
router.get('/editDeleteMeasurement', (req, res) => {
  dbhelper.getTestTemplate()
    .then((data) => {
    // console.log(data);
      res.render('.\\admin\\editDeleteMeasurement', { title: 'Edit/Delete Measurement', templates: data.recordset });
    }).catch((err) => {
      console.log(err);
    });
});

/* GET measurement templates from test template */
router.get('/getMeasurementTemplates', async (req, res) => {
  // send html of each template based on id of testTemplate
  const id = req.query.TestTemplateId;
  const testTemplates = await dbhelper.getTestTemplate();
  const rootTemplate = testTemplates.recordset
    .find((template) => template.Id.toString() === id.toString());

  // get all measurement templates from test id
  dbhelper.getMeasurementTemplate(id)
    .then((data) => {
      // console.log(data);
      res.render('.\\admin\\editDeleteMeasurement', {
        title: 'Edit/Delete Measurement',
        templates: testTemplates.recordset,
        measurementTemplates: data.recordset,
        selected: rootTemplate,
      });
    });
});

/* export values to an excel sheet */
router.post('/export', (req, res) => {
  dbhelper.getTestById(req.body.TestId)
    .then((testResponse) => {
      dbhelper.getMeasurementsByTestId(req.body.TestId)
        .then((meausrementResponse) => {
          const test = xlsx.utils.json_to_sheet(testResponse.recordset);
          const measures = xlsx.utils.json_to_sheet(meausrementResponse.recordset);
          const wb = xlsx.utils.book_new();
          const fileName = `Test${req.body.TestId}_Board${testResponse.recordset[0].BoardId.replace(':', '')}.xlsx`;

          xlsx.utils.book_append_sheet(wb, test, 'Test Data');
          xlsx.utils.book_append_sheet(wb, measures, 'Measurement Data');

          xlsx.writeFile(wb, fileName);
          // console.log(util.inspect(testResponse));
          // console.log(util.inspect(meausrementResponse));
          // console.log('done');
          res.download(fileName, (err) => {
            if (err) {
              console.log(err);
            }
            // delete file
            fs.unlink(fileName, (error) => {
              if (error) {
                console.log(error);
              }
            });
          });
        });
    });
});

module.exports = router;
