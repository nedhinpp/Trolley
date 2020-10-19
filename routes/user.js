var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');

/* GET home page. */
router.get('/', function (req, res, next) {

  productHelper.getProduct().then((products) => {
    res.render('user/index', { products, admin: false });
  })

});

router.get('/login', function (req, res) {
  res.render('user/login');
});

router.get('/signup', function (req, res) {
  res.render('user/signup');
});


module.exports = router;
