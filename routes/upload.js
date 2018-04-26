/*********************************
CORE PACKAGES
**********************************/
var express = require('express');
var router = express.Router();
var q = require('q');
var fs = require('fs');
var piexif = require("piexifjs");
var moment = require('moment');
var crypto = require('crypto');
var cmd = require("cmd-exec").init();
var async = require('async');
var request = require('request');
var busboy = require('connect-busboy');
var config = require('../config.js');
var aws = require('aws-sdk');
var mediaModel = require('../models/mediaModel.js');
var Imagemin = require('imagemin');


router.use(busboy());
aws.config.update({
    accessKeyId: config.aws.key,
    secretAccessKey: config.aws.secret,
    region: config.aws.region
});

var s3 = new aws.S3({ endpoint: 'https://s3.ap-south-1.amazonaws.com/kirangaud/' });

var s3Parent = new aws.S3({
    endpoint: 'https://s3.ap-south-1.amazonaws.com/'
});


function losslessImageCompression(image) {
    var file = image;
    var deferred = q.defer();

    var imagemin = new Imagemin()
        .src(file)
        .use(Imagemin.gifsicle({ interlaced: true }))
        .use(Imagemin.jpegtran({ progressive: true }))
        .use(Imagemin.optipng({ optimizationLevel: 5 }))
        .use(Imagemin.svgo({ plugins: [{ removeViewBox: true }] }));

    imagemin.run(function(err, files) {
        if (err) {
            return file;
        }
        var originalSize = file.length;
        var optimizedSize = files[0].contents.length;
        file = files[0].contents;
        deferred.resolve(file);
    });
    return deferred.promise;
}

var url = "https://s3.ap-south-1.amazonaws.com/";
var bucket_path = "kirangaud";






router.post('/aws/', function(req, res) {
    req.files = {};
    var fields = {};
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        fields[key] = value;
        console.log(key + ":-" + value);
    });
    if (fields['path']) {} else {
        fields['path'] = "default";
    }
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (!filename) {
            res.json(500, {
                message: 'file not uploaded:'
            });
        }
        console.log(filename);
        file.fileRead = [];
        file.on('data', function(chunk) {
            this.fileRead.push(chunk);
        });
        file.on('error', function(err) {
            console.log('Error while buffering the stream: ', err);
        });
        file.on('end', function() {
            var finalBuffer = Buffer.concat(this.fileRead);
            var data = finalBuffer.toString("binary");
            var filename_split = filename.split(".");
            var filename_prefix = filename_split[0];
            var filename_ext = filename_split[filename_split.length - 1];
            if (filename_ext.toLowerCase() == "jpg" || filename_ext.toLowerCase() == "jpeg") {
                var exifObj = {}; //{"0th":zeroth, "Exif":exif, "GPS":gps};
                var exifbytes = piexif.dump(exifObj);
                var newData = piexif.insert(exifbytes, data);
                var newJpeg = new Buffer(newData, "binary");
            } else {
                var newJpeg = new Buffer(data, "binary");
            }
            if (filename != '') {
                //below code for upload image in s3 bucket
                req.files[fieldname] = {
                    buffer: newJpeg,
                    size: newJpeg.length,
                    filename: filename,
                    mimetype: mimetype
                };

                // Generate date based folder prefix
                var datePrefix = moment().format('YYYY[_]MM');
                var key = crypto.randomBytes(10).toString('hex');
                var filename_split = filename.split(".");
                var filename_prefix = filename_split[0];
                var filename_ext = filename_split[filename_split.length - 1];
                filename_prefix = filename_prefix.replace(/ /g, '-');
                var hashFilename = filename_prefix + "." + filename_ext;

                var pathToArtwork = bucket_path + '//' + hashFilename;
                var get_bucket_path = "";
                var headers = {
                    'Content-Length': req.files[fieldname].size,
                    'Content-Type': req.files[fieldname].mimetype,
                    'x-amz-acl': 'public-read'
                };
                var path = url + pathToArtwork;
                var s3_params = {
                    Bucket: '',
                    Key: hashFilename,
                    ContentType: req.files[fieldname].mimetype,
                    ACL: 'public-read',
                    Body: req.files[fieldname].buffer
                };
                return s3.putObject(s3_params, function(err, data) {
                    if (err) {
                        res.json(500, {
                            message: 'Error saving Image',
                            details : err
                        });
                    } else {
                        var data = {
                            mediaPath: url + pathToArtwork,
                            mediaId: hashFilename,
                            mediaName: filename_prefix,
                            created_by: "admin",
                            created_at: new Date(),
                            isActive: true
                        }
                        var imageData = new mediaModel(data);
                        imageData.save(function(err,result){
                            if(err){
                                res.json(500, {
                                    message: 'Error saving Image',
                                    details : err
                                });
                            }else{
                                res.json({
                                    message: 'uploaded',
                                    url: url +'/'+pathToArtwork,
                                    details : data
                                });
                            }
                        })
                    }
                });
                req.busboy.on('finish', function() {});
            }
        });
    });
    req.pipe(req.busboy);
});

/*router.post('/delete/', function(req, res) {
    var reqPath = req.body.path;
    var imagePrefix = "//d3r8gwkgo0io6y.cloudfront.net/"
    var keyPath = reqPath.substr(reqPath.indexOf(imagePrefix) + 32, reqPath.length);
    var fileParams = {
        Bucket: "kesari.in",
        Key: keyPath
    }
    s3Parent.getObject(fileParams, function(err, getImageData) {
        var fileName = fileParams.Key;
        var removeExtention = fileName.substring(0, fileName.lastIndexOf('.'));
        var fileExtention = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
        var params = {
            Bucket: 'kesari.in',
            Delete: {
                Objects: [{
                    Key: "/" + removeExtention + fileExtention
                }]
            }
        };
        s3.deleteObjects(params, function(err, dataNew) {
            if (err) {
                return res.json(500, {
                    message: 'Error deleting File',
                    error: err
                });
            } else {
                res.json({
                    message: 'Deleted Successfully',
                    data: dataNew
                });
            }
        });
    });
});*/


module.exports = router;