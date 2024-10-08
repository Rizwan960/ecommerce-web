/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs')
const path = require('path');
const PDFDocument = require('pdfkit')
const stripe = require('stripe')("sk_test_51PvDBsRqKIvrZClg9ljEpoDKDcUjSOUFIr6f6HAXQAJBSW5yMMQVLJd7MBbBhL8K59D5iYjzt3mMMGzJziTZUhNd00YJq0cdTn")

const ITEMS_PER_PAGE=2;

exports.getProducts = (req, res, next) => {
  const page= +req.query.page||1;
  let totalItems;

  Product.find().countDocuments().then(numberOfProducts=>{
    totalItems=numberOfProducts
    return  Product.find()
    .skip((page-1)*ITEMS_PER_PAGE )
    .limit(ITEMS_PER_PAGE);
  })
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      totalProducts:totalItems,
      currentPage: page,
      hasNextPage:ITEMS_PER_PAGE*page<totalItems,
      hasPreviousPage: page>1,
      nextPage:page+1,
      previousPage:page-1,
      lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
     
    });
  })
  .catch(err=>console.log(err)) 
};

exports.getIndex = (req, res, next) => {
  const page= +req.query.page||1;
  let totalItems;
  Product.find().countDocuments()
  .then(numberOfProducts=>{
    totalItems=numberOfProducts
    return  Product.find()
    .skip((page-1)*ITEMS_PER_PAGE )
    .limit(ITEMS_PER_PAGE);
  })
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      totalProducts:totalItems,
      currentPage: page,
      hasNextPage:ITEMS_PER_PAGE*page<totalItems,
      hasPreviousPage: page>1,
      nextPage:page+1,
      previousPage:page-1,
      lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
    
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
      path: '/products',
     
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
    res.redirect('/cart',);
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
        products: products,
       
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
    const products = await req.user.getCart();

    const orderProducts = products.map(p => {
      return { product: {
        _id: p._id,
        title: p.title,
        price: p.price,
        description: p.description,
        imageUrl: p.imageUrl,
      }, quantity: p.quantity, };
    });

    const order = new Order({
      user: {
        name: '${req.user.firstName} ${req.user.lastName}',
        userId: req.user._id
      },
      products: orderProducts
    });

    await order.save();
    
    // Optionally, clear the cart after creating the order
    req.user.cart.items = [];
    await req.user.save();

    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    next(err); 
  }
};

exports.getOrders = async (req, res, next) => {
    Order.find({
      'user.userId':req.user._id
    }).
    then(orders=>{
      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated :req.session.isLoggedIn
      })
    }).catch(err=>console.log(err))
};

exports.getInvoice = async (req, res, next) => {
  // Use the below method to generate the pdf on the fly from the server which was not already saved
  const orderId=req.params.orderId;
  Order.findById(orderId).then(order=>{
    if(!order)
    {
      return next(new Error('no order found'))
    }
    if(order.user.userId.toString()!==req.user._id.toString())
    {
      return next(new Error('Unauthorized'))
    }
    const invoiceName = 'invoice-'+orderId+'.pdf';
    const invoicePath= path.join('data','invoices',invoiceName);
    const pdfDoc=new PDFDocument();
    res.setHeader('Content-Type','application/pdf')
    res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"', )
    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res)
    pdfDoc.fontSize(26).text('Invoice',{
      underline:true
    });
    pdfDoc.text('-------------------');
    let totalPrice=0;

    order.products.forEach(prod=>{
      totalPrice+=prod.quantity*prod.product.price
      pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + ' $ ' + prod.product.price)
    })
    pdfDoc.fontSize(14).text('Total Price: $ '+ totalPrice)
    pdfDoc.end();
  }).catch(err=>{
    next(err)
  })

  // Use the below method to serve the files which are already saved into some folders


  // const orderId=req.params.orderId;
  // Order.findById(orderId).then(order=>{
  //   if(!order)
  //   {
  //     return next(new Error('no order found'))
  //   }
  //   if(order.user.userId.toString()!==req.user._id.toString())
  //   {
  //     return next(new Error('Unauthorized'))
  //   }
  //   const invoiceName = 'invoice-'+orderId+'.pdf';
  //   const invoicePath= path.join('data','invoices',invoiceName);
    //-------------------------Read file for shorter file size----------------------
    // fs.readFile(invoicePath,(err,data)=>{
    //  if(err)
    //  {
    //  return next(err)
    //  }
    //  res.setHeader('Content-Type','application/pdf')
    //  // res.setHeader('Content-Disposition','attachment; filename="' + invoiceName + '"', )
    //  res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"', )
    //  res.send(data)
    // })
    //-------------------------More Appropriate  for larger file size----------------------
  //   const file = fs.createReadStream(invoicePath)
  //   res.setHeader('Content-Type','application/pdf')
  //   res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"', )
  //   file.pipe(res)
  // }).catch(err=>{
  //   next(err)
  // })

};

exports.getCheckout = async(req,res,next)=>{
  let totalPrice=0;
  req.user.getCart()
    .then(products=>{
      products.forEach(p=>{
        console.log(p);
        totalPrice+=p.quantity*p.price;
      });
      stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        line_items : products.map(p=>{
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.title,
                description: p.description,
              },
              unit_amount: p.price * 100,
            },
          
            quantity: p.quantity
          }
        }),
        mode: 'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      })
      .then(session=>{
        res.render('shop/checkout', {
          path: '/checkout',
          pageTitle: 'Checkout',
          products: products,
          totalSum: totalPrice,
          session: session.id
        });
      });
    }).catch(err=>console.log(err));
}



/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE 

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

 */

//------------------------------------------------------------------------------------------------------------------------------



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

