// var exports = module.exports = {};
var request = require('request');
var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/state');

exports.getProfile = function(accessToken, cb) {
    var url = amznProfileURL + encodeURIComponent(accessToken);

    var cachedToken = store.get('lastToken');
    var cachedProfile = store.get('profile');

    console.log('cached token: ' + cachedToken);

    if(cachedToken === accessToken && cachedProfile != undefined) {
        cb(null, cachedProfile);
    } else {
        request.get(url, function(error, response, body) {
            if (response.statusCode == 200) {
                var profile = JSON.parse(body);

                store.put('lastToken', accessToken);
                store.put('profile', profile);
                
                cb(null, profile);
            } else {
                cb(error);
            }
        });
    }
};