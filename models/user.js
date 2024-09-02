/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  firstName: {
    type:String,
    required:true,
  },
  lastName: {
    type:String,
    required:true,
  },
  email: {
    type:String,
    required:true,
  },
  password: {
    type:String,
    required:true,
  },
  resetToken:String,
  resetTokenExpiration:Date,
  cart:{
    items:[
      {
        productId:{
          type: Schema.Types.ObjectId,
          ref:'Product',
          required: true
        },
        quantity:{
          type:Number,
          required: true
        }
      }
    ],

  },
});

userSchema.methods.addToCart= function(product){
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
      productId:product._id,
      quantity:newQuantity
    })
  }
  const updateCart={items:updateCartItem}
  this.cart=updateCart;
  return this.save()
}

userSchema.methods.getCart = function () {
  // Get product IDs from the cart
  const productIds = this.cart.items.map(item => item.productId);
  // Find products in the database
  return mongoose.model('Product').find({ _id: { $in: productIds } })
    .then(products => {
      // Map products to a dictionary for easy lookup
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      // Update cart items based on product stock
      const updatedCartItems = this.cart.items
        .map(cartItem => {
          const product = productMap.get(cartItem.productId.toString());
          if (product) {
            const maxAvailableQuantity = product.stock;
            if (maxAvailableQuantity <= 0) {
              // Skip items with no stock
              return null;
            } else if (cartItem.quantity > maxAvailableQuantity) {
              // Adjust quantity to available stock
              cartItem.quantity = maxAvailableQuantity;
            }
          } else {
            // Remove items with no corresponding product
            return null;
          }
          return cartItem;
        })
        .filter(cartItem => cartItem !== null); // Remove null items
      // Update the user's cart with the new items
      this.cart.items = updatedCartItems;
      return this.save().then(() => {
        // Return products with updated quantities
        return products.map(p => {
          const quantity = updatedCartItems.find(i => i.productId.toString() === p._id.toString())?.quantity || 0;
          return { ...p.toObject(), quantity };
        });
      });
    })
    .catch(err => {
      console.error(err);
      throw new Error('Failed to retrieve cart');
    });
};

userSchema.methods.deleteItemFromCart=function(productId){
  const updatedCartItems=this.cart.items.filter(items=>{
    return items.productId.toString() !== productId.toString();
  });
  this.cart.items=updatedCartItems;
  return this.save();
}

module.exports=mongoose.model('User',userSchema);


/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE 

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

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(product => product.productId);

    return db.collection('products')
        .find({ _id: { $in: productIds } })
        .toArray()
        .then(products => {
            // Map products to a dictionary for easy lookup
            const productMap = new Map(products.map(p => [p._id.toString(), p]));

            // Update cart items based on product stock
            const updatedCartItems = this.cart.items
                .map(cartItem => {
                    const product = productMap.get(cartItem.productId.toString());

                    if (product) {
                        // Check stock availability
                        const maxAvailableQuantity = product.stock;

                        if (maxAvailableQuantity <= 0) {
                            // Remove item from cart if stock is zero
                            return null;
                        } else if (cartItem.quantity > maxAvailableQuantity) {
                            // Update cart quantity if stock is less
                            cartItem.quantity = maxAvailableQuantity;
                        }
                    } else {
                        // Remove item from cart if product no longer exists
                        return null;
                    }

                    return cartItem;
                })
                .filter(cartItem => cartItem !== null); // Remove null items

            // Update the cart in the database
            return db.collection('users')
                .updateOne(
                    { _id: new ObjectId(this._id) },
                    { $set: { cart: { items: updatedCartItems } } }
                )
                .then(() => {
                    // Return the products with the updated quantities
                    return products.map(p => {
                        const quantity = updatedCartItems.find(i => i.productId.toString() === p._id.toString())?.quantity || 0;
                        return {
                            ...p,
                            quantity: quantity
                        };
                    });
                });
        })
        .catch(err => console.log(err));
}


  deleteItemFromCart(productId){
    const updatedCartItems=this.cart.items.filter(items=>{
      return items.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db.collection('users')
    .updateOne( 
      {_id:new ObjectId(this._id)},
      {$set:{cart:{items:updatedCartItems}}}
      )
  }

  addOrder() {
    const db = getDb();
  return this.getCart().then(products=>{
      const order = {
        items: products,
        user:{
        _id: new ObjectId(this._id),
        name: this.username
      }
    };
    return db.collection('orders')
        .insertOne(order)

    })
    .then(result => {
            this.cart = { items: [] };
            return db.collection('users')
                .updateOne(
                    { _id: new ObjectId(this._id) },
                    { $set: { cart: { items: [] } } }
                );
        })
        .catch(err => console.log(err));
}

  getOrders(){
    const db = getDb();
    return db.collection('orders').find({'user._id':new ObjectId(this._id)}).toArray();
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

*/

//------------------------------------------------------------------------------------------------------------------------------


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

