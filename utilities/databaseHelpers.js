// MSSQL test
const dotenv = require('dotenv').config({path: '..\\.env'});
const sql = require('mssql');

// use to check errors in dotenv
// if(dotenv.error){
//     console.log(dotenv.error)
// }
// console.log(dotenv.parsed);

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE
}

const testTemplateObject = {
    "TestName": "template1",
    "IsActive" : 0
}


/**
 * This function takes values in an object to create a new test template in the database
 * @param {object} data 
 */
async function insertTestTemplate(data){    
    try {
        let pool = await sql.connect(config);
        let request = await pool.request()
            .input('TestName', sql.NVarChar(50), data.TestName)
            .input('IsActive', sql.Bit, data.IsActive )
            .execute('InsertTestTemplate');
        pool.close();        
    } catch (err) {
        console.log("Insert Test Template Error: " + err)
    }
}

async function getTestTemplate(){
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()            
            .execute('getTestTemplate');
        pool.close();
        return result;
    } catch (err) {
        console.log("Get Test Template Error: " + err)
    }
}

//underConstruction needs inputs 
async function insertMeasurementTemplate(data){

    try {
        let pool = await sql.connect(config);
        let request = await pool.request()
            .input( )
            .input( )
            .execute('InsertMeasurementTemplate');
        pool.close();
        console.log(request);
        return request;
    } catch (error) {
        console.log("Insert Measurement Template Error: " + err)
    }
}


insertTestTemplate(testTemplateObject).then(result => {
    
    console.log("insert : "+ result)
    getTestTemplate().then(res => {console.log(res)})
});

// var database = getTestTemplate();

// result.then((database) => {console.log(database)})




//insertTestTemplate(testTemplateObject)

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