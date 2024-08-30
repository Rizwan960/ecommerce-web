
/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */















/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE 

const getDb=require('../util/databas').getDb
const mongodb= require('mongodb')
class Product{
  constructor (title,price,description,imageUrl,id,userId){
    
  this.title=title;
  this.price=price;
  this.description=description;
  this.imageUrl=imageUrl;
  this._id= id ? new mongodb.ObjectId(id):null;
  this.userId=userId
}

  save(){
    const db=getDb();
    let dbOperation;
    if(this._id)
    {
      dbOperation = db.collection('products').updateOne({_id:this._id},{$set:this});
    }else{
      dbOperation = db.collection('products').insertOne(this);
    }
    return dbOperation
    .then((result) => {
      console.log(result)
  
    })
    .catch((err) => {
      console.log(err)
    });
    
  } 

  static fetchAll(){
    const db=getDb();
    return db.collection('products').find().toArray()
    .then(products=>{
      return products
    })
    .catch(err=>console.log(err))
  }

  static findById(prodId){
    const db=getDb();
    return db.collection('products').find({_id:new mongodb.ObjectId(prodId) }).next()
    .then(product=>{
      return product
    })
    .catch(err=>console.log(err))
  }

  static deleteById(prodId){
    const db=getDb();
    return db.collection('products').deleteOne({_id:new mongodb.ObjectId(prodId) })
    .then(product=>{
      return product
    })
    .catch(err=>console.log(err))
  }

}

module.exports=Product

*/


/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE


const Sequelize = require('sequelize')
const sequelize =require('../util/databas')


const Product = sequelize.define('product',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey:true,
  },
  title:Sequelize.STRING,
  price:{
    type:Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl:{
    type:Sequelize.STRING,
    allowNull: false
  },
  description:{
    type:Sequelize.TEXT,
    allowNull: false
  }
})

*/



