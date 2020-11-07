var db = require('../config/connection');
var collections = require('../config/collections');
const bcrypt = require('bcrypt');
const { PRODUCT_COLLECTION } = require('../config/collections');
const { ObjectID } = require('mongodb');
var objectID = require('mongodb').ObjectID;
const Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
    key_id: 'rzp_test_7li7wmSuoMjECf',
    key_secret: 'b5PhdfU7LgYsLsG71vn5IFIg',
});

module.exports = {
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email });
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else {
                        resolve({ status: false });
                    }
                })
            }
            else {
                resolve({ status: false });
            }
        })
    },
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0]);
            });

        })
    },
    addToCart: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            let prodObj = {
                item: objectID(prodId),
                quantity: 1
            }
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectID(userId) });
            if (userCart) {
                let prodExist = userCart.products.findIndex(product => product.item == prodId)
                if (prodExist != -1) {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectID(userId), 'products.item': objectID(prodId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve();
                            })
                }
                else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectID(userId) },
                        {
                            $push: { products: prodObj }
                        }
                    ).then((response) => {
                        resolve();
                    })
                }
            }
            else {
                console.log(0)
                let cartObj = {
                    user: objectID(userId),
                    products: [prodObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }
        })
    },
    getCartItems: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectID(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectID(userId) });
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);
        })
    },
    updateProductCart: (details) => {
        return new Promise(async (resolve, reject) => {
            details.count = parseInt(details.count);
            if (details.count == -1 && details.quantity == 1) {
                await db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectID(details.cart) },
                        {
                            $pull: { products: { item: objectID(details.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true });
                        })
            }
            else {
                await db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectID(details.cart), 'products.item': objectID(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true });
                        })
            }

        })
    },
    removeProductCart: (details) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.CART_COLLECTION)
                .updateOne({ _id: objectID(details.cart) },
                    {
                        $pull: { products: { item: objectID(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true });
                    })

        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectID(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]).toArray()
            console.log(total)
            resolve(total[0].total)
        })
    },
    getCartItemList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectID(userId) });
            resolve(cart.products);
        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            let status = order.paymentMethod === 'COD' ? 'Placed' : 'Pending';
            let orderObj = {
                deliiveryDetails: {
                    firstName: order.firstName,
                    lastName: order.lastName,
                    address: order.address,
                    address_2: order.address_2,
                    country: order.country,
                    state: order.state,
                    zip: order.zip,
                },
                paymentMethod: order.paymentMethod,
                Name: order.firstName + ' ' + order.lastName,
                products: products,
                total: total,
                status: status,
                user: order.userId,
                date: new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collections.CART_COLLECTION).removeOne({ user: objectID(order.userId) })
                resolve(response.ops[0]._id);
            })
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("New Order: ", order);
                resolve(order);
            });
        });
    },
    verifyPayment: (details) => {
        console.log(details);
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'b5PhdfU7LgYsLsG71vn5IFIg');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');
            console.log("hmac"+hmac);
            if (hmac === details['payment[razorpay_signature]']) {
                console.log("hi");
                resolve();
            }
            else {
                reject();
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise ((resolve, reject)=>{
        db.get().collection(collections.ORDER_COLLECTION).
            updateOne({ _id: objectID(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => {
                    resolve();
                })
    })
}

}
