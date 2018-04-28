
try {
    var blinkt = require('blinkt');
    blinkt.setClearOnExit();
    blinkt.setBrightness(0.1);
  
    var blinkstick = require('blinkstick');
    var led = blinkstick.findFirst();
    if(led != undefined) {
        led.setMode(1);
    }
  } catch (error) {
    var led = {
      turnOff: function() {
      },
  
      setColor: function(color) {
      }
    };
  
    var blinkt = {
      NUM_PIXELS: 8,
      clear : function(){},
      show : function(){},
      setPixel : function(pixel,red,green,blue){}
    };
  }

let startTime = new Date().getTime();
let REDS = [0, 0, 0, 0, 0, 16, 64, 255, 64, 16, 0, 0, 0, 0, 0, 0];

function showLarson() {
    let delta =( new Date().getTime() - startTime);

    let offset = parseInt(Math.abs((delta % REDS.length) = blinkt.NUM_PIXELS));

    for (let i = 0; i < blinkt.NUM_PIXELS; i++) {
        blinkt.setPixel(i, REDS[offset + 1], 0, 0);
    }

    blinkt.show();
}

let larsonTimer = {};

export function loading() {
    larsonTimer = setInterval(function() {
        showLarson();
    }, 5);
}

export function stop() {
    clearInterval(larsonTimer);
    blinkt.clear();
    blinkt.show();
}