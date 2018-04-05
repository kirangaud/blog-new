var model = require('../models/postModel.js');
var _ = require('underscore');

/**
 * postController.js
 *
 * @description :: Server-side logic for managing post.
 */
module.exports = {

    /**
     * postController.list()
     */

    list: function(req, res) {
        model
            .find({
                isActive: true
            })
            .sort('-_id')
            .exec(function(err, post) {
                if (err) {
                    return res.json(500, {
                        message: 'Error getting post.'
                    });
                }
                return res.json(post);
            });
    },

    listAll: function(req, res) {
        model
            .find({})
            .sort('-_id')
            .exec(function(err, post) {
                if (err) {
                    return res.json(500, {
                        message: 'Error getting post.'
                    });
                }
                return res.json(post);
            });
    },
    // getArchiveListing: function(req, res) {
    //     model.aggregate([
    //             { $match: { isActive : true } }, {
    //                 $group: {
    //                     _id: { year: { $year: "$created_on" }, month: { $month: "$created_on" } },
    //                     post_title: { $addToSet: "$posts_title" },
    //                     total: { $sum: 1 }
    //                 }
    //             },
    //             { $sort: { "_id.year": 1, "_id.month": 1 } }
    //         ])
    //         .exec(function(err, result) {
    //             if (err) {
    //                 return res.json(500, {
    //                     message: 'Error getting post.'
    //                 });
    //             } else {
    //                 return res.json(result);
    //             }
    //         });
    // },
    getArchiveListing: function(req, res) {
        model.aggregate([
                { $match: { isActive: true } }, {
                    $group: {
                        _id: { year: { $year: "$created_on" }, month: { $month: "$created_on" } },
                        post_title: { $addToSet: "$posts_title" },
                        total: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
            .exec(function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    var archiveArray = [];
                    result = JSON.parse(JSON.stringify(result));
                    _.each(result, function(resultOne, index) {
                        var archiveObj = {};
                        if (archiveArray.length === 0) {
                            archiveObj["year"] = resultOne._id.year;
                            archiveObj["monthData"] = [];
                            var monthObj = {};
                            monthObj["month"] = resultOne._id.month;
                            monthObj["post"] = resultOne.post_title;
                            archiveObj["monthData"].push(monthObj);
                            archiveArray.push(archiveObj);
                        } else {
                            var findYear = _.findWhere(archiveArray, { year: resultOne._id.year });
                            if (findYear != undefined) {
                                if (findYear.year === resultOne._id.year) {
                                    _.each(archiveArray, function(eachData, eachIndex) {
                                        if (eachData.year === resultOne._id.year) {
                                            var monthObj = {};
                                            monthObj["month"] = resultOne._id.month;
                                            monthObj["post"] = resultOne.post_title;
                                            archiveArray[eachIndex]["monthData"].push(monthObj);
                                        }
                                    });
                                } else {
                                    archiveObj["year"] = resultOne._id.year;
                                    archiveObj["monthData"] = {};
                                    archiveObj["monthData"]["month"] = resultOne._id.month;
                                    archiveObj["monthData"]["post"] = resultOne.post_title;
                                    archiveArray.push(archiveObj);
                                }

                            } else {
                                archiveObj["year"] = resultOne._id.year;
                                archiveObj["monthData"] = [];
                                var monthObj = {};
                                monthObj["month"] = resultOne._id.month;
                                monthObj["post"] = resultOne.post_title;
                                archiveObj["monthData"].push(monthObj);
                                archiveArray.push(archiveObj);
                            }
                        }
                    });
                    res.json(archiveArray);
                }
            });
    },
    getCategory: function(req, res) {
        var query = req.params.query;
        model
            .find({
                posts_category: query,
                isActive: true
            })
            .sort('-_id')
            .exec(function(err, post) {
                if (err) {
                    return res.json(500, {
                        message: 'Error getting post.'
                    });
                }
                return res.json(post);
            });
    },
    /**
     * postController.show()
     */
    show: function(req, res) {
        var query = req.params.query;
        model.find({ posts_title: query }, function(err, post) {
            if (err) {
                return res.json(500, {
                    message: 'Error getting post.'
                });
            }
            if (!post) {
                return res.json(404, {
                    message: 'No such post'
                });
            }
            return res.json(post);
        });
    },
    getIdData: function(req, res) {
        var id = req.params.id;
        model.findOne({ _id: id }, function(err, post) {
            if (err) {
                return res.json(500, {
                    message: 'Error getting post.'
                });
            }
            if (!post) {
                return res.json(404, {
                    message: 'No such post'
                });
            }
            return res.json(post);
        });
    },
    getTags: function(req, res) {
        model
            .distinct('hash_tags')
            .exec(function(err,result){
                if(err){
                    return res.json(500, {
                        message: 'Error getting post.'
                    });
                }else{
                    result = JSON.parse(JSON.stringify(result));
                    result = (result.toString()).split(',');
                    result = _.uniq(_.flatten(result));
                    result = result.map((data) =>  data.trim());
                    return res.json(result);
                }
            })
    },
    /**
     * postController.create()
     */
    create: function(req, res) {
        // console.log("found");
        console.log(req.body);
        // req.body.created_by=req.session.user.uid;
        var currentDate = new Date();
        req.body.created_on_string = currentDate.toString();
        var headerImages = [];
        // headerImages = req.body.post_header_images.split(',');
        // req.body.post_header_images = headerImages;
        var post = new model(req.body);

        post.save(function(err, post) {
            if (err) {
                return res.json(500, {
                    message: 'Error saving post',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: post._id
            });
        });
    },

    /**
     * postController.update()
     */
    pushComment: function(req, res) {
        var id = req.params.id;
        var currentDate = new Date();
        req.body.created_on_string = currentDate.toString();
        var commentObj = {
            "comment_by": req.body.author,
            "comment_email": req.body.email,
            "comment_url": req.body.url,
            "comment": req.body.comment,
            "comment_date_string": req.body.created_on_string,
            "comment_date": currentDate,
            "comment_status": "active",
        };
        model.findById(id, function(err, post) {
            model.update({ _id: id }, { $push: { comments: commentObj } }, function(err, result) {
                if (err) {
                    console.log(err);
                }
                return res.json({
                    message: 'Updated Successfully',
                    // _id: reception._id
                });
            });
        });
    },

    update: function(req, res) {
        var id = req.params.id;
        var NewObj = req.body;
        model.findById(id, function(err, updatePost) {

            model.update({ _id: id }, { $set: NewObj }, function(err, result) {
                if (err) return handleError(err);
                console.log(result)
                    // res.json(result);
                return res.json({
                    message: 'Updated Successfully',
                    // _id: reception._id
                });

            });

        });

    },
    /**
     * postController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;
        model.findByIdAndRemove(id, function(err, post) {
            if (err) {
                return res.json(500, {
                    message: 'Error getting post.'
                });
            }
            return res.json(post);
        });
    },

    /**
     * postController.update()
     */
    addFbcommentsCount: function(req, res) {
        var id = req.params.id;
        var currentDate = new Date();
        req.body.created_on_string = currentDate.toString();
        model.findById(id, function(err, post) {
            if(post.comment_count === undefined){
               post.comment_count = 0; 
            }
            var postCommentCount = req.body.commentCount;
            postCommentCount = parseInt(postCommentCount);
            model.update({ _id: id }, { $set: { comment_count: postCommentCount } }, function(err, result) {
                if (err) {
                    console.log(err);
                }
                return res.json({
                    message: 'Updated Successfully',
                    // _id: reception._id
                });
            });
        });
    },
};
