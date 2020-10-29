var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getProduct().then((products) => {
    res.render('admin/admin-home', { products, admin: true });
  })
});


router.get('/add-product', function (req, res) {
  res.render('admin/add-product');
});

router.post('/add-product', (req, res) => {

  productHelper.addProduct(req.body, (id) => {
    if (req.files) {
      let image = req.files.product_image;
      console.log(id);
      image.mv('./public/images/product-images/' + id + '.JPG', (err, done) => {
        if (!err) {
          res.redirect('/admin');
        }
        else {
          console.log(err);
        }
      })
    }
    else {
      res.redirect('/admin');
    }

  })

})


router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id;
  productHelper.deleteProduct(prodId).then((response) => {
    console.log("Product " + response + " has been deleted succesfully");
    res.redirect('/admin/')
  })

})



router.get('/edit-product/:id', function (req, res) {
  let prodId = req.params.id;
  productHelper.getOneProduct(prodId).then((products) => {
    res.render('admin/edit-product', { products });
  });

});

router.post('/edit-product', (req, res) => {
  productHelper.updateProduct(req.body).then((products)=> {
    if (req.files) {
      let image = req.files.product_image;
      image.mv('./public/images/product-images/' + req.body.prid + '.JPG', (err, done) => {
        if (!err) {
          res.redirect('/admin');
        }
        else {
          console.log(err);
        }
      })
    }
    else {
      res.redirect('/admin');
    }
  })
})


module.exports = router;