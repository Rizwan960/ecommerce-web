/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */

const Product = require('../models/product');
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product=new Product({
    title:title,
    price:price,
    description:description,
    imageUrl:imageUrl,
    userId: req.user
  });
  product.save()
  .then((ress)=>{
  console.log('Product Created Successfully');
  res.redirect('/admin/products')
  })
  .catch(err=>console.log(err))

};

exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err))
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {

    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err=>console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  Product.findById(prodId).then(product=>{
    product.title=updatedTitle;
    product.price=updatedPrice;
    product.updatedImageUrl=updatedImageUrl;
    product.description=updatedDesc;
    return product.save()

  }) .then(ress=>{
    console.log("Product Updated");
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  
  Product.findByIdAndDelete(prodId).then(ress=>{
    console.log("Product Deleted");
    res.redirect('/admin/products');

  })
  .catch(err=>console.log(err));
};


/*IF YOU ARE USING MONGODB USE BELOW METHOD TO CREATE TABLE STRUCTURE


const Product = require('../models/product');
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product=new Product(title,price,description,imageUrl,null,req.user._id);
  product.save()
  .then((ress)=>{
  console.log('Product Created Successfully');
  res.redirect('/admin/products')
  })
  .catch(err=>console.log(err))

};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err))
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {

    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err=>console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const product=new Product(updatedTitle,updatedPrice,updatedDesc,updatedImageUrl,prodId)
  return product.save()
  .then(ress=>{
    console.log("Product Updated");
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  
  Product.deleteById(prodId).then(ress=>{
    console.log("Product Deleted");
    res.redirect('/admin/products');

  })
  .catch(err=>console.log(err));
};

 */

//------------------------------------------------------------------------------------------------------------------------------

/* 
IF YOU ARE USING MYSQL AND SEQUELIZE USE BELOW METHOD TO CREATE TABLE STRUCTURE

const { where } = require('sequelize');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title:title,
    imageUrl:imageUrl,
    price:price,
    description:description,
  })
.then((ress)=>{
  console.log('Product Created Successfully');
  res.redirect('/admin/products')
})
.catch(err=>console.log(err))

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts({where:{id:prodId}})
  .then(products => {
    const product=products[0]
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err=>console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
Product.findByPk(prodId)
.then(product=>{
  product.title=updatedTitle;
  product.price=updatedPrice;
  product.imageUrl=updatedImageUrl;
  product.description=updatedDesc
  return product.save()
}).then(ress=>{
  console.log("Product Updated");
  res.redirect('/admin/products');

})
.catch(err=>console.log(err))
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
  .then(product=>{
  return product.destroy();
  }).then(ress=>{
    console.log("Product Deleted");
    res.redirect('/admin/products');

  })
  .catch(err=>console.log(err));
};



*/

