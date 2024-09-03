const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const { validationResult } = require('express-validator')

const nodemailer = require('nodemailer')
const sendgrindTransport = require('nodemailer-sendgrid-transport')
const transport = nodemailer.createTransport(sendgrindTransport({
    auth:{
        api_key:"",
    }
}))

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
        errorMessage: message,
        oldInput : {
            email:'',
        },
       
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
        errorMessage: message,
        oldInput : {
            firstName:'',
            lastName:'',
            email:'',
            passowrd:'',
            confirmPassowrd:'',
        },
        validationErros:[]
    })
}

exports.postSignup = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const errors = validationResult(req)
        if(!errors.isEmpty())
        {
            return res.status(422).render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg,
                oldInput : {
                    firstName:firstName,
                    lastName:lastName,
                    email:email,
                    passowrd:'',
                    confirmPassowrd:'',
                },
                validationErros:errors.array()
            });
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
        transport.sendMail({
            to: email,
            from: "rizwanali96960@gmail.com",
            subject: "Welcome to Hub Ecomerce!",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: auto;">
                        <tr>
                            <td style="background-color: #007BFF; padding: 20px; text-align: center;">
                                <img src="https://your-logo-url.com/logo.png" alt="Hub Ecomerce" style="width: 150px;"/>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; background-color: #f9f9f9;">
                                <h1 style="color: #007BFF; text-align: center;">Welcome to Hub Ecomerce!</h1>
                                <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                                    Hi ${firstName} ${lastName},<br/>
                                    Thank you for signing up for Hub Ecomerce! We're excited to have you on board.
                                </p>
                                <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                                    Get ready to explore and enjoy our amazing features. If you have any questions, feel free to reach out to us anytime.
                                </p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://localhost:3000/login" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                        Start Exploring
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #007BFF; padding: 20px; text-align: center; color: #fff;">
                                <p style="font-size: 14px;">
                                    &copy; 2024 Hub Ecomerce. All rights reserved.<br/>
                                    Follow us on 
                                    <a href="https://facebook.com/yourapp" style="color: #fff; text-decoration: none;">Facebook</a>, 
                                    <a href="https://twitter.com/yourapp" style="color: #fff; text-decoration: none;">Twitter</a>, 
                                    and 
                                    <a href="https://instagram.com/yourapp" style="color: #fff; text-decoration: none;">Instagram</a>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            `
        });
        
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
        const errors = validationResult(req)
        if(!errors.isEmpty())
            {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: errors.array()[0].msg,
                    oldInput : {
                        email:email,
                    },
                    
                });
            }
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

exports.getForgotPassword = async (req,res,next)=>{
    let message=req.flash('error');
    if(message.length>0)
    {
        message=message[0]
    }else{
    message=null
    }
    res.render('auth/forgot', {
        path: '/forgot-password',
        pageTitle: 'Forgot Password',
        errorMessage: message
       
    })
}

exports.postForgotPassword = async (req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err)
        {
        req.flash('error',err);
        res.redirect('/forgot-password')
        }
        const token=buffer.toString('hex')
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user)
            {
                req.flash('error','No account found with this email');
                res.redirect('/forgot-password')
            }
            user.resetToken=token;
            user.resetTokenExpiration=Date.now() + 3600000;
            user.save();
        }).then(result=>{
             res.redirect('/login'); 
            transport.sendMail({
                to: req.body.email,
                from: "rizwanali96960@gmail.com",
                subject: "Reset Your Password - Hub Ecomerce",
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: auto;">
                            <tr>
                                <td style="background-color: #007BFF; padding: 20px; text-align: center;">
                                    <img src="https://your-logo-url.com/logo.png" alt="Hub Ecomerce" style="width: 150px;"/>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px; background-color: #f9f9f9;">
                                    <h1 style="color: #007BFF; text-align: center;">Reset Your Password</h1>
                                    <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                                        Hi,<br/>
                                        We received a request to reset your password for your Hub Ecomerce account. Click the button below to reset it:
                                    </p>
                                    <div style="text-align: center; margin-top: 30px;">
                                        <a href="https://localhost:3000/forgot-password/${token}" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </div>
                                    <p style="font-size: 16px; line-height: 1.5; text-align: center; margin-top: 20px;">
                                        If you did not request a password reset, please ignore this email, and your password will remain unchanged.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #007BFF; padding: 20px; text-align: center; color: #fff;">
                                    <p style="font-size: 14px;">
                                        &copy; 2024 Hub Ecomerce. All rights reserved.<br/>
                                        Follow us on 
                                        <a href="https://facebook.com/yourapp" style="color: #fff; text-decoration: none;">Facebook</a>, 
                                        <a href="https://twitter.com/yourapp" style="color: #fff; text-decoration: none;">Twitter</a>, 
                                        and 
                                        <a href="https://instagram.com/yourapp" style="color: #fff; text-decoration: none;">Instagram</a>.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            });
            
        })
        .catch(err=>console.log(err));
    })

}

exports.getUpdatePassword = async (req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration: {$gt:Date.now()}})
    .then(user=>{
        let message=req.flash('error');
        if(message.length>0)
        {
            message=message[0]
        }else{
        message=null
        }
        res.render('auth/update', {
            path: '/update-password',
            pageTitle: 'Update Password',
            errorMessage: message,
            userId : user._id.toString(),
            passwordToken : token
           
        })
    })
    .catch(err=>console.log(err));
   
}

exports.postUpdatePassword = async (req,res,next)=>{
    const newPassword = req.body.new_password
    const confirmNewPassword = req.body.confirm_new_password
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken
    let resetUser;
    User.findOne({
        resetToken : passwordToken,
        resetTokenExpiration : {$gt : Date.now()},
        _id : userId
    })
    .then(user=>{
        resetUser=user;
        return bcrypt.hash(newPassword,12)
    }).then(hashedPassword=>{
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
      return  resetUser.save();
    }).then(result=>{
        res.redirect('/login')
    })
    .catch(err=>console.log(err))


}
