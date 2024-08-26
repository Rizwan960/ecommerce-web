const Sequelize = require('sequelize')
const sequelize =require('../util/databas')


const User = sequelize.define('user',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey:true,
  },
  name:Sequelize.STRING,
  email:{
    type:Sequelize.STRING,
    allowNull: false
  },

})

module.exports=User