const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

const isAuth = require('../middleware/is-auth')

const { body } = require('express-validator');


// /admin/add-product => GET
router.get('/add-product',isAuth ,adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth , adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product',isAuth , [
    [
        body('title')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long.'),
        body('imageUrl')
            .isURL()
            .withMessage('Please enter a valid URL.'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be greater than 0.'),
        body('description')
            .trim()
            .isLength({ min: 5, max: 400 })
            .withMessage('Description must be between 5 and 400 characters.')
    ],
] , adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth , adminController.getEditProduct);

router.post('/edit-product',isAuth,[
    [
        body('title')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long.'),
        body('imageUrl')
            .isURL()
            .withMessage('Please enter a valid URL.'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be greater than 0.'),
        body('description')
            .trim()
            .isLength({ min: 5, max: 400 })
            .withMessage('Description must be between 5 and 400 characters.')
    ],
] , adminController.postEditProduct);

router.post('/delete-product',isAuth , adminController.postDeleteProduct);

module.exports = router;
