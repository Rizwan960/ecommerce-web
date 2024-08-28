/* If you are using MongoDb use below method */

const mongodb=require('mongodb')
const MongoClient=mongodb.MongoClient

let _db;

const mongoConnect=(callback)=>{
MongoClient.connect('mongodb+srv://f2020065105:11223344@demoproject.wdsif.mongodb.net/?retryWrites=true&w=majority&appName=DemoProject')
.then((result) => {
    console.log("Connected")
    _db=result.db();
    callback(result)
}).catch((err) => {
    console.log(err)
    throw err;
    
});
}

const getDb=()=>{
    if(_db)
    {
        return _db;
    }
    else{
        throw "No database found"
    }
}

exports.mongoConnect=mongoConnect
exports.getDb=getDb


/*

If you are using MYSQL using SEQUELIZE use below method for connecting to Database

const Sequelize = require('sequelize')
const sequelize=new Sequelize('node-complete','root','11223344',{dialect:'mysql', host:'localhost'});
module.exports= sequelize;

*/
