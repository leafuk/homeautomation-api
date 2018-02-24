// var exports = module.exports = {};
var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commands2;
var helper = require("node-milight-promise").helper;

var Storage = require('node-storage');
var store = new Storage('/etc/homeautomation/data/milight.json');

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

  store.put('milight', {'on': true, 'color': [0, 0, 1] });

  light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone), commands.rgbw.brightness(100));
}

exports.off = function(zone) {
  zone = zone || _zone;

  store.put('milight.on', false);  

  light.sendCommands(commands.rgbw.off(zone));
}

exports.white = function(zone) {
  zone = zone || _zone;

  store.put('milight.on', true);
  store.put('milight.color', [0, 0, 1]);

  light.sendCommands(commands.rgbw.on(zone), commands.rgbw.whiteMode(zone));
}

exports.color = function(colorDecimal, zone) {
  zone = zone || _zone;
  console.log(colorDecimal);

  store.put('milight.colorDecimal', colorDecimal);

  light.sendCommands(commands.rgbw.hue(colorDecimal));
}

exports.colorHsv = function(hsv) {
  console.log(hsv);

  store.put('milight.color', hsv);

  light.sendCommands(commands.rgbw.hue(helper.hsvToMilightColor(hsv)));
}

exports.brightness = function(brightnessLevel, zone) {
  zone = zone || _zone;

  store.put('milight.brightness', brightnessLevel);

  light.sendCommands(commands.rgbw.brightness(brightnessLevel));
}

exports.getPower = function() {
  return store.get('milight.on');
}

exports.getBrightness = function() {
  return store.get('milight.brightness');
}

exports.getColor = function() {
  return store.get('milight.color');
}
