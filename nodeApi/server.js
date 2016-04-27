// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var getRawBody = require('raw-body')
var typer = require('media-typer')


app.use(function (req, res, next) {
  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb'
  }, function (err, string) {
    if (err) return next(err)
    req.text = string
    next()
  });
});

// configure app to use bodyParser()
// this will let us get the data from a POST
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "OPTIONS, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
});

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================

var hazards = require('./routes/hazards');
var incidents = require('./routes/incidents');
var observations = require('./routes/observations');
var referenceData = require('./routes/referencedata');
var reports = require('./routes/reports');
var safetyWalk = require('./routes/safetyWalk');
var serviceRequest = require('./routes/serviceRequest');
var tasks = require('./routes/tasks');


var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "OPTIONS, Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res, next) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.use('/v1', hazards);
app.use('/v1', incidents);
app.use('/v1', observations);
app.use('/v1', referenceData);
app.use('/v1', reports);
app.use('/v1', safetyWalk);
app.use('/v1', serviceRequest);
app.use('/v1', tasks);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
