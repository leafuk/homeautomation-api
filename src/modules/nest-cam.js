const fetch = require('node-fetch');

function listCameras(token, callback) {
    let options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }

    fetch('https://developer-api.nest.com/devices', options)
    .then(res => res.json())
    .then(result => result.cameras)
    .then(cameras => {
        let cams = [];
        Object.keys(cameras).forEach((key, index) => {
            cams.push(cameras[key]);
        });

        if (callback) {
            callback(cams);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

function setCamera(token, onOff, deviceIds, callback) {
	if (!deviceIds || deviceIds.length === 0) {
		console.log("No deviceId specified.");
		return;
	}
	
    let options = {
        method: 'PUT',
        body: JSON.stringify({ 'is_streaming': onOff }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }

    if (typeof(deviceIds) === "string") {
        deviceIds = deviceIds.split();
    }

    deviceIds.forEach(id => {
        fetch('https://developer-api.nest.com/devices/cameras/' + id, options)
        .then(result => {
            if (callback) {
                callback();
            }
        })
        .catch(err => {
            console.log("Error!");
            console.log(err);
        });
    });
}

let nestExports = {
	listCameras,
	setCamera
}

module.exports = nestExports;