var request = require('request');

var loc_lat = '53.4282559';
var loc_long = '-3.0700538';
var base_url = 'https://socialpollencount.co.uk/api/forecast?location=';
var url = base_url+'['+loc_lat+','+loc_long+']';

var today = new Date().toISOString().substr(0,10);

if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}

exports.getPollenCount = function(cb) {
    request(
        {
            url: url,
            json: true
        },
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                body.forecast.forEach(function (item) {
                    if (item.date.contains(today)) {
                        console.log('Pollen level: ', item.pollen_count);
                        cb(null, item.pollen_count);
                    }
                });
            }
            if (error) {
                console.log('Something went wrong...');
                console.log(error);
                cb(error);
            }
        }
    );
}