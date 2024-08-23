const mysql = require('mysql2')

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    database : 'node-complete',
    password : '11223344',
});

module.exports= pool.promise();