
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";



var magnitudes = [];


d3.json(queryUrl, function(data) {

  	console.log(data.features)

	for(var i = 0; i < data.metadata.count; i++){
		magnitudes.push(data.features[i].properties.mag)
	};
	min_mag = magnitudes.reduce((a,b) => Math.min(a,b));
	if(min_mag < 0){
		min_mag = 0;
	}
	max_mag = magnitudes.reduce((a,b) => Math.max(a,b));

	colors = (max_mag-min_mag)/6

	col1 = min_mag+colors*1;
	col2 = min_mag+colors*2;
	col3 = min_mag+colors*3;
	col4 = min_mag+colors*4;
	col5 = min_mag+colors*5;
	col6 = min_mag+colors*6;

	 createFeatures(data);

});



function createFeatures(earthquakeData){
	 

	function onEachFeature(feature, layer) {
		layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + Date(feature.properties.time) + "</p><hr><p> Magnitude:" +  feature.properties.mag + "</p>");
	  };


	function onEachLayer(feature) {
		return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
		  radius: circleDiameter(feature.properties.mag),
		  fillOpacity: 0.6,
		  color: colorMagnitude(feature.properties.mag),
		  fillColor: colorMagnitude(feature.properties.mag)
		});
	  };
	


	var earthquakes = L.geoJSON(earthquakeData, {onEachFeature: onEachFeature, pointToLayer: onEachLayer}); 
	createMap(earthquakes);
}

function createMap(earthquakes) {
  
	var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.opensatellite.org/copyright'>Opensatellite</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
	  tileSize: 512,
	  maxZoom: 18,
	  zoomOffset: -1,
	  id: "mapbox/satellite-v9",
	  accessToken: API_KEY
	});
	var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	  attribution: "Map data &copy; <a href=\"https://www.opensatellite.org/\">Opensatellite</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
	  maxZoom: 18,
	  id: "dark-v10",
	  accessToken: API_KEY
  });

  var tectonicPlates = new L.layerGroup();
  
	var baseMaps = {
	  "Satellite Map": satellite,
	  "Dark Map": darkmap
  };
  
	var overlayMaps = {
		"Earthquakes": earthquakes,
		'Tectonic Plates' : tectonicPlates
  };
  
	var myMap = L.map("map", {
	  center: [37.09, -95.71],
	  zoom: 5,
	  layers: [darkmap, earthquakes] 
  });
  
	
	L.control.layers(baseMaps, overlayMaps, {
	  collapsed: false
	}).addTo(myMap);
	var legend = L.control({ 
		position: "bottomright" 
	   });

	var tectonicPlatequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
	d3.json(tectonicPlatequery, function(data) {
	  L.geoJSON(data, {
		style: function() {
		  return {color: "orange", fillOpacity: 0}
		}
	  }).addTo(tectonicPlates)});

   legend.onAdd = function() {
		 var div = L.DomUtil.create("div", "legend");
	   

	 var legendInfo =  [
	  
	   "<p class='one'>" + "&#9632;" +"</p><p id='in-line'>" + "0-" + Math.round(col1) + "</p><br>",
	   "<p class='two'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col1) + "-" + Math.round(col2) + "</p><br>",
	   "<p class='three'>"+"&#9632;" + "</p><p id='in-line'>" + Math.round(col2) + "-" + Math.round(col3) + "</p><br>",
	   "<p class='four'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col3) + "-" + Math.round(col4) + "</p><br>",
	   "<p class='five'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col4) + "-" + Math.round(col5) + "</p><br>",
	   "<p class='six'>" + "&#9632;" +"</p><p id='in-line'>" + "> " + Math.round(col5) + "</p>"
   ].join("");

	 div.innerHTML = legendInfo;

	 return div;
	 };
	 legend.addTo(myMap);
};


function colorMagnitude(earthquakeMagnitude) {

	
	 
    if (earthquakeMagnitude >= col6) {
      return "red";
    }
    else if (earthquakeMagnitude >= col5) {
      return "darkred";
    }
    else if (earthquakeMagnitude >= col4) {
     return "orange";
    }
    else if (earthquakeMagnitude >= col3) {
      return "yellow";
    }
    else if (earthquakeMagnitude >= col2) {
      return "yellowgreen";
    }
    else {
      return "green";
    }
};


function circleDiameter(earthquakeMagnitude) {
  return earthquakeMagnitude ** 1.5;
};


