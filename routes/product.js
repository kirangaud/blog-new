/********************************************
CORE Packages
*********************************************/
var express   = require('express'),
    q         = require('q'),
    router    = express.Router();

/********************************************
Module Packages
*********************************************/
var controller  = require('../controllers/productController.js'),
    baseExport  = require('../baseExporter');

router.get('/master', function(req, res, next) {
    if (req.session.user) {
        res.render('productMaster', { "username": req.session.user, title: 'Express' });
    } else {
        res.render("login");
    }
});



router.post('/grid-view', function(req, res, next) {
var columns=req.body.columns;
var search_by=req.body.search_by;
var sort=req.body.sort;
var order=req.body.order;
var page=req.body.page;
q.all(baseExport.grid("bus",columns,page,search_by,sort,order)).then(function(result) {
  var grid=JSON.stringify(result);
   grid = JSON.parse(grid);
  res.render('./partials/grid-view',{
            "grid" :grid,
            "columns":columns,
            "module":"bus" 
        });
});
});

router.post('/data-grid-view', function(req, res, next) {
    // if (req.session.user) {
        var columns = req.body.columns;
        var search_by = req.body.search_by;
        var sort = "_id";
        var order = "desc";
        var page = req.body.page;
        var query = {};

        var limit = req.body.limit ? req.body.limit : 50;
        var sort_by = req.body.sort_by ? req.body.sort_by : "_id";
        var draw = req.body.draw ? parseInt(req.body.draw) : 1;
        var start = req.body.start ? parseInt(req.body.start) : 0;
        var table_format = req.body.table_format ? req.body.table_format : "";

        query = req.body.search_query;
        q.all(baseExport.grid("product", columns, page, search_by, sort, order, query, parseInt(limit), start, draw, "", table_format)).then(function(result) {
            res.json(result);
        });
    /*} else {
        return res.json(500, {
            message: 'session expired'
        });

    }*/
});

/********************************************
GET Requests
*********************************************/
router.get('/', function(req, res) {
    controller.list(req, res);
});

router.get('/:id', function(req, res) {
    controller.show(req, res);
});


/********************************************
POST Requests
*********************************************/
router.post('/', function(req, res) {
    controller.create(req, res);
});


/********************************************
PUT Requests
*********************************************/
router.put('/:id', function(req, res) {
    controller.update(req, res);
});

module.exports = router;
