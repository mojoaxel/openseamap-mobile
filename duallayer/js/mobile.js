

var map;

/**
 * Function: onImageLoadError
 */
OpenLayers.Util.onImageLoadError = function() {
	this.src = "grafiken/empty.png";
};

// Get rid of address bar on iphone/ipod
var fixSize = function() {
	window.scrollTo(0,0);
	document.body.style.height = '100%';
	if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
		if (document.body.parentNode) {
			document.body.parentNode.style.height = '100%';
		}
	}
};
setTimeout(fixSize, 700);
setTimeout(fixSize, 1500);

var init = function () {
	// create map
	map = new OpenLayers.Map({
		div: "map",
		theme: null,
		projection: new OpenLayers.Projection("EPSG:900913"),
	
		// Default-Koordinatensystem fuer alle Controls
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
			controls:[
				new OpenLayers.Control.Attribution(),
				//new OpenLayers.Control.Permalink(),
				//new OpenLayers.Control.ZoomLevel(),
				new OpenLayers.Control.ScaleLine({topOutUnits : "nmi", topInUnits: "nmi"}),
				new OpenLayers.Control.TouchNavigation({
					dragPanOptions: {
						enableKinetic: true
					}
				}),
				new OpenLayers.Control.ZoomPanel()
			],
			layers: [
				/*
				new OpenLayers.Layer.OSM("Mapnik",
				[
					"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
					"http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
					"http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
				],
				{
					opacity: 1.0,
					numZoomLevels: 18
				}),
				*/
				/*
				new OpenLayers.Layer.OSM("Custom",
				[
					"http://toolserver.org/tiles/hikebike/${z}/${x}/${y}.png"
				],
				{
					opacity: 1.0,
					numZoomLevels: 18
				}),
				*/
				
				new OpenLayers.Layer.CloudMade("CloudMade", {
					key: '753ab316708d59d3918e7e3e4f6b8e37',
					styleId: 
						//33332 Nighttheme
						1714 //  bright, white
						//31408 // dark, black and gray
				}),
				
				/*
				new OpenLayers.Layer.OSM("OSMDE",
					"http://a.tile.openstreetmap.de/tiles/osmde/${z}/${x}/${y}.png",
					{
						opacity: 1.0,
						numZoomLevels: 18
					}
				),
				*/
				new OpenLayers.Layer.OSM("OpenSeaMapPaths",
					"http://tiles.openseamap.org/seamark/${z}/${x}/${y}.png",
					{ 
						numZoomLevels: 19,
						isBaseLayer: false,
						transitionEffect: "null",
						opacity: 0.8,
						attribution: "OpenSeaMap"
					}
				)
				
			]
	});
	
	lyGeolocation = new OpenLayers.Layer.Vector("geolocation");
	map.addLayer (lyGeolocation);
	
	// optional werden jetzt die POI-Layer angelegt
	
	//============================================================================
	// Einbinden von OSM-Dateien
	//============================================================================
	
	// Position und Zoomstufe der Karte
	var lon = 12.1018;
	var lat = 54.1674;
	var zoom = 13;

	checkForPermalink();

	if ( !map.getCenter() ) {
		map.setCenter (
			new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"),
			map.getProjectionObject()
		), 13);
	}
	//document.getElementById("zlevel").innerHTML = map.getZoom();
	
	
	//============================================================================
	// add a "Add to homescreen" bubble on iPad/iPhone
	//============================================================================
	if ('standalone' in navigator && !navigator.standalone && (/iphone|ipod|ipad/gi).test(navigator.platform) && (/Safari/i).test(navigator.appVersion)) {
		document.write('<link rel="stylesheet" href="css2010\/add2home.css">');
		document.write('<script type="application\/javascript" src="js\/\/add2home.js" charset="utf-8"><\/s' + 'cript>');
	}
};


function geolocate() {
	document.getElementById('information').innerHTML = "scan ...";
	// destroy last position-element
	// alert ('zerstoeren des GPS-Markers - start scann');
	//if (map.lyGeolocation) {
	//	alert ('... erfolgt');
	//	map.lyGeolocation.destroyFeatures();
	//}
	lyGeolocation.destroyFeatures();
	if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true, maximumAge: 1000});
	} else {
		error();
		document.getElementById('information').innerHTML = '<a href="javascript:getinfo()">&nbsp;&nbsp;Info&nbsp;&nbsp;</a>';
	}
}

function getinfo() {
	alert('Infoausgabe');
}

function routes(baseurl) {
	var G = new OpenLayers.Projection(map.projection);
	var W = new OpenLayers.Projection("EPSG:4326");

	// ermitteln der Fenstereckpunkte
	var bounds = map.getExtent().transform(G,W);

	// öffnen eines neuen Fensters mit den Daten der gefundenen Wanderwege
	var url = 'http://' + baseurl + '.lonvia.de/routebrowser/?bbox=' + bounds.toBBOX()

	var NeuesFenster=window.open(url ,"Fenstername");

	// schließen der Ebene
}

function success(position) {
	document.getElementById('information').innerHTML = "found !";
	alert('Deine ungefähre Position:\nyour approximate position:\n' + position.coords.latitude + ', ' + position.coords.longitude);

	// lyGeolocation
	// Text-Style für die kleinen
	var poiStyle0 =  {
		strokeColor: "#FEC503",
		strokeOpacity: 0.6,
		strokeWidth: 40,
		fillColor: "#FAC507",
		fillOpacity: 0.6,
		pointRadius: 12,
	 
		labelAlign: "cm",
		labelXOffset: 0,
		labelYOffset: 0,
	};
	
	//-------- NEU-Code -------
	var aStyleGeolocation = new OpenLayers.StyleMap(new OpenLayers.Style(poiStyle0));
	lyGeolocation.styleMap = aStyleGeolocation;
	var point = new OpenLayers.Geometry.Point(position.coords.longitude, position.coords.latitude).transform(map.displayProjection, map.getProjectionObject());
	var pointFeature = new OpenLayers.Feature.Vector(point);
	lyGeolocation.addFeatures([pointFeature]);
	
	map.setCenter (
		new OpenLayers.LonLat( 
			position.coords.longitude, 
			position.coords.latitude).transform(
				new OpenLayers.Projection("EPSG:4326"),
				map.getProjectionObject()
			), 14
		);
	document.getElementById('information').innerHTML = '<a href="javascript:getinfo()">&nbsp;&nbsp;Info&nbsp;&nbsp;</a>';
}

function error() {
	alert('No Geolocation available or position could not be determined.');
	document.getElementById('information').innerHTML = '<a href="javascript:getinfo()">&nbsp;&nbsp;Info&nbsp;&nbsp;</a>';
}

