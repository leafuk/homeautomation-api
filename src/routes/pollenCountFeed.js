var express = require('express');
var pollenCount = require('../modules/pollen-count');

var router = express.Router();

router.get('/pollen', function(req, res) {

    pollenCount.getPollenCount(function(err, count) {
        
        var response = {
            "uid": "urn:uuid:1335c695-cfb8-4ebb-abbd-80da344efa6z",
            "updateDate": new Date().toISOString(),
            "titleText": "Pollen Count",
            "mainText": "Today's pollen count is " + count,
            "redirectionUrl": "https://developer.amazon.com/public/community/blog"
          };      
    
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    });
});

module.exports = router;