// var exports = module.exports = {};
var request = require('request');
var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';

exports.getProfile = function(accessToken, cb) {
    var url = amznProfileURL + encodeURIComponent(accessToken);

    request.get(url, function(error, response, body) {
        if (response.statusCode == 200) {
            var profile = JSON.parse(body);
            cb(null, profile);
        } else {
            cb(error);
        }
    });
};