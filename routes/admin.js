var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getProduct().then((products)=>{
    res.render('admin/admin-home', {products, admin:true});
  })
});


router.get('/add-product', function(req,res){
  res.render('admin/add-product');
});

router.post('/add-product', (req,res)=>{

  productHelper.addProduct(req.body, (id)=>{
    let image=req.files.product_image;
    console.log(id); 
    image.mv('./public/images/product-images/'+id+'.JPG', (err, done)=>{
      if(!err){
        res.render('admin/add-product');
      }
    });

  })

})

module.exports = router;
