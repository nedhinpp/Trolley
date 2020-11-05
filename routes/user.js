var express = require('express');
const { request, response } = require('../app');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helper');
const userValidation = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  }
  else {
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  productHelper.getProduct().then((products) => {
    res.render('user/index', { products, user, cartCount });
  })

});

router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else {
    res.render('user/login', { "loginErr": req.session.loginErr });
    req.session.loginErr = false;

  }
});

router.get('/signup', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else {
    res.render('user/signup');
  }

});

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log("User Signed Up");
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/');
  })

});

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    }
    else {
      req.session.loginErr = "Username or password is incorrect";
      res.redirect('/login');
    }
  })

});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart', userValidation, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  let products = await userHelper.getCartItems(req.session.user._id);
  let total = await userHelper.getTotalAmount(req.session.user._id);

  res.render('user/cart', { user, products, cartCount, total });
});

router.get('/add-to-cart/:id', (req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect('/');
    res.json({ status: true, product_id: req.params.id });
  })
})

router.post('/update-cart', (req, res, next) => {
  userHelper.updateProductCart(req.body).then( async(response) => {
    response.total = await userHelper.getTotalAmount(req.body.user);  
    res.json(response);
  })
})

router.post('/remove-cart', (req, res, next) => {
  userHelper.removeProductCart(req.body).then((response) => {
    res.json(response);
  })
})

router.get('/place-order', userValidation, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  let products = await userHelper.getCartItems(req.session.user._id);
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  let total = await userHelper.getTotalAmount(req.session.user._id);
  res.render('user/checkout', { user, cartCount, products, total });
});


router.post('/place-order', userValidation, async (req, res)=>{
  let products=await userHelper.getCartItemList(req.body.userId);
  let total=await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeOrder(req.body,products,total).then(()=>{
    res.json({status:true});
  })
})

router.get('/order-success', userValidation, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  res.render('user/order-success', { user, cartCount});
});


module.exports = router;
