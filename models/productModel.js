var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var productSchema = new Schema({
	"productCode" : String,
	"productTitle" : String,
	"productCategory" : String,
	"productHeading" : String,
	"productDescription" : String,
	"productPrice" : String,
	"productImage" : Array,
	"createdBy":String,
	"createdOn":{type:Date,default:Date.now},
	"isActive" : {type: Boolean, default: true},
});

module.exports = mongoose.model('product', productSchema,'product');