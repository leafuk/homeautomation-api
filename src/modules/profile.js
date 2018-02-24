// var exports = module.exports = {};
var request = require('request');
var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/state');

exports.getProfile = function(accessToken, cb) {
    var url = amznProfileURL + encodeURIComponent(accessToken);

    var cachedProfile = store.get('profile-' + accessToken);
    console.log('cached profile: ' + JSON.stringify(cachedProfile, null, 4));

    if (cachedProfile) {
        cb(null, cachedProfile);
    } else {
        request.get(url, function(error, response, body) {
            if (response.statusCode == 200) {
                var profile = JSON.parse(body);

                store.put('profile-' + accessToken, profile);
                cb(null, profile);
            } else {
                cb(error);
            }
        });
    }
};