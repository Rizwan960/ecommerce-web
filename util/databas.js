// const mysql = require('mysql2')
const Sequelize = require('sequelize')

const sequelize=new Sequelize('node-complete','root','11223344',{dialect:'mysql', host:'localhost'});
// const pool = mysql.createPool({
//     host : 'localhost',
//     user : 'root',
//     database : 'node-complete',
//     password : '11223344',
// });

module.exports= sequelize;