/* eslint-disable no-console */
// MSSQL
const dotenv = require('dotenv').config({ path: require('find-config')('.env') });
const sql = require('mssql');

// use to check errors in dotenv
if (dotenv.error) {
  console.log(dotenv.error);
}
// console.log(dotenv.parsed);

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
};

const testTemplateObject = {
  TestName: 'template1',
  IsActive: 0,
};

const measurementTemplateObject = {
  TestTemplateId: 3,
  MeasurementName: 'Some Name Here',
  Dac0: '00',
  Bccu0: '00',
  PassLowCurrent0: '.5',
  PassHighCurrent0: '1.0',
  Dac1: '00',
  Bccu1: '00',
  PassLowCurrent1: '00',
  PassHighCurrent1: '00',
  Dac2: '00',
  Bccu2: '00',
  PassLowCurrent2: '00',
  PassHighCurrent2: '00',
  Dac3: '00',
  Bccu3: '00',
  PassLowCurrent3: '00',
  PassHighCurrent3: '00',
};

/**
 * This function takes values in an object consisting of
 * TestName, Wattage, and IsActive to create a new test template in the database.
 * @param {object} data
 */
async function insertTestTemplate(data) {
  console.log(`from insertTestTemplate ${data.IsActive}`);
  try {
    const pool = await sql.connect(config);
    const request = await pool.request()
      .input('TestName', sql.NVarChar(50), data.TestName)
      .input('Wattage', sql.Int, data.Wattage)
      .input('IsActive', sql.Bit, Number(data.IsActive))
      .execute('InsertTestTemplate');
    pool.close();
    return request;
  } catch (err) {
    console.log(`Insert Test Template Error: ${err}`);
    return err;
  }
}

/**
 * This function retuns a list of test templates, use the id to link measurement templates
 */
async function getTestTemplate() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .execute('getTestTemplate');
    pool.close();
    return result;
  } catch (err) {
    console.log(`Get Test Template Error: ${err}`);
    return err;
  }
}

/**
 * This function creates a new measurement template which is attached to a test template by the test
 * template ID.
 * @param {object} data
 */
async function insertMeasurementTemplate(data) {
  try {
    const pool = await sql.connect(config);
    const request = await pool.request()
      .input('TestTemplateId', sql.Int, data.TestTemplateId)
      .input('MeasurementName', sql.VarChar(50), data.MeasurementName)
      .input('Dac0', sql.Int, data.Dac0)
      .input('Bccu0', sql.Int, data.Bccu0)
      .input('PassLowCurrent0', sql.Decimal(10, 5), data.PassLowCurrent0)
      .input('PassHighCurrent0', sql.Decimal(10, 5), data.PassHighCurrent0)
      .input('Dac1', sql.Int, data.Dac1)
      .input('Bccu1', sql.Int, data.Bccu1)
      .input('PassLowCurrent1', sql.Decimal(10, 5), data.PassLowCurrent1)
      .input('PassHighCurrent1', sql.Decimal(10, 5), data.PassHighCurrent1)
      .input('Dac2', sql.Int, data.Dac2)
      .input('Bccu2', sql.Int, data.Bccu2)
      .input('PassLowCurrent2', sql.Decimal(10, 5), data.PassLowCurrent2)
      .input('PassHighCurrent2', sql.Decimal(10, 5), data.PassHighCurrent2)
      .input('Dac3', sql.Int, data.Dac3)
      .input('Bccu3', sql.Int, data.Bccu3)
      .input('PassLowCurrent3', sql.Decimal(10, 5), data.PassLowCurrent3)
      .input('PassHighCurrent3', sql.Decimal(10, 5), data.PassHighCurrent3)
      .execute('InsertMeasurementTemplate');
    pool.close();
    // console.log(request);
    return request;
  } catch (err) {
    console.log(`Insert Measurement Template Error: ${err}`);
    return err;
  }
}

/**
 * This function gets a measurement template with the test template id
 * @param {number} id
 */
async function getMeasurementTemplate(id) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('TestTemplateId', sql.Int, id)
      .execute('getMeasurementTemplate');
    pool.close();
    return result;
  } catch (err) {
    console.log(`Get Test Measurement Template Error: ${err}`);
    return err;
  }
}

module.exports = {
  insertTestTemplate, getTestTemplate, insertMeasurementTemplate, getMeasurementTemplate,
};

// getMeasurementTemplate(measurementTemplateObject.TestTemplateId)
//   .then((res) => { console.log(res); })
//   .catch((err) => { console.log(err); });

// insertTestTemplate(testTemplateObject).then(result => {

//     console.log("insert : "+ result)
//     getTestTemplate().then(res => {console.log(res)})
// });

// var database = getTestTemplate();

// result.then((database) => {console.log(database)})

// insertTestTemplate(testTemplateObject)

// function parametizer(object){
//     let output = {}
//     object.forEach(key => {

//     });
// }

// async function getData() {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request()
//             .input('id', sql.Int, 3)
//             .query('SELECT * FROM dbo.TestResults WHERE TestID = @id');

//         console.log(result.recordset[0].DAC_CUR_L_1);
//     } catch( err) {
//         console.log(err);
//     }
// }

// getData();
