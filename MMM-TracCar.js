/* Magic Mirror Module: MMM-TracCar
 * v1.0.1 - May 2018
 *
 * By Asim Siddiqui <asimhsidd@gmail.com>
 * MIT License
 */

Module.register("MMM-TracCar",{
defaults: {
		map_width: 300,
		map_zoom: 15,
		map_height: 400,
		map_border_radius: 10,
		map_shadow_color: "white",
		mapSTYLE: // from https://snazzymaps.com
			[
				{
					"featureType": "all",
					"stylers": [
						{
							"saturation": 0
						},
						{
							"hue": "#e7ecf0"
						}
					]
				},
				{
					"featureType": "road",
					"stylers": [
						{
							"saturation": -70
						}
					]
				},
				{
					"featureType": "transit",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "poi",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "water",
					"stylers": [
						{
							"visibility": "simplified"
						},
						{
							"saturation": -60
						}
					]
				}
			]			
	},

start: function () {
		self = this;
		self.loaded = false;
		self.plotted = false;
		var el = document.createElement('script');
		el.src = "//maps.googleapis.com/maps/api/js?key=" + self.config.gmapid;
		el.onload = function(){
			self.sendSocketNotification("INITIATEDEVICES", self.config);
			console.log("MMM-TracCar: Google API loaded!");
		};
		document.querySelector("body").append(el);
},

getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.id = self.identifier + "_wrapper";
		if (!self.loaded) {
			wrapper.innerHTML = this.translate("MMM-TracCar is Loading.");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		// map div creation
		var mapElement = document.createElement("div");
		self.mapId = self.identifier + "_gmap";
		mapElement.id = self.mapId;
		var style = "width:"+self.config.map_width+"px; height:"+self.config.map_height+"px; -webkit-border-radius:"+self.config.map_border_radius+"px; -moz-border-radius:"+self.config.map_border_radius+"px; border-radius:"+self.config.map_border_radius+"px; -webkit-box-shadow:0px 0px 117px -6px "+self.config.map_shadow_color+"; -moz-box-shadow:0px 0px 117px -6px "+self.config.map_shadow_color+"; box-shadow:0px 0px 117px -6px "+self.config.map_shadow_color+";";
		mapElement.style = style;
		wrapper.appendChild(mapElement);
		return wrapper;
},

socketNotificationReceived: function(notification, payload){
		var self = this;
		switch(notification){
			case "Devices":
				console.log("MMM-TracCar: Devices found!");
				self.users = {};
				var devices = JSON.parse(payload);
				Object.keys(devices).forEach(function(key) {
					self.users[devices[key].id] =
					{
						name: devices[key].name,
						lastupd: devices[key].lastUpdate,
						sts: devices[key].status
					}
				});
				self.sendSocketNotification("SETUP", self.config);
				break;
			case "Position":
				var positions = JSON.parse(payload).positions;
				if (positions == null && typeof positions !== 'object'){ break; }
				if (!self.plotted){ // Create the map, create the markers
					console.log("MMM-TracCar: Connections made, setting up the map & markers!");
					self.map = "";
					self.marks = {};
					self.loaded = true;
					self.updateDom(500);
					setTimeout( function(){ // In order for the dom to get updated first
						self.map  = new google.maps.Map(
								document.getElementById(self.mapId),
								{
									zoom: self.config.map_zoom,
									styles: self.config.mapSTYLE
								}
						);
						Object.keys(positions).forEach(function(key) {
							var name = self.users[positions[key].deviceId].name;
							var iconimg = self.users[positions[key].deviceId].sts == "online" ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" : "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
							self.marks[positions[key].deviceId] = new google.maps.Marker({
								position: new google.maps.LatLng(positions[key].latitude,positions[key].longitude),
								map:self.map,
								icon: iconimg
							});
							var infowindow = new google.maps.InfoWindow();
							infowindow.setContent(name);
							infowindow.open(self.map, self.marks[positions[key].deviceId]);
						});
						self.plotted = true;
						self.bounds = self.createBoundsForMarkers(self.marks);
						self.map.fitBounds(self.bounds);
						self.map.panToBounds(self.bounds);
					}, 1000);
				}else{ // Just reposition the markers
					console.log("MMM-TracCar: Repositioning the markers!");
					Object.keys(positions).forEach(function(key) {
						var name = self.users[positions[key].deviceId].name;
						self.marks[positions[key].deviceId].setPosition({lat:positions[key].latitude, lng:positions[key].longitude, alt:0});
					});
					self.bounds = self.createBoundsForMarkers(self.marks);
					self.map.fitBounds(self.bounds);
					self.map.panToBounds(self.bounds);
				}
				break;
			case "Error":
				// All error handling
				var wrapper = document.getElementById(self.identifier + "_wrapper");
				var k = 15;
				var loader = setInterval(function(){ 
					wrapper.innerHTML = "Could not connect to <b>Traccar.org</b> server.<br/>Will retry reconnecting in "+k+" seconds.";
					k--;
				}, 1000);
				setTimeout(function(){
					clearInterval(loader);
					self.sendSocketNotification("INITIATEDEVICES", self.config);
					wrapper.innerHTML = "MMM-TracCar is Loading.";
				},k*1000);
				break;
		}

	},

createBoundsForMarkers: function (markers) { // helper function
    var bounds = new google.maps.LatLngBounds();
    Object.keys(markers).forEach(function(key) {
        bounds.extend(markers[key].getPosition());
    });
    return bounds;
}

});
