
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')
const { check, body } = require('express-validator')
const User = require('../models/user')


router.get('/login',authController.getLogin),

router.post('/login', [
    check('email', 'Enter a valid email')
        .isEmail()
        .notEmpty()
        .withMessage('Email should not be empty').normalizeEmail(),
    check('password', 'Password should not be empty')
        .notEmpty().trim()
], authController.postLogin);

router.get('/signup',authController.getSignup)

router.post('/signup', 
    [
    check('email')
        .isEmail()
        .withMessage('Enter a valid email').normalizeEmail()
        .custom(async (value) => {
        try {
            const userDoc = await User.findOne({ email: value });
            if (userDoc) {
            return Promise.reject('User already exists with this email');
            }
        } catch (err) {
            console.error(err);
            throw new Error('Server error while checking email');
        }
        }),
    body('password')
        .isStrongPassword()
        .withMessage('Password should be minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1.').trim(),
    body('confirm_password')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirm password did not match');
        }
        return true;
        }),
    ],
    authController.postSignup
);

router.post('/logout',authController.postLogout)

router.get('/forgot-password',authController.getForgotPassword)

router.post('/forgot-password',authController.postForgotPassword)

router.get('/forgot-password/:token',authController.getUpdatePassword)

router.post('/update-password',authController.postUpdatePassword)



module.exports = router;