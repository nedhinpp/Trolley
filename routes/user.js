var express = require('express');
const { request } = require('../app');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helper');
const userValidation = (req, res, next)=>{
  if(req.session.loggedIn){ 
  next();
  }
  else{
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  productHelper.getProduct().then((products) => {
    res.render('user/index', { products, user });
  })

});

router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else {
    res.render('user/login', {"loginErr": req.session.loginErr});
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
      req.session.loginErr  = "Username or password is incorrect";
      res.redirect('/login');
    }
  })

});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart', userValidation, function (req, res) {
  let user = req.session.user;
  res.render('user/cart', { user });
});


module.exports = router;
