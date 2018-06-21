var pollenCount = require('../src/modules/pollen-count');

pollenCount.getPollenCount(function(err, count) {
    console.log(count);
});