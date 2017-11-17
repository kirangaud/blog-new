var model = require('../models/productModel.js');
var _ = require('underscore');

function convertToDateNew(data) {
    var day, month, year, date;
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    if (data != "") {
        data = data.split('/')
        year = data[2];
        month = data[1];
        day = data[0];
        date = day + " " + monthNames[parseInt(month) - 1] + " " + year + " " + "00:00:00 -0000";
        data = new Date(date);
    }
    return data;
}
module.exports = {

    /**
     * productController.list()
     */
    list: function(req, res) {
        model.find(function(err, product){
            if(err) {
                return res.json(500, {
                    message: 'Error getting product.'
                });
            }
            return res.json(product);
        });
    },

    /**
     * productController.show()
     */
    show: function(req, res) {
        var id = req.params.id;
        model.findOne({_id: id}, function(err, product){
            if(err) {
                return res.json(500, {
                    message: 'Error getting product.'
                });
            }
            if(!product) {
                return res.json(404, {
                    message: 'No such product'
                });
            }
            return res.json(product);
        });
    },

    /**
     * productController.create()
     */
    create: function(req, res) {
        var product = new model(req.body);
        product.save(function(err, product){
            if(err) {
                return res.json(500, {
                    message: 'Error saving product',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: product._id
            });
        });
    },

    /**
     * productController.update()
     */
    update: function(req, res) {
        var id = req.params.id;
        var NewObj = req.body;
        model.findById(id, function (err, product) {
         var  old =  JSON.stringify(product);
          old = JSON.parse(old);
           NewObj.historyData = product.historyData||[]
           delete old['historyData'];
          NewObj.historyData.push(old);
         model.update({_id: id}, {$set: NewObj}, function (err, tank) {
        if (err) return handleError(err);
              console.log(tank)
             // res.json(tank);
             return res.json({
                message: 'Updated Successfully',
                // _id: reception._id
            });
            
      });
        
         }); 
   
    },


    /**
     * productController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;
        model.findByIdAndRemove(id, function(err, product){
            if(err) {
                return res.json(500, {
                    message: 'Error getting product.'
                });
            }
            return res.json(product);
        });
    }
};