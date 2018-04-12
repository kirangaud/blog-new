 const  express                = require('express'),
        router                 = express.Router(),
        request                = require('request'),
        session                = require('express-session'), //Express Session

        model                  = require('../models/postModel.js'),
        usersModel             = require('../models/usersModel.js'),
        imageModel             = require('../models/imageModel.js'),
        googleDriveImagesModel = require('../models/googleDriveImagesModel.js');



function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}


function getCategoryData(category){
    var metaData = {};
    switch (category) {
        case 'photography':
            metaData['title'] = 'Kiran Gaud | Pre-wedding,product,landscape and portrait photography.'
            metaData['description'] = 'Kiran Gaud specializes in pre-wedding,product,landscape and portrait photography.'
            return metaData;
            break;
        case 'reviews':
            metaData['title'] = 'Reviews on books, movies, lifestyle & fashion.'
            metaData['description'] = 'Kiran Gaud|Read reviews on books, movies, lifestyle & fashion.'
            return metaData;
            break;
        case 'art':
            metaData['title'] = 'Kiran Gaud|Paintings for sale, paintings for living room, affordable art & unframed art.'
            metaData['description'] = 'Kiran Gaud|Buy Paintings for sale, paintings for living room, affordable art & unframed art.'
            return metaData;
            break;
        default:
            metaData['title'] = 'Kiran Gaud|Blogs on photography,art,fashion,book reviews and travel.'
            metaData['description'] = 'Kiran Gaud|Blogs on photography,art,fashion,book reviews and travel.'
            return metaData;
    }
}


router.use(function(req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

router.get('/login', function(req, res, next) {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login', {
            title: 'Login'
        });
    }
});

router.post('/login', function(req, res, next) {
    var login_req = {};
    login_req.username = req.body.username ? req.body.username : '';
    login_req.password = req.body.password ? req.body.password : '';
    usersModel
        .findOne({
            "username": login_req.username,
            "password": login_req.password,
        })
        .exec(function(err, result) {
            if (result) {
                var user = {
                    username: req.body.username,
                    user_right: "admin"
                }
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                req.session.error = 'Username or password is incorrect.';
                res.redirect('/login');
            }
        });

});

router.get('/', function(req, res) {
    res.render('index', {
        title: 'Homepage',
    });
});

router.get('/prelaunch', function(req, res) {
    res.render('index_prelaunch', {
        title: 'Homepage',
    });
});



router.get('/details', function(req, res) {
    res.render('details', {
        title: 'Homepage',
    });
});

router.get('/posts/:query', function(req, res) {
    var query = (req.params.query);
    var queryNew = query.replace(/_/g, ' ');
    model.findOne({ posts_title: queryNew }, function(err, post) {
        if (err) {
            res.render('details_new', {
                title: queryNew,
            });
        }
        if (!post) {
            res.render('details_new', {
                title: queryNew,
            });
        }
        post = JSON.parse(JSON.stringify(post));
        var postHeader = post.post_header_content.replace(/<(?:.|\n)*?>/gm, '');
        postHeader = postHeader.replace(/"/g, ' ');
        postHeader = postHeader.replace(/'/g, ' ');
        if(post.fb_desc){
            postHeader = post.fb_desc;
        }

        var description = post.post_description;
        var rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
        var src = rex.exec(description);
        var metaImage;
         if(src != null){
            if(src[1].startsWith("/images/") === true){
               metaImage =  src[1];
            }else{
                metaImage = post.post_header_images[0];
            }
        }else{
                metaImage = post.post_header_images[0];
            }
            metaImage = metaImage;

        res.render('details_new', {
            title: post.title,
            postLink: query,
            disc: postHeader,
            image: metaImage,
            meta_keywords: post.meta_keywords,
            meta_description: post.meta_description,
            meta_tag: post.meta_tag,
            url: 'http://www.kirangaud.com/posts/' + query
        });
    });
});

router.get('/category/:query', function(req, res) {
    var query = (req.params.query);
    res.render('categories', {
        title: query,
        metaData : getCategoryData(query)
    });
});


router.get('/tag/:query', function(req, res) {
    var query = (req.params.query);
    res.render('tag', {
        title: query,
    });
});


router.get('/about', function(req, res) {
    res.render('about', {
        title: 'Homepage',
    });
});


router.get('/dashboard', function(req, res) {
    if (req.session.user) {
        res.render('dashboard', {
            title: 'Dashboard',
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/imagesBrowse', function(req, res) {
    if (req.session.user) {
        res.render('imageBrowse', {
            title: 'Images',
        });
    } else {
        res.redirect('/login');
    }
});


router.get('/imageList', function(req, res) {
    googleDriveImagesModel
        .find({
            // isActive : true
        })
        .exec(function(err, post) {
            if (err) {
                return res.json(500, {
                    message: 'Error getting post.'
                });
            }
            return res.json(post);
        });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
    req.session.destroy(function() {
        res.redirect('/login');
    });
});


module.exports = router;
