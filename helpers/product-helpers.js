var db = require('../config/connection');
var collections = require('../config/collections');
const { response } = require('express');
var objectID = require('mongodb').ObjectID;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data.ops[0]._id);

        })
            .catch((err) => {
                console.log(err);
            })
    },
    getProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).removeOne({ _id: objectID(prodId) }).then((response) => {
                resolve(response);
            })
        })
    },
    getOneProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectID(prodId) }).then((response) => {
                resolve(response);
            });
        });
    },
    updateProduct: (product) => {
        return new Promise((resolve, reject) => {
            console.log(product);
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectID(product.prid) }, {
                $set: {
                    product_name: product.product_name,
                    barcode: product.barcode,
                    category: product.category,
                    description: product.description,
                    price: product.price
                }

            }).then((response) => {
                resolve(response);
            });
        });
    },

}