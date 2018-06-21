var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(function(req, res, next) {
  var allowedOrigins = ['http://localhost:3000', 'http://192.168.1.22:5000'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return next();
});

app.set('port', (process.env.PORT || 3000));

// views is directory for all template files
app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var smartHomeApi = require('./routes/smartHomeV3');
app.use('/alexa-smart-home', smartHomeApi);

var nestApi = require('./routes/nestController');
app.use('/alexa-nest', nestApi);

var pollenCountFeed = require('./routes/pollenCountFeed');
app.use('/flash-briefing', pollenCountFeed);

app.get('/', function(req, res) {
  res.sendStatus(404);
});

app.get('/version', function(req, res){
  var pkgInfo = require(__dirname + '/package.json');

  res.setHeader('Content-Type', 'application/json');
  res.json({version: pkgInfo.version});
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
