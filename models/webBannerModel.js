var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var webBannerSchema = new Schema({
	"webBannerImage" : String,
	"mobBannerImage" : String,
	"createdBy":{type:String,default:'admin'},
	"createdOn":{type:Date,default:Date.now},
	"isActive" : {type: Boolean, default: true},
});

module.exports = mongoose.model('webBanner', webBannerSchema,'webBanner');