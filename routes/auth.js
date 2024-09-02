
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')


router.get('/login',authController.getLogin),

router.post('/login',authController.postLogin),

router.get('/signup',authController.getSignup)

router.post('/signup',authController.postSignup)

router.post('/logout',authController.postLogout)

router.get('/forgot-password',authController.getForgotPassword)

router.post('/forgot-password',authController.postForgotPassword)

router.get('/forgot-password/:token',authController.getUpdatePassword)

router.post('/update-password',authController.postUpdatePassword)



module.exports = router;