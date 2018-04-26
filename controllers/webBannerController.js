var model = require('../models/webBannerModel.js');
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
     * webBannerController.list()
     */
    list: function(req, res) {
        model.find(function(err, webBanner){
            if(err) {
                return res.json(500, {
                    message: 'Error getting webBanner.'
                });
            }
            return res.json(webBanner);
        });
    },

    /**
     * webBannerController.show()
     */
    show: function(req, res) {
        var id = req.params.id;
        model.findOne({_id: id}, function(err, webBanner){
            if(err) {
                return res.json(500, {
                    message: 'Error getting webBanner.'
                });
            }
            if(!webBanner) {
                return res.json(404, {
                    message: 'No such webBanner'
                });
            }
            return res.json(webBanner);
        });
    },

    /**
     * webBannerController.create()
     */
    create: function(req, res) {
        var webBanner = new model(req.body);
        webBanner.save(function(err, webBanner){
            if(err) {
                return res.json(500, {
                    message: 'Error saving webBanner',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: webBanner._id
            });
        });
    },

    /**
     * webBannerController.update()
     */
    update: function(req, res) {
        var id = req.params.id;
        var NewObj = req.body;
        model.findById(id, function (err, webBanner) {
         var  old =  JSON.stringify(webBanner);
          old = JSON.parse(old);
           NewObj.historyData = webBanner.historyData||[]
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
     * webBannerController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;
        model.findByIdAndRemove(id, function(err, webBanner){
            if(err) {
                return res.json(500, {
                    message: 'Error getting webBanner.'
                });
            }
            return res.json(webBanner);
        });
    }
};