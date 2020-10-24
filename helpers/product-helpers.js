var db=require('../config/connection');
var collections=require('../config/collections');
var objectID = require('mongodb').ObjectID;

module.exports={
    addProduct:(product, callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            
            callback(data.ops[0]._id);

        })     
    },
    getProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
            resolve(products); 
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve, reject)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).removeOne({_id:objectID(prodId)}).then((response)=>{      
                resolve(response);
            })
        })     
    },

}