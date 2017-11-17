var mongoose = require('mongoose');
var mongooseHistory = require('mongoose-history');
var Schema   = mongoose.Schema;
//console.log("this is legal format");

var usersSchema = new Schema({
  "username": String,
  "password":String,
  "designation":String,
  "isActive" : {type: Boolean, default: true},
  "created_by":String,
  "created_at":{type:Date,default:Date.now},
});
usersSchema.plugin(mongooseHistory);
module.exports = mongoose.model('users', usersSchema,'users');