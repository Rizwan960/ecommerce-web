const User = require('../models/user')


exports.getLogin = async (req, res, next) => {
    // const isLoggedIn= req.get('Cookie').split(';')[1].trim().split('=')[1];
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated : req.session.isLoggedIn
    })
}

exports.getSignup = async (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated : req.session.isLoggedIn
    })
}

exports.postLogin = async (req, res, next) => {
//  res.setHeader('Set-Cookie', 'loggedIn=true')

    User.findById("66d1c24e188028e9c517c21b")
    .then(user=>{
        req.session.isLoggedIn=true
        req.session.user=user;
        req.session.save(err=>{
            res.redirect('/')
        })
       
    })
    .catch(err=>console.log(err))
}


exports.postLogout = async (req, res, next) => {
    req.session.destroy(()=>{
        res.redirect('/')
    });
}