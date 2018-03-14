var express = require('express');
var fs = require('fs');
var nest = require('../modules/nest-cam');

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/nest.json');

var router = express.Router();

router.post('/alexa', function(req, res) {
    var event = req.body;
    var header = event.directive ? event.directive.header : event.header;
  
    switch (header.namespace) {
  
      case 'Alexa.Discovery':
          handleDiscovery(req, res);
          break;
  
      case 'Alexa.PowerController':
          powerController(req, res);
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
  
    var payload = JSON.parse(fs.readFileSync(__dirname + '/../devices-nest.json', 'utf8'));
  
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
  
    if(endpoint == 'camera') {
      var token = event.directive.payload.scope ? event.directive.payload.scope.token : event.directive.endpoint.scope.token;
      console.log(token);
      
      nest.listCameras(token, function(cams) {
        console.log(cams);

        let ids = cams.map(cam => cam.device_id);
  
        nest.setCamera(token, event.directive.header.name === "TurnOn", ids);
      });
    }
    
    var response = constructResponse(event, "powerState", event.directive.header.name === "TurnOff" ? "OFF": "ON");
  
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  };

  var stateController = function(req, res){
    var event = req.body;
  
    var properties = [];
  
    switch (event.directive.endpoint.endpointId) {
      case 'camera':
        var power = store.get('camera.on') ? 'ON' : 'OFF';
  
        properties.push({
          "namespace":"Alexa.PowerController",
          "name":"powerState",
          "value":power
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
  
    if(event.directive.endpoint.endpointId === 'camera') {
      response = exampleResponse;
    }
  
    console.log(JSON.stringify(response, null, 4));
  
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  };

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