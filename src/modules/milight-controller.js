// var exports = module.exports = {};
var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commands2;
var helper = require("node-milight-promise").helper;

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/state');

var light = new Milight({
        ip: "192.168.1.23",
        delayBetweenCommands: 80,
        commandRepeat: 2
    }),
    _zone = 0;

exports.setIp = function(ip) {
  light = new Milight({
    ip: ip,
    delayBetweenCommands: 80,
    commandRepeat: 2
  });
}

exports.on = function(zone) {
  zone = zone || _zone;
  light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));

  store.put('milight.on', true);
}

exports.off = function(zone) {
  zone = zone || _zone;
  light.sendCommands(commands.rgbw.off(zone));

  store.put('milight.on', false);  
}

exports.white = function(zone) {
  zone = zone || _zone;
  light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone));
}

exports.color = function(colorDecimal, zone) {
  zone = zone || _zone;
  light.sendCommands(commands.rgbw.hue(colorDecimal));
}

exports.colorHsv = function(hsv) {
  console.log(hsv);
  light.sendCommands(commands.rgbw.hue(helper.hsvToMilightColor(hsv)));
}

exports.brightness = function(brightnessLevel, zone) {
  zone = zone || _zone;
  light.sendCommands(commands.rgbw.brightness(brightnessLevel));
}
