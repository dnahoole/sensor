function GIS() {

    const apikey = 'AIzaSyCqZvNGEW2Wo_UtukN9jl3YLUe3WK2h8wY';
    
    //--- Object attributes
    this.geocoder = null;
    this.map = null;
    this.markers = [];
    this.meta = [];
    
    this.last_marker = null;
    
    var self = this;
    
    this.init = function() {
        self.geocoder = new google.maps.Geocoder();
        var mapOptions = {
            center: new google.maps.LatLng(20.8911111, -156.5047222),
            zoom: 10
        };
        self.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        document.getElementById('goto').addEventListener('click', function(){self.geocodeAddress()}, false);
        document.getElementById('fusion').addEventListener('focus', function(){self.fusionLayer()}, false);
        document.getElementById('sensors').addEventListener('focus', function(){self.sensorLayer()}, false);
        document.getElementById('menu').addEventListener('change', function(){self.menuUpdate()}, false);
        document.getElementById('dpmenu').addEventListener('change', function(){self.dpmenuUpdate()}, false);
        document.getElementById('ssmenu').addEventListener('change', function(){self.ssmenuUpdate()}, false);
    };
    
    this.menuUpdate = function(e) {
        var flag = document.getElementById("menu").checked;
        if (flag) {
            document.getElementById('menubox').style.height = "400%";
        } else {
            document.getElementById('menubox').style.height = "100%";
        }
    };
    
    this.dpmenuUpdate = function(e) {
        var flag = document.getElementById("dpmenu").checked;
        if (flag) {
            document.getElementById('sec1').style.height = "50%";
            document.getElementById('sec1').style.top = "50%";
        } else {
            document.getElementById('sec1').style.height = "6%";
            document.getElementById('sec1').style.top = "93%";
        }
    };
    
    this.ssmenuUpdate = function(e) {
        var flag = document.getElementById("ssmenu").checked;
        if (flag) {
            document.getElementById('sec2').style.height = "50%";
            document.getElementById('sec2').style.top = "50%";
        } else {
            document.getElementById('sec2').style.height = "6%";
            document.getElementById('sec2').style.top = "93%";
        }
    };
    
    this.fusionInfo = function(e) {
        document.getElementById('sec1info').style.position = 'relative';
        document.getElementById('sec1info').style.height = '100%';
        document.getElementById('sec1info').style.width = '100%';
        document.getElementById('sec1info').style.textAlign = 'center';
        document.getElementById('sec1info').innerHTML = null;
        
        var img1 = document.createElement("IMG");
        img1.id = "cat";
        img1.src = " ";
        img1.alt = "Catepillar image";
        document.getElementById('sec1info').appendChild(img1);
        
        var img2 = document.createElement("IMG");
        img2.id = "adult";
        img2.src = " ";
        img2.alt = "Adult image";
        document.getElementById('sec1info').appendChild(img2);
        
        var para = document.createElement("P");
        para.id = "description";
        document.getElementById('sec1info').appendChild(para);
    
        var infowin;
        infowin = "Caterpillar found feeding on host plant <em>" +
        this.meta.plant_species + "</em>, " +
        this.meta.plant_family + " in the " +
        this.meta.primary_eco + ", " +
        this.meta.year + ".<br>";
    
        document.getElementById("sec1title").innerHTML = this.meta.species;
        document.getElementById("cat").setAttribute("src", this.meta.url_catepillar);
        document.getElementById("adult").setAttribute("src", this.meta.url_adult);
        document.getElementById("description").innerHTML = infowin;
        
        self.toggleBounce(this);
    };
    
    this.sensorInfo = function(e) {
        document.getElementById('sec1info').style.position = 'relative';
        document.getElementById('sec1info').style.height = '100%';
        document.getElementById('sec1info').style.width = '100%';
        document.getElementById('sec1info').style.textAlign = 'center';
        document.getElementById('sec1info').innerHTML = null;
        
        var para = document.createElement("P");
        para.id = "description";
        document.getElementById('sec1info').appendChild(para);
    
        var infowin;
        infowin = "<em>latitude:</em> <strong>" + this.meta.lat + "</strong><br>";
        infowin += "<em>longitude:</em> <strong>" + this.meta.long + "</strong><br>";
        infowin += "<em>temperature range:</em> <strong>" + this.temp_range.slice(0,1);
        infowin += "</strong> to <strong>" + this.temp_range.slice(1) + " C</strong><br>";
        infowin += "<em>start time:</em> <strong>" + this.time_range.slice(0,1) + "</strong><br>";
        infowin += "<em>end time:</em> <strong>" + this.time_range.slice(1) + "</strong><br>";

        document.getElementById("sec1title").innerHTML = this.meta.location + " Sensor";
        document.getElementById("description").innerHTML = infowin;
        
        self.toggleBounce(this);
    };
    
    this.toggleBounce = function(marker) {
        if (self.last_marker) self.last_marker.setAnimation(null);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        self.last_marker = marker;
    };
    
    this.fusionLayer = function() {
            self.deleteMarkers();
            self.fusionSummary("");
            self.requestAstraptes("dat/astraptes");
            self.fusionSummary("dat/astraptes");
    }
    
    this.sensorLayer = function() {
            self.deleteMarkers();
            self.fusionSummary("");
            self.requestSensors("dat/sensors");
            self.fusionSummary("dat/sensors");
    }
    
    this.geocodeAddress = function() {
        var address = document.getElementById("address").value;
        self.geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.map.setCenter(results[0].geometry.location);
                
                var infoText = self.createInfoText(address, results[0]);
                
                var infowindow = new google.maps.InfoWindow({
                    content: infoText,
                    map: self.map,
                    position: results[0].geometry.location
                });
                
                infowindow.open(self.map);
    
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
    
    this.createInfoText = function(address, result) {
        var infoText = "<p class='info-win'>" +
        "<h3>" + address + "</h3>" +
        "<strong>Latitude</strong>: " +
        result.geometry.location.lat() +
        "<br><strong>Longitude</strong>: " +
        result.geometry.location.lng() + "</p>";
    
        return infoText;
    }

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
            var minLat = 90.0;
            var minLon = 180.0;
            var maxLat = 0.0;
            var maxLon = -180.0;

            for (var i = 1; i < json.length; ++i) {
                json[i].latitude = parseFloat(json[i].latitude);
                json[i].longitude = parseFloat(json[i].longitude);
                
                self.addAstraptesMarker(json[i]);
                
                minLat = Math.min(minLat, json[i].latitude);
                minLon = Math.min(minLon, json[i].longitude);
                maxLat = Math.max(maxLat, json[i].latitude);
                maxLon = Math.max(maxLon, json[i].longitude);
            }
            
            self.showMarkers();

            var NE = new google.maps.LatLng(maxLat,maxLon);
            var SW = new google.maps.LatLng(minLat,minLon);
            var layerbounds = new google.maps.LatLngBounds(SW, NE);
            self.map.fitBounds(layerbounds);
        }
    };

    this.requestAstraptes = function(myfile) {
        if (myfile === "") return;
    
        var minLat = 90.0;
        var minLon = 180.0;
        var maxLat = 0.0;
        var maxLon = -180.0;

        d3.json("dat/astraptes.json", function(data) {
            data.forEach(function(s) {
                s.latitude = +s.latitude;
                s.longitude = +s.longitude;
                self.addAstraptesMarker(s);
            });
            
            var lat_extents = d3.extent(data, function(d) {
                return d.latitude;
            });
    
            var lon_extents = d3.extent(data, function(d) {
                return d.longitude;
            });
    
            self.showMarkers();
    
            var NE = new google.maps.LatLng(lat_extents[1],lon_extents[1]);
            var SW = new google.maps.LatLng(lat_extents[0],lon_extents[0]);
            var layerbounds = new google.maps.LatLngBounds(SW, NE);
            self.map.fitBounds(layerbounds);
        });
    }

    this.requestSensors = function(myfile) {
        if (myfile === "") return;
    
        // Date format for astraptes.json:  9/11/2005 12:30
        var parse = d3.time.format("%m/%d/%Y %H:%M").parse;
        var minLat = 90.0;
        var minLon = 180.0;
        var maxLat = 0.0;
        var maxLon = -180.0;

        d3.json("dat/sensors.json", function(data) {

            // Nest stock values by symbol.
            sensor = d3.nest()
                .key(function(d) {
                    return d.location;
                })
                .entries(stocks = data);

            // Parse dates and numbers. We assume values are sorted by date.
            // Also compute the maximum price per symbol, needed for the y-domain.
            sensor.forEach(function(s) {

                s.values.forEach(function(d) {
                    d.time = parse(d.date + " " + d.time);
                    d.temp = +d.temp;
                    d.lat = +d.lat;
                    d.long = +d.long;
                });

                s.temp_extents = d3.extent(s.values, function(d) {
                    return d.temp;
                });

                s.time_extents = d3.extent(s.values, function(d) {
                    return d.time;
                });

                s.lat_extents = d3.extent(s.values, function(d) {
                    return d.lat;
                });

                s.long_extents = d3.extent(s.values, function(d) {
                    return d.long;
                });

                // Sort each species by eclosion data, ascending
                s.values.sort(function(a, b) {
                    return a.time - b.time;
                });
                
                self.addSensorMarker(s.values[0], s.temp_extents, s.time_extents);

                minLat = Math.min(minLat, s.lat_extents[0]);
                minLon = Math.min(minLon, s.long_extents[0]);
                maxLat = Math.max(maxLat, s.lat_extents[1]);
                maxLon = Math.max(maxLon, s.long_extents[1]);

            });

            self.showMarkers();

            var NE = new google.maps.LatLng(maxLat,maxLon);
            var SW = new google.maps.LatLng(minLat,minLon);
            var layerbounds = new google.maps.LatLngBounds(SW, NE);
            self.map.fitBounds(layerbounds);
        });
    };
                
    this.fusionSummary = function(value)
    {
        switch (value) {
        case "dat/astraptes":
            var summaryHTML = "<iframe id='analytics' src='astraptes.html'></iframe>";
            document.getElementById("sec2info").innerHTML = summaryHTML;
            break;
        case "dat/sensors":
            var summaryHTML = "<iframe id='analytics' src='sensor.html'></iframe>";
            document.getElementById("sec2info").innerHTML = summaryHTML;
            break;
        default:
            document.getElementById("sec1title").innerHTML = "";
            document.getElementById("sec1info").innerHTML = "";
            document.getElementById("sec2title").innerHTML = "";
            document.getElementById("sec2info").innerHTML = "";
            break;
        }
    };

    // Add a marker to the map and push to the array.
    this.addAstraptesMarker = function(obj) {
        var location = new google.maps.LatLng(obj.latitude, obj.longitude);

        var marker = new google.maps.Marker({
            position: location,
            map: self.map,
            title: obj.species
//            icon: "small_green"
        });
        
        google.maps.event.addListener(marker, 'click', self.fusionInfo);
        marker.set("meta", obj);

        self.markers.push(marker);
        self.meta.push(obj);
    };

    // Add a marker to the map and push to the array.
    this.addSensorMarker = function(obj, temp_range, time_range) {
        var location = new google.maps.LatLng(obj.lat, obj.long);

        var marker = new google.maps.Marker({
            position: location,
            map: self.map,
            title: obj.location,
            temp_range: temp_range,
            time_range: time_range
//            icon: "small_green"
        });
        
        google.maps.event.addListener(marker, 'click', self.sensorInfo);
        marker.set("meta", obj);

        self.markers.push(marker);
        self.meta.push(obj);
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
        self.meta = [];
    };
} //--- end of custom GIS object
