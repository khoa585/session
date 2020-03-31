const express = require('express');
const app = express();
var cookieParser = require('cookie-parser');
const session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('views', './views');
app.set('view engine', 'pug');
var Cart = require('./models/cart');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/product-demo');
var pd = require('./models/product');
var db = require('./models/db');
var port = 5000;
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});
app.get('/product',(req,res) => {
    pd.find().then(function(products){
        res.render('node/product',{
            products : products
        })
    })
})
app.get('/cart/add/:id', function(req,res){
    // trong đây flow sẽ là . 
    // nếu người dùng chưa đang nhập sẽ lưu vào session 
    // nếu người dùng đăng nhập rồi sẽ lưu vào db 
    // Khi mỗi lần add cart
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.add(productId);
    req.session.cart = cart;
    res.redirect('/product')
})
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/login.html');
    })
    .post((req, res) => {
         // khi login 
         // check nếu login thành công thì kiểm tra trong session 
        var username = req.body.username;
        var password = req.body.password;
        if((username === 'a' && password === '123') || (username === 'b' && password === '1234')){
            req.session.user = {
                type: 'javascript',
            }
         res.redirect('/product')
        }else{
            res.redirect('/login');
        }
    });
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/product')
    } else {
         res.redirect('/login');
    }
});
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        // res.clearCookie('user_sid');
        delete req.session.user
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`)) ;

// Cart có 2 trường hợp . 
// ------------------- là user chưa đăng nhập . 
//  Khi add cart sẽ lưu vào session . lúc đó session sẽ có dạng . req.session.cart = [{idsp:123,quality:1}]
// Khi thêm 1 sản phẩm mới  session sẽ có dạng  là req.session.cart = [{idsp:123,quality:1},{idsp:1,quality:1}]
// khi thêm 1 sản phẩm trùng với 1 sản phẩm mới session sẽ có dạng là  : req.session.cart = [{idsp:123,quality:2},{idsp:1,quality:1}]




// Trường Hợp 2 . 
/// User Khi Đăng Nhập Rồi 
// --------- Khi Login thành công . 
//Phải Kiểm tra xem trong session nó có cart chưa [{idsp:123,quality:1},{idsp:1,quality:1}] . nếu có rồi phải kiểm tra xem trong database nó có sản phẩm nào chưa . nếu có tăng số lượnglên
//  Nếu trong db không có sản phẩm nào thì sẽ inser vào trong db . thành công sẽ có dang . { userid:123, cart:[{idsp:123,quality:1},{idsp:1,quality:1}]} . 
//nếu người đó có sản phẩm rồi  thì db sẽ là { userid:123, cart:[{idsp:123,quality:1}]} . nếu trong session là [{idsp:123,quality:1},{idsp:1,quality:1}]
// tìm cách đồng bộ giữa db và session . kết quả trong db sẽ phải là { userid:123, cart:[{idsp:123,quality:2,{idsp:1,quality:1}}]}

// --- Khi add Cart mà user da login thì phải tăng thẳng vào luôn db . sản phẩm add idsp:123 . trong db sẽ là { userid:123, cart:[{idsp:123,quality:3},{idsp:1,quality:1}}]}


// Về phần hiển thị giỏ cart 
// Nếu Chưa Đăng Nhập rồi mình sẽ lấy trong session ra và hiển thj
// Nếu Đăng Nhập rồi sẽ lấy trong DB ra hiển thị 

// Về Phẩn Xử lý trong db 

// Khi nếu user đó chưa có cart thì sẽ sài create ( { userid:123, cart:[{idsp:123,quality:1}]});
// nết usẻ đó đã có cart rồi thì phải get ra rồi so sánh với session . xong update lại  









// router.post('/add/:id', async (req, res) => {
//     console.log(req.session.cart)
//     let result = req.user;
//     let product_Id = req.params.id;
//     if (result) {
//         cartProduct.findOne({ 'cart.idProduct': product_Id }, (err, docs) => {
//             if (err) {
//                 return ResponsiveHelper.json(req, res, err, null);
//             } else {
//                 if (!docs) {
//                     if (!req.session.cart) {
//                         var Product = new cartProduct({
//                             cart: {
//                                 idProduct: product_Id,
//                                 quantity: 1
//                             }
//                         })
//                         Product.save();
//                     } else {
//                         let quantity = req.session.cart.items[product_Id].quantity += 1;
//                         let Product = new cartProduct({
//                             cart: {
//                                 idProduct: product_Id,
//                                 quantity: quantity
//                             }
//                         })
//                         Product.save();
//                         var cart = new Cart(req.session.cart ? req.session.cart : {});
//                         cart.remove(product_Id)
//                         req.session.cart = cart;

//                     }
//                 } else {
//                     if (!req.session.cart) {
//                         docs.cart.quantity++;
//                         docs.save();
//                     } else {
//                         let quantity = req.session.cart.items[product_Id].quantity;
//                         let cartQuantity = quantity + parseInt(docs.cart.quantity, 10);
//                         docs.cart.quantity = cartQuantity++;
//                         req.session.cart.items[product_Id].quantity = 0;
//                         docs.save();
//                     }
//                 }
//             }
//         })
//     } else {
//         const product = await Db_Product.find({ _id: product_Id }, (err, data) => {
//             if (err) return err;
//             return data;
//         })
//         var cart = new Cart(req.session.cart ? req.session.cart : {});
//         cart.add(product[0], product_Id)
//     }
//     req.session.cart = cart;
//     res.redirect('/Product_api');
// })

// router.get('/remove/:id', function (req, res, next) {
//     var productId = req.params.id;
//     var cart = new Cart(req.session.cart ? req.session.cart : {});

//     cart.remove(productId);
//     req.session.cart = cart;
//     res.redirect('/cart');
// });
