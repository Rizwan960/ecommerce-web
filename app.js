// Core imports for the node js main file
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Controllers and Sequelize imports for controller and Database
const errorController = require('./controllers/error');
const sequelize =require('./util/databas');
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')


// Core imports
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');


// Routed imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// App usage/midlewares imports
app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        req.user=user;
        next();
    })
    .catch(err=>console.log(err))
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


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

