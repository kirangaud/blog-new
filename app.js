const http         = require('http'),
      fs           = require('fs'),
      util         = require('util'),
      path         = require('path'),
      contentTypes = require('./utils/content-types'),
      sysInfo      = require('./utils/sys-info'),
      env          = process.env,
      express      = require('express'),
      favicon      = require('serve-favicon'),
      logger       = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser   = require('body-parser'),
      session      = require('express-session'),//Express Session
      mongodb      = require('mongodb'),//MongoDB
      mongoose     = require('mongoose'),//Mongoose
      mongoskin    = require('mongoskin'),
      routes       = require('./routes/index'),
      users        = require('./routes/users'),
      routing      = require('./routes/routing.js'),
      MongoStore   = require('connect-mongo')(session),
      busboy       = require('connect-busboy'),
      app          = express();


let url = '127.0.0.1:27017/' + process.env.OPENSHIFT_APP_NAME;

// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    url = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
}

// Connect to mongodb
let connect = function () {
    mongoose.connect(url);
};
connect();

let db = mongoose.connection;
db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy 
app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 900000000 },
    name:"KIRAN GAUD",
     store: new MongoStore({ 
        mongooseConnection: mongoose.connection,
        collection:"kirangaud_sessions"
    }),
    // store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
    }
    ));
app.use(express.static(path.join(__dirname, './public')));
app.use(busboy());    

app.use('/', routes);
app.use('/users', users);
app.use('/route', routing);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('file Not Found');
  err.status = 404;
  next(err);
});

// error handlers
//================
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error'+ err.message );
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
// respond with html page
  if (req.accepts('html')) {
    res.render('404');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Data Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('File Not found');
  // res.send('error'+ err.message );
});
let server = http.createServer(app);
// let server = http.createServer(function (req, res) {
//   let url = req.url;
//   if (url == '/') {
//     url += 'index.html';
//   }

//   // IMPORTANT: Your application HAS to respond to GET /health with status 200
//   //            for OpenShift health monitoring

//   if (url == '/health') {
//     res.writeHead(200);
//     res.end();
//   } else if (url == '/info/gen' || url == '/info/poll') {
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Cache-Control', 'no-cache, no-store');
//     res.end(JSON.stringify(sysInfo[url.slice(6)]()));
//   } else {
//     fs.readFile('./static' + url, function (err, data) {
//       if (err) {
//         res.writeHead(404);
//         res.end('Not found');
//       } else {
//         let ext = path.extname(url).slice(1);
//         if (contentTypes[ext]) {
//           res.setHeader('Content-Type', contentTypes[ext]);
//         }
//         if (ext === 'html') {
//           res.setHeader('Cache-Control', 'no-cache, no-store');
//         }
//         res.end(data);
//       }
//     });
//   }
// });

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
  console.log(`Application worker ${process.pid} started...`);
});

module.exports = app;




