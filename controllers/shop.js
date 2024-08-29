/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const Product = require('../models/product');


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err=>console.log(err)) 
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err=>console.log(err))
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product)=> {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err=>console.log(err))
};
exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
  Product.findById(prodId).then(
    prod=>{
      return  req.user.addToCart(prod)
     
    }
  ).then(result=>{
    res.redirect('/cart');
  })
  .catch(err=>console.log(err))
  
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the error handling middleware
  }
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products=>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err=>console.log(err))
}

exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId)
    .then(result=>{
    res.redirect('/cart');

    })
    .catch(err=>console.log(err))
};

exports.postOrders = async (req, res, next) => {
  try {
   await req.user.addOrder()
    // Redirect to orders page
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware
  }
};


exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware
  }
};


/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE

const Product = require('../models/product');
const Cart = require('../models/cart');
const { where } = require('sequelize');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err=>console.log(err)) 
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findAll({where:{id:prodId}})
  .then((product)=> {
    res.render('shop/product-detail', {
      product: product[0],
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch(err=>console.log(err))
  // Product.findByPk(prodId).then(
  //   (product)=> {
  //     res.render('shop/product-detail', {
  //       product: product,
  //       pageTitle: product.title,
  //       path: '/products'
  //     });
  //   }
  // )
  // .catch(err=>console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err=>console.log(err))
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart=>{
    return cart.getProducts()
    .then(cartProducts=>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    })
    .catch(err=>console.log(err))
  }).catch(err=>console.log(err))
  
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: prodId } });
    let product;
    let newQuantity = 1;
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      newQuantity = product.cartItem.quantity + 1;
    } else {
      product = await Product.findByPk(prodId);
    }
    if (product) {
      await cart.addProduct(product, { through: { quantity: newQuantity } });
    }
    res.redirect('/cart');
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the error handling middleware
  }
};


exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const cart = await req.user.getCart();
  const products = await cart.getProducts({ where: { id: prodId } });
  if (products.length > 0) {
    const product = products[0];
    await product.cartItem.destroy(); 
  }
  res.redirect('/cart');
};

exports.postOrders = async (req, res, next) => {
  try {
    // Fetch the cart for the user
    const cart = await req.user.getCart();
    const products = await cart.getProducts();

    // Create a new order
    const order = await req.user.createOrder();
    
    // Add products to the order
    await order.addProducts(products.map(product => {
    product.orderItem = { quantity: product.cartItem.quantity };
    return product;
    }));

    // Clear the cart
    await cart.setProducts(null);

    // Redirect to orders page
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware
  }
};



exports.getOrders = async (req, res, next) => {
  try {
    // Fetch orders for the user, including associated products
    const orders = await req.user.getOrders({ include: ['products'] });

    // Render the orders page
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware
  }
};

*/

