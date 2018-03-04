var mongoose = require('mongoose');
var mongooseHistory = require('mongoose-history');
var Schema   = mongoose.Schema;
//console.log("this is legal format");

var postSchema = new Schema({
    "post_id" : String,
    "posts_title" : String,
    "posts_category" : String,
    "created_on_string" : String,
    "created_on" : {type:Date,default:Date.now},
    "comments" : Array,
    "comment_count" : Number,
    "post_header_images" : Array,
    "post_header_content" : String,
    "created_by" : String,
    "post_description" : String,
    "post_images" : Array,
    "meta_tag" : String,
    "meta_keywords" : String,
    "meta_description" : String,
    "hash_tags" : String,
    "isActive" : {type: Boolean, default: true},
    //Title key added on 3rd March 2018
    "title" : String,
    "name" : String
});
postSchema.plugin(mongooseHistory);
module.exports = mongoose.model('post', postSchema,'post');

// {
//     "_id" : ObjectId("56d799880ebc888ddc727c29"),
//     "post_id" : "2",
//     "posts_title" : "The Church of St. John",
//     "posts_category" : "photography",
//     "created_on_string" : "JUNE 05,2016",
//     "created_on" : ISODate("2016-06-05T20:10:10.000Z"),
//     "comments" : [ 
//         {
//             "comment_by" : "Alnoor khan",
//             "comment" : "This is a nice post loved it",
//             "comment_date_string" : "JUNE 07,2016",
//             "comment_date" : ISODate("2016-06-06T20:10:10.000Z"),
//             "comment_status" : "active"
//         }
//     ],
//     "comment_count" : 1,
//     "post_header_images" : [ 
//         "/images/afghanChurch-1.jpg", 
//         "/images/afghanChurch-2.jpg", 
//         "/images/afghanChurch-3.jpg", 
//         "/images/afghanChurch-4.jpg"
//     ],
//     "post_header_content" : "The Church of St. John the Evangelist, better known as the Afghan Church is an Anglican Church in Mumbai, India, built by the British to commemorate the dead of the First Afghan War and the disastrous 1842 retreat from Kabul.The imposing edifice was constructed using locally available buff-coloured basalt and limestone. Inside it is known for its wide gothic arches and beautiful stained glass windows. The chapel has a nave and aisle with a chancel 50 ft (15 m) in length and 27 ft (7 m) in width. Butterfield's tiles used for the geometric floor pattern were imported from England.",
//     "created_by" : "kapegaud",
//     "post_description" : "The Church of St. John the Evangelist, better known as the Afghan Church is an Anglican Church in Mumbai, India, built by the British to commemorate the dead of the First Afghan War and the disastrous 1842 retreat from Kabul.The imposing edifice was constructed using locally available buff-coloured basalt and limestone. Inside it is known for its wide gothic arches and beautiful stained glass windows. The chapel has a nave and aisle with a chancel 50 ft (15 m) in length and 27 ft (7 m) in width. Butterfield's tiles used for the geometric floor pattern were imported from England.",
//     "post_images" : [ 
//         "/images/afghanChurch-1.jpg", 
//         "/images/afghanChurch-2.jpg", 
//         "/images/afghanChurch-3.jpg", 
//         "/images/afghanChurch-4.jpg"
//     ],
//     "meta_tag" : "",
//     "meta_keywords" : "",
//     "hash_tags" : "#insta",
//     "isActive" : true
// }