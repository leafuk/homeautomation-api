// var exports = module.exports = {};

var exec = require('child_process').exec;

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/tplink.json');

exports.on = function(ip, port) {
  exec(__dirname + '/hs100.sh ' + ip + ' ' + port + ' on', function(error, stdout, stderr) {
    if(error) {
      console.log(error);
    } else {
      store.put('hs100.on', true);
    }
  });
}

exports.off = function(ip, port) {
  exec(__dirname + '/hs100.sh ' + ip + ' ' + port + ' off', function(error, stdout, stderr) {
    if(error) {
      console.log(error);
    } else {
      store.put('hs100.on', false);
    }
  });
}
