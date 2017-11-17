var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var categorySchema = new Schema({
	"name" : String,
	"createdBy":String,
	"createdOn":{type:Date,default:Date.now},
	"isActive" : {type: Boolean, default: true},
});

module.exports = mongoose.model('category', categorySchema,'category');