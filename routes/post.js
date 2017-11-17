var express = require('express');
var router = express.Router();
var controller = require('../controllers/postController.js');
var q = require('q');
var imageModel = require('../models/imageModel.js');
var body = require('body-parser');
var fs = require('fs');
// var multer = require('multer');
// var storage = multer.diskStorage({
//     destination: function(req, file, callback) {
//         callback(null, '/Node/file-upload/uploads/');
//     },
//     filename: function(req, file, callback) {
//         callback(null, file.fieldname + '-' + Date.now());
//     }
// });

// var upload = multer({ storage: storage });
var piexif = require("piexifjs");
var crypto = require('crypto');
var busboy = require('connect-busboy');
router.use(busboy());

/*
 * GET
 */


router.get('/master', function(req, res, next) {
    res.render('post/list', {
        title: 'POST MASTER'
    });

});

router.post('/grid-view', function(req, res, next) {
    var columns = req.body.columns;
    var search_by = req.body.search_by;
    var sort = req.body.sort;
    var order = req.body.order;
    var page = req.body.page;
    q.all(baseExport.grid("post", columns, page, search_by, sort, order)).then(function(result) {
        var grid = JSON.stringify(result);
        grid = JSON.parse(grid);
        res.render('./partials/grid-view', {
            "grid": grid,
            "columns": columns,
            "module": "post"
        });
    });
});


/*
 * GET 
 */
router.get('/', function(req, res) {
    controller.list(req, res);
});

router.get('/getArchiveListing', function(req, res) {
    controller.getArchiveListing(req, res);
});

router.get('/getCategory/:query', function(req, res) {
    controller.getCategory(req, res);
});

router.get('/all/', function(req, res) {
    controller.listAll(req, res);
});

router.get('/:query', function(req, res) {
    var query = (req.params.query);
    controller.show(req, res);
});

/*
 * GET
 */
router.get('/getIdData/:id', function(req, res) {
    controller.getIdData(req, res);
});

/*
 * POST
 */
router.post('/', function(req, res) {
    controller.create(req, res);
});


router.post('/upload', function(req, res) {
    req.files = {};
    var fields = {};
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        fields[key] = value;
    });

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (!filename) {
            res.json(500, {
                message: 'file not uploaded:'
            });

        }
        file.fileRead = [];
        file.on('data', function(chunk) {
            this.fileRead.push(chunk);
        });
        file.on('error', function(err) {
            console.log('Error while buffering the stream: ', err);
        });

        file.on('end', function() {
            // Concat the chunks into a Buffer
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
                    mimetype: mimetype,
                    path: './pubic/uploads/images'
                };

                // Generate date based folder prefix

                var key = crypto.randomBytes(10).toString('hex');
                var filename_split = filename.split(".");
                var filename_prefix = filename_split[0];
                var filename_ext = filename_split[filename_split.length - 1];
                var hashFilename = filename_prefix.replace(/ /g, '-') + "." + filename_ext;
                var headers = {
                    'Content-Length': req.files[fieldname].size,
                    'Content-Type': req.files[fieldname].mimetype,
                    'x-amz-acl': 'public-read'
                };
                // fs.readFile(req.files[fieldname].image.path, function (err, data){
                var newPath = './public/images/' + req.files[fieldname].filename;
                fs.writeFile(newPath, req.files[fieldname].buffer, function(err) {
                    if (err) {
                        return res.send("Error uploading file.");
                    } else {
                        var obj = {
                            "imagePath": "/images/" + req.files[fieldname].filename,
                            "isActive": true,
                            "size": "768 X 400",
                            "compressed": false,
                        }
                        var imageData = new imageModel(obj);
                        imageData.save(function(err, result) {
                            console.log("Saved");
                            res.send("File is uploaded");
                        })
                    }
                });
                return true;
                req.busboy.on('finish', function() {});
            }
        });
    });
    req.pipe(req.busboy);
});


/*
 * PUT
 */
 router.put('/:id', function(req, res) {
    console.log(req.body);
    controller.update(req, res);
});
 
router.put('/comment/:id', function(req, res) {
    controller.pushComment(req, res);
});

/*
 * DELETE
 */
/*router.delete('/:id',authentication.token,function(req, res) {
    controller.remove(req, res);
});
*/
module.exports = router;
