var mongoose = require('mongoose');
var mongooseHistory = require('mongoose-history');
var Schema   = mongoose.Schema;
//console.log("this is legal format");

var imageSchema = new Schema({
	"imagePath" : String,
    "size" : String,
    "compressed" : Boolean,
  "isActive" : {type: Boolean, default: true},
  "created_by":String,
  "created_at":{type:Date,default:Date.now},
});
imageSchema.plugin(mongooseHistory);
module.exports = mongoose.model('image', imageSchema,'images');