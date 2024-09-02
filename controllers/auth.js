const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = async (req, res, next) => {
    // const isLoggedIn= req.get('Cookie').split(';')[1].trim().split('=')[1];
    let message=req.flash('error');
    if(message.length>0)
    {
        message=message[0]
    }else{
    message=null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
       
    })
}

exports.getSignup = async (req, res, next) => {
    let message=req.flash('error');
    if(message.length>0)
    {
        message=message[0]
    }else{
    message=null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    })
}

exports.postSignup = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash('error','user already exsist with this email')
            return res.redirect('/signup');
        }
        if(password!==confirmPassword)
        {
            req.flash('error','password did not match')
            return res.redirect('/signup');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            cart: { items: [] }
        });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.postLogin = async (req, res, next) => {
    //  res.setHeader('Set-Cookie', 'loggedIn=true')
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
        // If user is not found
        req.flash('error','No user found with this email')
        return res.redirect('/login'); // Or handle error as needed
        }
        // Match the password
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
        // If password matches
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
        res.redirect('/');
        });
        }
        // If password doesn't match
        req.flash('error','Invalid email or password.')
        res.redirect('/login'); // Or handle error as needed
    } catch (err) {
        console.log(err);
        res.redirect('/login'); // Or handle error as needed
    }
};


exports.postLogout = async (req, res, next) => {
    req.session.destroy(()=>{
    res.redirect('/')
    });
}