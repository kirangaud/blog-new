var express = require('express');
var router = express.Router();


function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}
// post Start
var post = require('../routes/post.js');
router.use('/post', post);
// post End




module.exports = router;