exports.getLogin = async (req, res, next) => {
    const isLoggedIn= req.get('Cookie').split(';')[1].trim().split('=')[1];
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated : req.isLoggedIn
    })
}

exports.getSignup = async (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated : req.isLoggedIn
    })
}

exports.postLogin = async (req, res, next) => {
 res.setHeader('Set-Cookie', 'loggedIn=true')
    res.redirect('/')
}