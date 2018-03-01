// var exports = module.exports = {};

var exec = require('child_process').exec;
var config = require('../config.js');
var format = require('string-format');

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/harmony.json');

format.extend(String.prototype);

var changeChannelFormat = './HarmonyHubControl {harmonyIP} issue_device_command {1} {2}';

exports.freesatChannelInput = function(input) {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, input)  , function(error, stdout, stderr) { });
}

exports.freesatPowerToggle = function(input) {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, 'PowerToggle')  , function(error, stdout, stderr) { });
}

exports.tvChangeInput = function(input) {
  exec(changeChannelFormat.format(config, config.harmonySamsungTv, input)  , function(error, stdout, stderr) { });
}

exports.soundMuteToggle = function() {
  exec(changeChannelFormat.format(config, config.harmonySurroundSoundDeviceId, 'Mute')  , function(error, stdout, stderr) { });
}

exports.speakersOn = function() {
  exec(changeChannelFormat.format(config, config.harmonySurroundSoundDeviceId, 'PowerOn')  , function(error, stdout, stderr) { });
}

exports.speakersOff = function() {
  exec(changeChannelFormat.format(config, config.harmonySurroundSoundDeviceId, 'PowerOff')  , function(error, stdout, stderr) { });
}

exports.bbc1 = function() {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1')  , function(error, stdout, stderr) {
    exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '0')  , function(error, stdout, stderr) {
      exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '6')  , function(error, stdout, stderr) {
      });
    });
  });
}

exports.bbc2 = function() {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1')  , function(error, stdout, stderr) {
    exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '0')  , function(error, stdout, stderr) {
      exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '2')  , function(error, stdout, stderr) {
      });
    });
  });
}

exports.itv = function() {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1'), function(error, stdout, stderr) {
    exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1')  , function(error, stdout, stderr) {
      exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1')  , function(error, stdout, stderr) {
      });
    });
  });
}

exports.c4 = function() {
  exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '1'), function(error, stdout, stderr) {
    if(error){ console.log(error);}
    exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '2'), function(error, stdout, stderr) {
      exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, '6'), function(error, stdout, stderr) {
      });
    });
  });
}

exports.tvOn = function() {
  exec(changeChannelFormat.format(config, config.harmonySamsungTv, 'PowerOn'), function(error, stdout, stderr) {
    exec(changeChannelFormat.format(config, config.harmonySurroundSoundDeviceId, 'PowerOn'), function(error, stdout, stderr) {
      exec(changeChannelFormat.format(config, config.harmonySamsungTv, 'InputHdmi1'), function(error, stdout, stderr) {
        exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, 'PowerToggle'));
      });
    });
  });
}

exports.tvOff = function() {
  exec(changeChannelFormat.format(config, config.harmonySamsungTv, 'PowerOff'), function(error, stdout, stderr) {
    exec(changeChannelFormat.format(config, config.harmonySurroundSoundDeviceId, 'PowerOff')  , function(error, stdout, stderr) {
      //exec(changeChannelFormat.format(config, config.harmonyFreesatDeviceId, 'PowerToggle'));
    });
  });
}

exports.heatingOn = function(ip, deviceId) {
  exec(changeChannelFormat.format({ harmonyIP: ip }, deviceId, 'PowerToggle')  , function(error, stdout, stderr) {
    // exec(changeChannelFormat.format({ harmonyIP: ip }, deviceId, 'Oscillate')  , function(error, stdout, stderr) {
    // });
  });
}

exports.heatingOff = function() {
  exec(changeChannelFormat.format(config, config.harmonyDysonHeater, 'PowerToggle')  , function(error, stdout, stderr) {
  });
}
