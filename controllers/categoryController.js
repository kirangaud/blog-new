var model = require('../models/categoryModel.js');
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
     * categoryController.list()
     */
    list: function(req, res) {
        model.find(function(err, category){
            if(err) {
                return res.json(500, {
                    message: 'Error getting category.'
                });
            }
            return res.json(category);
        });
    },

    /**
     * categoryController.show()
     */
    show: function(req, res) {
        var id = req.params.id;
        model.findOne({_id: id}, function(err, category){
            if(err) {
                return res.json(500, {
                    message: 'Error getting category.'
                });
            }
            if(!category) {
                return res.json(404, {
                    message: 'No such category'
                });
            }
            return res.json(category);
        });
    },

    /**
     * categoryController.create()
     */
    create: function(req, res) {
        var category = new model(req.body);
        category.save(function(err, category){
            if(err) {
                return res.json(500, {
                    message: 'Error saving category',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: category._id
            });
        });
    },

    /**
     * categoryController.update()
     */
    update: function(req, res) {
        var id = req.params.id;
        var NewObj = req.body;
        model.findById(id, function (err, category) {
         var  old =  JSON.stringify(category);
          old = JSON.parse(old);
           NewObj.historyData = category.historyData||[]
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
     * categoryController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;
        model.findByIdAndRemove(id, function(err, category){
            if(err) {
                return res.json(500, {
                    message: 'Error getting category.'
                });
            }
            return res.json(category);
        });
    }
};