// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.

function Marker(theMap) {
  
    this.map = theMap;
    this.markers = [];
    this.geocoder = null;

    var self = this;

    this.init = function() {
        self.geocoder = new google.maps.Geocoder();
        self.requestJSON("bus/wailukuloop/route1");
    };

    this.requestJSON = function(myfile) {
        if (myfile === "") return;

        // send the asynchronous request
        var asyncRequest = new XMLHttpRequest();

        var datatype = "application/json";
        asyncRequest.addEventListener("readystatechange",
            function() {
                self.parseJSON(asyncRequest);
            },
            false);

        asyncRequest.open("GET", myfile, true);
        asyncRequest.setRequestHeader("Accept", datatype);
        asyncRequest.send(); // send request
    };

    this.parseJSON = function(asyncRequest) {
        if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
            var json = JSON.parse(asyncRequest.responseText);

            for (var loc = 0; loc < json.stop.length; ++loc) {
                self.codeAddress(json.stop[loc].location);
            }
        }
    };

    this.codeAddress = function(address) {
      
        self.geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.map.setCenter(results[0].geometry.location);
                self.addMarker(results[0].geometry.location);
                self.showMarkers();
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    };

    // Add a marker to the map and push to the array.
    this.addMarker = function(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: self.map
        });
        this.markers.push(marker);
    };

    // Sets the map on all markers in the array.
    this.setAllMap = function(map) {
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].setMap(map);
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    this.clearMarkers = function() {
        self.setAllMap(null);
    };

    // Shows any markers currently in the array.
    this.showMarkers = function() {
        self.setAllMap(self.map);
    };

    // Deletes all markers in the array by removing references to them.
    this.deleteMarkers = function() {
        self.clearMarkers();
        self.markers = [];
    };
}