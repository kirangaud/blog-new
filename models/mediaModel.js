var mongoose = require('mongoose');
var mongooseHistory = require('mongoose-history');
var Schema = mongoose.Schema;
//console.log("this is legal format");

var imageSchema = new Schema({
    "driveInfo": String,
    "mediaPath": String,
    "mediaId": String,
    "mediaName": String,
    "isActive": { type: Boolean, default: true },
    "created_by": String,
    "created_at": { type: Date, default: Date.now },
});
imageSchema.plugin(mongooseHistory);
module.exports = mongoose.model('media', imageSchema, 'media');
