/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const getDb=require('../util/databas').getDb
const mongodb= require('mongodb')

const ObjectId = mongodb.ObjectId;

class User{
  constructor (username,email,cart,id){
    
  this.username=username;
  this.email=email;
  this.cart=cart
  this._id= id 
}

  save(){
    const db=getDb();
    return db.collection('users').insertOne(this)
  } 

  addToCart(product){
    const cartProductIndex = this.cart.items
    .findIndex(cp=>{
      return cp.productId.toString()===product._id.toString()
    })
    let newQuantity=1;
    const updateCartItem=[...this.cart.items]

    if(cartProductIndex>=0)
    {
      newQuantity= this.cart.items[cartProductIndex].quantity+1;
      updateCartItem[cartProductIndex].quantity=newQuantity;
    }else{
      updateCartItem.push({
        productId:new ObjectId(product._id),
        quantity:newQuantity
      })
    }
    const updateCart={items:updateCartItem}
    const db = getDb();
    return db.collection('users').updateOne({_id:new ObjectId(this._id)},{$set:{cart:updateCart}})
  }

  static findById(userId){
    const db=getDb();
    return db.collection('users') 
    .findOne({_id:new ObjectId(userId) })
    .then(product=>{
      return product
    })
    .catch(err=>console.log(err))
  }
}

module.exports=User


/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE

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


*/

