var mongoose = require('mongoose')
var dataSchema = new mongoose.Schema({
    // thiếu user ID để biết tài khoản nào thêm vào
    // idUser: String,
    idProduct: String,
    quantity: String
});
var db = mongoose.model('db',dataSchema,'data');
module.exports = db;