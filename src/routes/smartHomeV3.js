var express = require('express');
var hsv = require("hsv-rgb");
var fs = require('fs');


var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/smarthome.json');

var profile = require('../modules/profile');
var milight = require('../modules/milight-controller.js');
var harmony = require('../modules/harmony-controller.js');
var tplink = require('../modules/hs100-controller');
var nest = require('../modules/nest-cam');

try {
  var blinkt = require('blinkt');
  blinkt.setClearOnExit();
  blinkt.setBrightness(0.1);

  var blinkstick = require('blinkstick');
  var led = blinkstick.findFirst();
  if(led != undefined) {
      led.setMode(1);
  }
} catch (error) {
  var led = {
    turnOff: function() {
    },

    setColor: function(color) {
    }
  };

  var blinkt = {
    NUM_PIXELS: 0,
    clear : function(){},
    show : function(){},
    setPixel : function(pixel,red,green,blue){}
  };
}

var router = express.Router();

router.use(function(req, res, next) {
  for (var i = 0; i < blinkt.NUM_PIXELS; i++) {
    blinkt.setPixel(i, 0, 0, 255);
  }

  blinkt.show();

  next();
})

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
  console.log(JSON.stringify(req.body, null, 4));

  var event = req.body;

  var token = event.directive.payload.scope ? event.directive.payload.scope.token : event.directive.endpoint.scope.token;

  profile.getProfile(token, function(error, user) {
    if(error) { console.log(error); }
    // Only the authorised user can call this
    if (user === null || user.email !== process.env.authorised_email) {
      res.status(403).send('Not allowed!');
    }

    res.user = user;
    next();  
  });
});

router.post('/alexa', function(req, res){
  var event = req.body;
  var header = event.directive ? event.directive.header : event.header;

  switch (header.namespace) {

    case 'Alexa.Discovery':
        handleDiscovery(req, res);
        break;

    case 'Alexa.PowerController':
        powerController(req, res);
        break;

    case 'Alexa.BrightnessController':
        brightnessController(req, res);
        break;

    case 'Alexa.ColorController':
        colorController(req, res);
        break;

    case 'Alexa':
        stateController(req, res);
        break;

        /**
         * We received an unexpected message
         */
    default:
        log('Err', 'No supported namespace: ' + header.namespace);

        res.setHeader('Content-Type', 'application/json');
        res.json(constructError(event));
        break;
  }
});

var handleDiscovery = function (req, res) {
  var event = req.body;

  var payload = JSON.parse(fs.readFileSync(__dirname + '/../devices.json', 'utf8'));

  var headers = {
    messageId: event.directive.header.messageId,
    name: "Discover.Response",
    namespace: "Alexa.Discovery",
    payloadVersion: "3"
  };

  var result = {
    event: {
      header: headers,
      payload: payload
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.json(result);
};

var powerController = function(req, res) {
  var event = req.body;

  var endpoint = event.directive.endpoint.endpointId;

  if(endpoint === 'everything') {
    controlEverything(event);
  }

  if(endpoint === 'milights') {
    milight.setIp(event.directive.endpoint.cookie.ip);
    event.directive.header.name === "TurnOff" ? milight.off() : milight.on();
  }

  if(endpoint === 'ikea-led') {
    if(event.directive.header.name === "TurnOn") {
      led.setColor('#FFFFFF', function() { /* called when color is changed */ });
      store.put('ikea.on', true); 
      store.put('ikea.color', [0, 0, 1]);
    } else {
      led.turnOff();
      store.put('ikea.on', false); 
    }
  }

  if(endpoint === 'heater') {
    harmony.heatingOn(event.directive.endpoint.cookie.harmonyIP, event.directive.endpoint.cookie.harmonyId);
  }

  if(endpoint == 'camera') {
    var token = event.directive.payload.scope ? event.directive.payload.scope.token : event.directive.endpoint.scope.token;
    console.log(token);
    
    nest.listCameras(token, function(camIds) {
      console.log(camIds);

      nest.setCamera(token, event.directive.header.name === "TurnOn", camIds);
    });
  }
  
  var response = constructResponse(event, "powerState", event.directive.header.name === "TurnOff" ? "OFF": "ON");

  blinkt.clear();
  blinkt.show();

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
};

var brightnessController = function(req, res) {
  var event = req.body;

  // default to error
  var response = constructError(event);

  var endpoint = event.directive.endpoint.endpointId;

  if(endpoint === 'milights') {
    milight.setIp(event.directive.endpoint.cookie.ip);

    if(event.directive.header.name === "SetBrightness") {
      var brightnessPercentage = event.directive.payload.brightness;
      milight.brightness(brightnessPercentage, 0);

      response = constructResponse(event, "brightness", brightnessPercentage);
    } else {
      var brightnessDelta = event.directive.payload.brightnessDelta < 0 ? 20 : 100;
      milight.brightness(brightnessDelta, 0);

      response = constructResponse(event, "brightness", brightnessDelta);      
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
};

var colorController = function(req, res) {
  var event = req.body;

  // default to error
  var response = constructError(event);

  var endpoint = event.directive.endpoint.endpointId;

  if(endpoint === 'milights') {
    milight.setIp(event.directive.endpoint.cookie.ip);

    if(event.directive.header.name === "SetColor") {
      var color = event.directive.payload.color;

      if(color.hue === 0 && color.saturation === 0) {
        // Set to White
        milight.on(0);
      } else {
        // Set to provided Colour
        milight.colorHsv([color.hue, color.saturation, color.brightness]);
      }

      response = constructResponse(event, "color", color);
    }
  }

  if(endpoint === 'ikea-led') {
    var color = event.directive.payload.color;
    var h = color.hue;
    var s = Math.floor(color.saturation * 100);
    var b = Math.floor(color.brightness * 100);

    var rgb = hsv(h, s, b);

    led.setColor(rgb[0], rgb[1], rgb[2]);

    store.put('ikea.color', [color.hue, color.saturation, color.brightness]);

    response = constructResponse(event, "color", color);   
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
};

var stateController = function(req, res){
  var event = req.body;

  var properties = [];

  switch (event.directive.endpoint.endpointId) {
    case 'everything':
      var power = store.get('everything.on') ? 'ON' : 'OFF';

      properties.push({
        "namespace":"Alexa.PowerController",
        "name":"powerState",
        "value":power
      });

      break;

    case 'ikea-led':
      var power = store.get('ikea.on') ? 'ON' : 'OFF';
      properties.push({
        "namespace":"Alexa.PowerController",
        "name":"powerState",
        "value":power
      });

      var color = store.get('ikea.color');
      properties.push({
        "namespace":"Alexa.ColorController",
        "name":"color",
        "value":{
          "hue": color[0],
          "saturation": color[1],
          "brightness": color[2]
        }
      });

      break;

    case 'milights':
      var power = milight.getPower() ? 'ON' : 'OFF';
      var brightness = milight.getBrightness();
      var color = milight.getColor();
      
      properties.push({
        "namespace":"Alexa.PowerController",
        "name":"powerState",
        "value":power
      });

      properties.push({
        "namespace":"Alexa.BrightnessController",
        "name":"brightness",
        "value":brightness
      });
      properties.push({
        "namespace":"Alexa.ColorController",
        "name":"color",
        "value":{
          "hue": color[0],
          "saturation": color[1],
          "brightness": color[2]
        }
      });

      break;

    default:
      break;
  }

  // default to error
  var response = constructError(event);

  var exampleResponse = {
    "context": {
       "properties": properties
    },
    "event":{
       "header":{
          "messageId":event.directive.header.messageId,
          "correlationToken":event.directive.header.correlationToken,
          "namespace":"Alexa",
          "name":"StateReport",
          "payloadVersion":"3"
       },
       "endpoint":event.directive.endpoint,
       "payload":{
       }
    }
  }

  if(event.directive.endpoint.endpointId === 'milights' ||
      event.directive.endpoint.endpointId === 'everything' ||
      event.directive.endpoint.endpointId === 'ikea-led') {

    response = exampleResponse;
  
  }

  console.log(JSON.stringify(response, null, 4));

  res.setHeader('Content-Type', 'application/json');
  res.json(response);
};

var controlEverything = function(event) {
  if(event.directive.header.name === "TurnOff") {
    milight.off();
    led.turnOff();
    tplink.off(event.directive.endpoint.cookie.ip, event.directive.endpoint.cookie.port);
    harmony.tvOff();

    store.put('everything.on', true);
  } else {
    milight.on();
    led.setColor('#FFFFFF', function() { /* called when color is changed */ });
    tplink.on(event.directive.endpoint.cookie.ip, event.directive.endpoint.cookie.port);
    harmony.tvOn();

    store.put('everything.on', false);
  }
}

var constructResponse = function(event, name, value) {
  var response = {
    "context": {
      "properties": [ {
        "namespace": event.directive.header.namespace,
        "name": name,
        "value": value,
        //"timeOfSample": "2017-02-03T16:20:50.52Z",
        //"uncertaintyInMilliseconds": 500
      } ]
    },
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "Response",
        "payloadVersion": "3",
        "messageId": event.directive.header.messageId,
        "correlationToken": event.directive.header.correlationToken
      },
      "endpoint": event.directive.endpoint,
      "payload": {}
    }
  }

  return response;
}

var constructError = function(event) {
  return {
    "event": {
        "header": {
          "namespace": "Alexa",
          "name": "ErrorResponse",
          "messageId": event.directive.header.messageId,
          "correlationToken": event.directive.header.correlationToken,
          "payloadVersion": "3"
        },
        "endpoint":{
            "endpointId":event.directive.endpoint.endpointId
        },
        "payload": {
          "type": "ENDPOINT_UNREACHABLE",
          "message": "Unable to reach device because it appears to be offline"
        }
      }
    }    
}

module.exports = router;