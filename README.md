# MMM-TracCar
A [MagicMirror²](https://github.com/MichMich/MagicMirror/) module for tracking moving objects through Traccar.org APIs. This is based on a websocket connection to the Traccar.org server from where it gets the locations of the registered users. This does not only update the markers for all the registered users but also updates the map's center & zoom level. All online users have a green icon, rest are red. There is a error handling procedure in it too. Feel free to amend it and let me know of issues.

![picture](Capture.JPG)

## Using the module

* Navigate to the modules directory via the follow command: `cd MagicMirror/modules`
* Clone the module from github: `git clone https://github.com/asimhsidd/MMM-TracCar.git`
* Navigate to the MMM-TracCar directory: `cd MMM-TracCar`
* Install the dependencies: `npm install`
* Add the following configuration to the modules array in the `config/config.js` file:
```js
    modules: [
        {
			module: 'MMM-TracCar',
			position: 'top_left',
			config: {
				url: "", // Traccar Server URL (free server @ http://demo5.traccar.org )
				username: "", // Traccar Account username (email) (btw, there is a free account option too!) :)
				pass: "", // Traccar Account Password
				gmapid: "", // Google Apps key
				lat: "25.204849", // default latitude (Not Optional)
				lon: "55.270783" // default longitude (Not Optional)
			}
        }
    ]
```

## Configuration options for MMM-TracCar

| Option    	| Description
|---------------|-----------
| `position`	| *Required* The position of the screencast window. <br>**Options:** `['bottomRight', 'bottomCenter', 'bottomLeft', 'center',  'topRight', 'topCenter', 'topLeft']` <br>**Type:** `string` <br>**Note:** This module config actual sets the location, not the magic mirror position config.
| `url`  	| *Required* Your url of the Traccar.org server. <br>
| `username`   	| *Required* Your username(email) of the Traccar.org server. <br>
| `pass`   	| *Required* Your password of the Traccar.org server. <br>
| `gmapid`   		| *Required* Your google key. <br>
| `lat`   		| *Optional* Latitude of the default location. <br>
| `lon`   	| *Optional* Longitude of the default location. <br>
