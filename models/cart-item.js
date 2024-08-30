/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE

const Sequelize = require('sequelize');
const sequelize = require('../util/databas')


const CartItem = sequelize.define('cartItem',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey:true,
  },
  quantity:Sequelize.INTEGER
})

module.exports=CartItem


*/