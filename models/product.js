var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
	name : String,
	img : String,
	description : String
});
var product = mongoose.model('product',productSchema,'products');
module.exports = product;