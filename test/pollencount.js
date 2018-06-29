var pollenCount = require('../src/modules/pollen-count');

pollenCount.getPollenCount(function(err, count) {
    console.log(err);
    console.log(count);
});