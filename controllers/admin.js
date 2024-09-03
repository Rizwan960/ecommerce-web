/*IF YOU ARE USING MONGODB with Mongoose USE BELOW METHOD TO CREATE TABLE STRUCTURE */
const { validationResult } = require('express-validator')
const mongoose = require('mongoose');
const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
    
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
          hasError: true,
          product: {
              title: req.body.title,
              imageUrl: req.body.imageUrl,
              price: req.body.price,
              description: req.body.description
          },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
      });
  }
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
  .catch(err=>{
    const error = new Error(err);
    error.httpStatusCode=500;
    return next(error); 
  })

};

exports.getProducts = async (req, res, next) => {
  try {
      const products = await Product.find({ userId: req.user._id });
      res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products',
          errorMessage: null
      });
  } catch (err) {
      console.error('Error fetching products:', err);
      const error = new Error('Fetching products failed.');
      error.httpStatusCode = 500;
      return next(error);
  }
};


exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit === 'true';
  if (!editMode) {
      return res.redirect('/');
  }
  const prodId = req.params.productId;
  try {
      const product = await Product.findById(prodId);
      if (!product) {
          return res.redirect('/');
      }
      res.render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          hasError: false,
          product,
          errorMessage: null,
          validationErrors: []
      });
  } catch (err) {
      console.error('Error fetching product for edit:', err);
      const error = new Error('Fetching product failed.');
      error.httpStatusCode = 500;
      return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: true,
          hasError: true,
          product: { _id: productId, title, imageUrl, price, description },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
      });
  }

  try {
      const product = await Product.findById(productId);
      if (!product) {
          return res.redirect('/');
      }
      if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect('/');
      }
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      await product.save();
      console.log('Product Updated Successfully');
      res.redirect('/admin/products');
  } catch (err) {
      console.error('Error updating product:', err);
      const error = new Error('Updating product failed.');
      error.httpStatusCode = 500;
      return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
      const result = await Product.deleteOne({ _id: prodId, userId: req.user._id });
      if (result.deletedCount === 0) {
          return res.redirect('/');
      }
      console.log('Product Deleted Successfully');
      res.redirect('/admin/products');
  } catch (err) {
      console.error('Error deleting product:', err);
      const error = new Error('Deleting product failed.');
      error.httpStatusCode = 500;
      return next(error);
  }
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

