/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const orderSchema = new Schema({
  products:[
    {
      product: {
        type: Object,
        required: true
      },
      quantity:{
        type: Number,
        required: true
      },
    }
  ],
  user:{
    name:{
      type: String,
      required: true
    },
    userId:{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
});


module.exports=mongoose.model('Order',orderSchema)



/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE  

const Sequelize = require('sequelize');
const sequelize = require('../util/databas')


const Order = sequelize.define('order',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey:true,
  },

})

module.exports=Order

*/

