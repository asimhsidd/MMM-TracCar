/* Magic Mirror
 * Node Helper: MMM-TracCar
 *
 * By asimhsidd
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const RQ = require('request');
const WSO = require('ws');

module.exports = NodeHelper.create({

	start: function() {
		console.log("Starting NodeHelper for " + this.name + "module.");

	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		var urlstring = payload.url;
		switch(notification) {
			case "INITIATEDEVICES":
				var auth = {'Authorization': "Basic " + Buffer.from(payload.username + ":" + payload.pass).toString('base64')};
				RQ.get(
					{
						headers: auth,
						url: urlstring+"/api/devices"
					},
					function(error, response){
						if(response.body.substring(0, 1) === '['){ // I am quite ashamed of this, but this is just to make things work!
							self.sendSocketNotification("Devices",response.body);
							return;
						}
						self.sendSocketNotification("Error","Error");
					}
				);
				break;
			case "SETUP":
				var body = "email="+payload.username+"&password="+payload.pass;
				RQ.post(
					{
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
						url: urlstring+"/api/session",
						body: body
					},
					function(error, response){
						if(response.body.substring(0, 1) === '['){ // I am quite ashamed of this, but this is just to make things work!
							self.sendSocketNotification("Error","Error");
							return;
						}
						self.socket = new WSO(urlstring.replace("http","ws")+'/api/socket', [],
						{
							'headers': { 'Cookie': response.headers['set-cookie'][0] }
						});

						self.socket.on('error',  function (e) {
							self.sendSocketNotification("Error","Error");
						});

						self.socket.on('open', function () {
							self.sendSocketNotification("Update","Connected");
						});

						self.socket.on('disconnect', function(){
							self.sendSocketNotification("Error","Error");
						});

						self.socket.on('message', function(message, flags){
							self.sendSocketNotification("Position",message);
						});

					}
				);
				break;
		}
	}
});
