
/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const getDb=require('../util/databas').getDb
class Product{
  constructor (title,price,description,imageUrl){
    
  this.title=title;
  this.price=price;
  this.description=description;
  this.imageUrl=imageUrl
}

save(){}
}



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

module.exports=Product

*/

