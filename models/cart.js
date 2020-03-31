var mongoose = require('mongoose');
var db = require('../models/db');

module.exports = function Cart(cart) {
    this.items = cart.items || {};
    this.add = async function(Id) {
        var cartItem = this.items[Id];
        if (!cartItem) {
            cartItem = this.items[Id] = {id: Id, quantity: 0};
        }
        cartItem.quantity++
        console.log(cartItem)
       db.findOne({idProduct: Id},  (err, docs)=> {
                if(err){
                    console.log(err);
                }else{
                    if(!docs){
                        var Product = new db({
                            idProduct : Id,
                            quantity : cartItem.quantity
                        })
                        Product.save();
                        return;
                    }else{
                        var quantity = cartItem.quantity++
                        docs.quantity = quantity;
                        docs.save();
                    }
                }
            });
    };
};
