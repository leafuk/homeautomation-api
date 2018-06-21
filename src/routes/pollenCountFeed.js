var express = require('express');

var router = express.Router();

router.get('/pollen', function(req, res) {

    var response = {
        "uid": "urn:uuid:1335c695-cfb8-4ebb-abbd-80da344efa6b",
        "updateDate": "2016-05-23T00:00:00.0Z",
        "titleText": "Amazon Developer Blog, week in review May 23rd",
        "mainText": "Meet Echosim. A new online community tool for developers that simulates the look and feel of an Amazon Echo.",
        "redirectionUrl": "https://developer.amazon.com/public/community/blog"
      };      

    res.setHeader('Content-Type', 'application/json');
    res.json(response);
});

module.exports = router;