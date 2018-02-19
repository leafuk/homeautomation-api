// var exports = module.exports = {};

var exec = require('child_process').exec;

exports.on = function(ip, port) {
  exec(__dirname + '/hs100.sh ' + ip + ' ' + port + ' on', function(error, stdout, stderr) {
    if(error) {
      console.log(error);
    }
  });
}

exports.off = function(ip, port) {
  exec(__dirname + '/hs100.sh ' + ip + ' ' + port + ' off', function(error, stdout, stderr) {
    if(error) {
      console.log(error);
    }
  });
}
