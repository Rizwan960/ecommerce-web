/*------------------------------Core Imports for each Projects as per need----------------------------------*/

// Core imports for the node js main file
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
const MONGODB_URI='mongodb+srv://f2020065105:11223344@demoproject.wdsif.mongodb.net/?retryWrites=true&w=majority&appName=DemoProject'
const csrf = require('csurf')
const flasg= require('connect-flash')
const multer = require('multer')
const fileStorage = multer.diskStorage({
    destination :(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toISOString()+'-'+ file.originalname)
    },
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg')
    {
    cb(null,true)
    }
    else{
    cb(null,false)
    }
}

// Controllers and Sequelize imports for controller and Database
const errorController = require('./controllers/error');
const User = require('./models/user')

// Core imports
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf()  

app.set('view engine', 'ejs');
app.set('views', 'views');



// Routed imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const flash = require('connect-flash/lib/flash');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('imageUrl'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));


app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 3600000 
    }
}));


app.use(csrfProtection)
app.use(flash())

app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
})

app.use((req,res,next)=>{
    if(!req.session.user)
    {
    return next();
    }
    User.findById(req.session.user)
    .then(user=>{
        if(!user)
        {
            return next();
        }
     req.user=user;
     next()
    })
    .catch(err=>{
       next(new Error(err))
    })
})



// App usage/midlewares imports
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
    res.status(err.httpStatusCode || 500);
    res.render('500', {
    statusCode: err.httpStatusCode || 500,
    message: err.message || 'Something went wrong!'
    });
});
/*------------------------------Core Imports end here----------------------------------*/

/* if you are using mongoDbuse this method to connect and run app on port */

// const mongoConnect=require('./util/databas').mongoConnect
// mongoConnect(()=>{
//     app.listen(3000)
// })

// If using mongoose then use this:


mongoose.connect(MONGODB_URI)
.then(result=>{
    app.listen(3000);
})
.catch(err=>console.log(err))




/* For using MYSQL with SEQUELIZE USE THE BELOW METHOD 


// Controllers and Sequelize imports for controller and Database
const sequelize =require('./util/databas');
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

// Database Table Relations
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync(
    // {
    //     force:true
    // }
)
.then((res)=>{
    return User.findByPk(1)
}).then(user=>{
    if(!user)
    {
    return  User.create({name:'Rizwan Ali',email:'test@gmail.com'})
    }
    return user;
})
.then(user=>{
    // console.log(user)
    return user.createCart()
    // app.listen(3000);
}).then(cart=>{
    app.listen(3000);
})
.catch(err=>console.log(err));

*/
