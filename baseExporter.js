/*********************************
CORE PACKAGES
**********************************/
var mongoose = require('mongoose'),
    q = require('q'),
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs'),
    bluebirdPromise = require("bluebird"),
    express = require('express'),
    session = require('express-session'),
    mongodb = require('mongodb'),
    mongoskin = require('mongoskin'),
    ObjectID = require('mongoskin').ObjectId,
    BSON = require('mongoskin').BSONPure,
    router = express.Router();

/*********************************
GLOBAL Functions
**********************************/

function mergeByProperty(arr1, arr2, prop) {
    _.each(arr2, function(arr2obj) {
        var arr1obj = _.find(arr1, function(arr1obj) {
            return arr1obj[prop] === arr2obj[prop];
        });
        if (arr1obj) {
            _.extend(arr1obj, arr2obj)
        }
    });
}

function sortResults(prop, asc) {
    arr = arr.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]);
        else return (b[prop] > a[prop]);
    });
    showResults();
}

function randomString(strLength, charSet) {
    var result = [];
    strLength = strLength || 5;
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    while (--strLength) {
        result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }
    return result.join('');
}


function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

/*********************************
Module Package
**********************************/

var MyModule = function() {
    var getModuleName = function(queryParam) {
        var result = mongoose.modelNames();
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i].toUpperCase();
        }
        return result.sort();
    }
    var encryption = function() {
        var crypto = require('crypto');
        var assert = require('assert');
        var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
        var key = 'password';
        var text = 'I love kittens';
        var cipher = crypto.createCipher(algorithm, key);
        var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        return encrypted;

    }

    var getSchema = function(model) {
        var coll = model.collection.name;
        var data = mongoose.model(coll).schema;
        var obj = [];
        Object.keys(data.paths).forEach(function(schema) {
            obj.push({ 'key': schema, 'dataType': data.paths[schema].instance })
        });

        return obj;

    }

    function treeify(list, idAttr, parentAttr, childrenAttr) {
        if (!idAttr) idAttr = '_id';
        if (!parentAttr) parentAttr = 'parent';
        if (!childrenAttr) childrenAttr = 'items';

        var treeList = [];
        var lookup = {};
        list.forEach(function(obj) {
            lookup[obj[idAttr]] = obj;
            obj[childrenAttr] = [];
        });
        list.forEach(function(obj) {
            if (obj[parentAttr] != 'None') {
                lookup[obj[parentAttr]][childrenAttr].push(obj);
            } else {
                treeList.push(obj);
            }
        });
        return treeList;
    }

    Array.prototype.clean = function(deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    function getUserKey(sessionObj, callback) {
        var keys = base.menuModel.find({
            'name': sessionObj.role,
            "department_name": sessionObj.department
        }, function(err, result) {
            if (!err) {
                var menu = JSON.stringify(result);
                menu = JSON.parse(menu);
                callback(null, menu); // return Raw Menu for name & dept              
            } else {
                return err;
            }
        });


    }


    function userMenuData(rawMenu, callback) {
        if (rawMenu) {
            var menuKeys = [];
            var trim = [];
            var obj = {};
            var sublink = [];
            if (rawMenu.length != 0)
                for (i = 0; i < Object.keys(rawMenu[0].permissions[0]).length; i++) {
                    var key = (Object.keys(rawMenu[0].permissions[0])[i]);
                    menuKeys.push(key); //get Parent Keys for aggregation
                    var levels = Object.keys(rawMenu[0].permissions[0][key]) //get child keys
                    levels.forEach(function(data) {
                        var permission = Object.keys(rawMenu[0].permissions[0][key][data]) //get permissions of child keys
                        var linkpush = {
                            "parent_name": key, //parent key
                            "child_name": data, //child key
                            "rights": permission // permissions for child
                        }

                        sublink.push(linkpush);
                    });
                    obj = { // declare main object
                        "name": key, //parent keys
                        "levels": levels // child keys
                    }
                    trim.push(obj);
                } // end of for loop
            if (trim.length != 0)
                trim[0]["permissions"] = sublink; // permissions array
            async.map(trim, function(key, next) {
                    base.globalMenuModel.aggregate({
                        $unwind: "$level1"
                    }, {
                        $match: {
                            "title": key.name,
                            "level1.name": {
                                $in: key.levels
                            }
                        }
                    }, {
                        $group: {
                            _id: "$_id",
                            "icon": {
                                $first: "$icon"
                            },
                            "title": {
                                $first: "$title"
                            },
                            "level1": {
                                $push: "$level1"
                            }
                        }
                    }, function(err, result) {
                        result = result[0];
                        if (result) {
                            result.level1.forEach(function(data) {

                                var sublinks = []; // empty array for pushing sublinks

                                for (i = 0; i < trim[0].permissions.length; i++) {
                                    if (trim[0].permissions[i].parent_name == result.title && trim[0].permissions[i].child_name == data.name) {

                                        var purelink = data.link; // pure link of child
                                        sublinks.push(purelink); // push first link
                                        data["sublinks"] = sublinks;
                                        for (k = 0; k < trim[0].permissions[i].rights.length; k++) {
                                            var modified = purelink.slice(0, purelink.lastIndexOf("/")); // remove the last word
                                            var append = trim[0].permissions[i].rights[k];
                                            append = modified + "/" + append; //append the permission right
                                            sublinks.push(append);
                                            data["sublinks"] = sublinks; //push to the final result
                                        }
                                    }
                                }
                            });
                        }

                        next(err, result);
                    });
                },
                function(err, result) {
                    result.clean(undefined);
                    callback(null, result);
                });
        }
    }

    var userMenu = function(sessionObj) {
        if (sessionObj) {
            if ((sessionObj.role == "Admin" && sessionObj.department == "ERP") || (sessionObj.department == "KESARI IT" && sessionObj.environment == "development") || (sessionObj.role == "Tester" && sessionObj.department == "ERP" && sessionObj.environment == "development")) {
                var menuModel = require("./models/menuModel.js");
                var result = menuModel.find({
                    'isActive': true
                }, function(err, result) {
                    if (!err) {

                        return result; // return Raw Menu for name & dept              
                    } else {
                        return err;
                    }
                });
            } else {
                var roleModel = require("./models/roleModel.js");
                var result = roleModel.find({
                    'name': sessionObj.role,
                    "department_name": sessionObj.department
                }, function(err, result) {
                    if (!err) {

                        return result; // return Raw Menu for name & dept              
                    } else {
                        return err;
                    }
                });
            }
            return result;
        }

    };

    var gridCount = function(model_prefix, columns, page, search, sort_by, order, query, limit, start, draw, search_columns, table_format) {
        var limit = 20;
        var model = require('./models/' + model_prefix + 'Model.js');
        // console.log(search)
        var regex = new RegExp(search, 'i')
        var arr = columns.split(" ");
        var SchemaType = model.schema.paths;
        for (i = 0; i < Object.keys(SchemaType).length; i++) {
            var keyTruncate = (Object.keys(SchemaType)[i]);

            if (SchemaType[keyTruncate].instance !== "String") {
                arr.clean(keyTruncate);
            }
        }
        var conditions = {};
        var search_conditions = [];
        var sort_condition = {}
        for (var key in arr) {
            if (arr.hasOwnProperty(key)) {
                var value = arr[key];
                conditions[value] = regex;
                search_conditions[key] = conditions;
                conditions = {};
            }
        }
        sort_condition[sort_by] = order;
        var resultCount = 0;
        var resultRow = model.
        count();
        if (query) {
            resultRow = resultRow.and(query);
        }
        resultRow = resultRow.or(search_conditions);
        resultRow = resultRow
            .exec(function(err, resultRow) {
                console.log(resultRow);
                if (err) {
                    console.log(err);
                    resultCount = 0;
                } else {
                    resultCount = resultRow;

                    resultGrid['count'] = resultCount;
                    resultGrid['result'] = result;
                    return resultGrid;
                }
            });
    };
    var grid = function(model_prefix, columns, page, search, sort_by, order, query, limit, start, draw, search_columns, table_format) {
        var deferred = q.defer();
        var model = require('./models/' + model_prefix + 'Model.js');
        var table_format = table_format ? table_format : "";
        if (table_format == "datatable") {
            var limit = limit ? limit : 50;
            var search_by = search_by ? search_by : "";
            var sort_by = sort_by ? sort_by : "_id"; //req.body.sort;
            var order = order ? order : "desc"; //req.body.order;
            var page = 0; //req.body.page;
            var columns = columns ? columns : [];
            var search_by = search ? search : "";
            var search_columns_arr = search_columns.split(" ");
            var arr = [];
            var columns = columns ? columns : [];
            var filter_columns = {};
            _.map(columns, function(obj) {
                if (obj.data != "_id") {
                    filter_columns[obj.data] = 1;
                    arr.push(obj.data);
                }
            });

            var results = {};
            var conditions = {};
            var search_conditions = [];
            var sort_condition = {};

            //Remove search keys 
            //from Array if Data Type in Date,Number,Boolean
            //Added By Alnoor
            //on 26/04/2017.
            // Condition START
            /*var SchemaType = model.schema.paths;
            for (i = 0; i < Object.keys(SchemaType).length; i++) {
                var keyTruncate = (Object.keys(SchemaType)[i]);
                if (SchemaType[keyTruncate].instance === "Date" || SchemaType[keyTruncate].instance === "Number" || SchemaType[keyTruncate].instance === "Boolean") {
                    arr.clean(keyTruncate);
                }
            }*/
            // Condition END

            for (var a = 0; a < arr.length; a++) {
                var value = arr[a];
                if (value != "_id") {
                    var regex = new RegExp(search_by, 'i');
                    conditions[value] = regex;
                    search_conditions[a] = conditions;
                    conditions = {};
                }
            }
            sort_condition[sort_by] = order;
            async.parallel({
                count: function(callback) {
                    var result = model.
                    count();
                    if (query) {
                        result = result.and(query);
                    }
                    if (search_by != "") {
                        result = result.or(search_conditions);
                    }
                    result = result
                        .exec(function(err, result) {
                            if (err) {
                                console.log(err);
                                callback('error', err);
                            } else {
                                callback(null, result);
                            }
                        });
                },
                rows: function(callback) {
                    var result = model.
                    find({}, filter_columns);
                    if (query) {
                        result = result.and(query);
                    }
                    if (search_by != "") {
                        result = result.or(search_conditions);
                    }
                    result = result
                        .limit(limit)
                        .skip(start)
                        .sort(sort_condition)
                        .exec(function(err, result) {
                            if (err) {
                                console.log(err);
                                callback('error', err);
                            } else {
                                callback(null, result);
                            }
                        });
                }
            }, function(err, results) {
                if (!err) {
                    //  console.log(results);
                    // return results;
                    var resultGrid = {
                        count: results.count,
                        result: results.rows,
                        limit: limit,
                        start: limit * page,
                        draw: draw,
                        page: page
                    }
                    deferred.resolve(resultGrid);
                } else {
                    // return err;
                    deferred.resolve(err);
                }
            });
            return deferred.promise;
        } else {
            // console.log("hi>>>>");
            var limit = 20;
            var model = require('./models/' + model_prefix + 'Model.js');
            // console.log(search)
            var regex = new RegExp(search, 'i')
            var arr = columns.split(" ");
            var SchemaType = model.schema.paths;
            for (i = 0; i < Object.keys(SchemaType).length; i++) {
                var keyTruncate = (Object.keys(SchemaType)[i]);

                if (SchemaType[keyTruncate].instance !== "String") {
                    arr.clean(keyTruncate);
                }
            }
            var conditions = {};
            var search_conditions = [];
            var sort_condition = {}
            for (var key in arr) {
                if (arr.hasOwnProperty(key)) {
                    var value = arr[key];
                    conditions[value] = regex;
                    search_conditions[key] = conditions;
                    conditions = {};
                }
            }
            sort_condition[sort_by] = order;
            var result = model.
            find({});
            // console.log(search_conditions)
            columns = columns.concat(" is_deleted"); // is deleted Flag added to select soft deleted record from the collection.
            if (query) {
                result = result.and(query);
            }
            result = result.or(search_conditions);

            result = result
                .limit(limit)
                .skip(limit * page)
                .sort(sort_condition)
                .select(columns)
                .exec(function(err, result) {
                    if (!err) {

                        return result;

                    } else {
                        return err;
                    }
                });
            // console.log(result)
            return result;
        }
    };

    var dateFormat = function(date) {
        var date = new Date(date);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        var parseDate = day + "/" + month + "/" + year;
        return parseDate;
    }

    var dateTimeFormat = function(date) {
        var date = new Date(date);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        var getHours = date.getHours(); // => 9
        var getMinutes = date.getMinutes(); // =>  30
        var getSeconds = date.getSeconds(); // => 51
        var parseDate = day + "/" + month + "/" + year + " " + getHours + ":" + getMinutes + ":" + getSeconds;;
        return parseDate;
    }

    function convertToDate(data) {
        var day, month, year, date;
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        if (data != "") {
            data = data.replace("/", '');
            data = data.replace("/", '');
            year = data.substring(4, 8);
            month = data.substring(2, 4);
            day = data.substring(0, 2);
            date = day + " " + monthNames[parseInt(month) - 1] + " " + year + " " + "00:00:00"; // -0000
            data = new Date(date);
        }
        return data;
    }

    var randomNumber = function(strLength) {
        var result = [];
        var charSet = '123456789';
        while (--strLength) {
            result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
        }
        return result.join('');
    }
    var pad = function(a, b, c, d) {
        return a = (a || c || 0) + '', b = new Array((++b || 3) - a.length).join(c || 0), d ? a + b : b + a
    }

    return {
        treeify : treeify,
        grid: grid,
        userMenu : userMenu,
        dateFormat : dateFormat,
        dateTimeFormat : dateTimeFormat,
        convertToDate : convertToDate,
        randomNumber : randomNumber,
        pad : pad,
        gridCount : gridCount
    }
}();

module.exports = MyModule;