/*
 * Cloudmade
 * http://allartk.nl/node/39
 */
OpenLayers.Layer.CloudMade = OpenLayers.Class(OpenLayers.Layer.TMS, {
	initialize: function (name, options) {
		if (!options.key) {
			throw "Please provide key property in options (your API key).";
		}
		options = OpenLayers.Util.extend({
			attribution: "cloudmade.com",
			maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			maxResolution: 156543.0339,
			units: "m",
			projection: "EPSG:900913",
			isBaseLayer: true,
			numZoomLevels: 19,
			displayOutsideMaxExtent: true,
			wrapDateLine: true,
			styleId: 1
		}, options);
		var prefix = [options.key, options.styleId, 256].join('/') + '/';
		//TODO url should be same as proxy
		var url = [
		//"http://a.tile.cloudmade.com/" + prefix,
		//"http://b.tile.cloudmade.com/" + prefix,
		//"http://c.tile.cloudmade.com/" + prefix,
		"../cloudmade_tiles_proxy_osmde.php?" + "key=" + options.key + "&" + "styleid=" + options.styleId
		//"../cloudmade_caching_proxy.php?" + "key=" + options.key + "&" + "styleid=" + options.styleId
		];
		this.async = true;
		this.images = [];
		var newArguments = [name, url, options];
		OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
		
		this.db = openDatabase('testdb1', '1.0', 'todo manager', 50 * 1024 * 1024); //50MB
		this.db.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS tiles (id text,value text)', [], 
					//function(error) { console.log("NO ERROR in create table: ", error); }, 
					function(error) { console.log("ERROR in create table: ", error); });
			}
		);
	},

	getURLasync: function (bounds, scope, url, callback) {
		//console.log("getURLasync: ",bounds,scope,url);
		callback.apply(scope);
		var res = this.map.getResolution();
		var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));
		var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
		var z = this.map.getZoom();
		var limit = Math.pow(2, z);

		if (y < 0 || y >= limit) 
			//return 'http://cloudmade.com/js-api/images/empty-tile.png'
			return 'openlayers211/img/blank.png';
		else {
			var t = new tilecache(this.db);
			x = ((x % limit) + limit) % limit;

			var url = this.url;
			//var path = z + "/" + x + "/" + y + ".png";
			var path = "&z=" + z + "&x=" + x + "&y=" + y;

			if (url instanceof Array) url = this.selectUrl(path, url);

			var key = 'base_' + z + '_' + x + '_' + y;
			t.get(key, url + path, scope.imgDiv, function(saveToCache) {
				console.log(saveToCache);
				if (saveToCache) {
				console.log("start saving " + key);
				t.set(key, url + path, scope.imgDiv, function() {
					console.log("SET ready " + key);
				});
				} else {
					console.log("saveToCache not true");
				}
			});
			this.images.push({
				'key': key,
				'url': url + path,
				'img': scope.imgDiv
			});
			return;
		}
	},
	setcache: function (images) {
		console.log("setcache: ", images);
		var ly = this;
		images = (images === undefined) ? this.images : images;
		var tc = new tilecache();
		image = images.shift();
		if (image) tc.set(image.key, image.url, image.img, function () {
			ly.setcache(images);
		});
		else alert(t('ready_saving_map'));
	},

	CLASS_NAME: "OpenLayers.Layer.CloudMade"
});

/*
* ====================================================================================
*/
OpenLayers.Layer.OpenSeaMap = OpenLayers.Class(OpenLayers.Layer.TMS, {
initialize: function (name, options) {
	if (!options.key) {
		throw "Please provide key property in options (your API key).";
	}
	options = OpenLayers.Util.extend({
		attribution: "cloudmade.com",
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
		maxResolution: 156543.0339,
		units: "m",
		projection: "EPSG:900913",
		isBaseLayer: true,
		numZoomLevels: 19,
		displayOutsideMaxExtent: true,
		wrapDateLine: true,
		styleId: 1
	}, options);
	var prefix = [options.key, options.styleId, 256].join('/') + '/';
	//TODO url should be same as proxy
	var url = [
	//"http://a.tile.cloudmade.com/" + prefix,
	//"http://b.tile.cloudmade.com/" + prefix,
	//"http://c.tile.cloudmade.com/" + prefix,
	"../cloudmade_tiles_proxy_oseam.php?" + "key=" + options.key + "&" + "styleid=" + options.styleId
	//"../cloudmade_caching_proxy.php?" + "key=" + options.key + "&" + "styleid=" + options.styleId
	];
	this.async = true;
	this.images = [];
	var newArguments = [name, url, options];
	OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
	
	this.db = openDatabase('testdb1', '1.0', 'todo manager', 50 * 1024 * 1024); //50MB
	this.db.transaction(
		function (transaction) {
			transaction.executeSql('CREATE TABLE IF NOT EXISTS tiles (id text,value text)', [], 
				//function(error) { console.log("NO ERROR in create table: ", error); }, 
				function(error) { console.log("ERROR in create table: ", error); });
		}
	);
},

getURLasync: function (bounds, scope, url, callback) {
	//console.log("getURLasync: ",bounds,scope,url);
	callback.apply(scope);
	var res = this.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
	var z = this.map.getZoom();
	var limit = Math.pow(2, z);

	if (y < 0 || y >= limit) 
		//return 'http://cloudmade.com/js-api/images/empty-tile.png'
		return 'openlayers211/img/blank.png';
	else {
		var t = new tilecache(this.db);
		x = ((x % limit) + limit) % limit;

		var url = this.url;
		//var path = z + "/" + x + "/" + y + ".png";
		var path = "&z=" + z + "&x=" + x + "&y=" + y;

		if (url instanceof Array) url = this.selectUrl(path, url);

		var key = 'sea_' + z + '_' + x + '_' + y;
		t.get(key, url + path, scope.imgDiv, function(saveToCache) {
			if (true) {
				//console.log("start saving " + key);
				t.set(key, url + path, scope.imgDiv, function() {
					//console.log("SET ready " + key);
				});
			} else {
				console.log("Do not save image");
			}
		});
		this.images.push({
			'key': key,
			'url': url + path,
			'img': scope.imgDiv
		});
		return;
	}
},
setcache: function (images) {
	console.log("setcache: ", images);
	var ly = this;
	images = (images === undefined) ? this.images : images;
	var tc = new tilecache();
	image = images.shift();
	if (image) tc.set(image.key, image.url, image.img, function () {
		ly.setcache(images);
	});
	else alert(t('ready_saving_map'));
},

CLASS_NAME: "OpenLayers.Layer.CloudMade"
});

/*
* ====================================================================================
*/
function tilecache(db) {
var tdb;
this.size = 50;
this.width = 256;
this.height = 256;

//database interface
var opendb = db;
var webdb = function () {
	this.insert = function (key, value, callback) {
		//console.log("INSERT: ", key);
		opendb.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS tiles (id text,value text)', [], 
					//function(error) { console.log("NO ERROR in create table: ", error); }, 
					function(tr, error) { console.log("ERROR in create table: ", error); });
				transaction.executeSql('DELETE FROM tiles WHERE id = ?', [key], 
					//function(error) { console.log("NO ERROR in create table: ", error); }, 
					function(tr, error) { console.log("ERROR in delete: ", error); });
				transaction.executeSql('INSERT INTO tiles VALUES (?,?)', [key, value], 
					function () {
						callback.call();
					}, 
					function(error) { 
						console.log("ERROR in insert: ", error); 
					});
			}
		);
	}
	this.select = function (key, url, img, callback) {
		//console.log("SELECT: ", key, url);
		opendb.transaction(
			function (transaction) {
				transaction.executeSql('SELECT value FROM tiles WHERE id = ?', [key], function(callback) { return function (transaction, result) {
					if (result.rows.length < 1) {
						//console.log("Not found in DB  : " + key);
						console.log(callback);
						img.onload = function() {
							console.log("Finished loading : " + key);
							//console.log(callback);
							if (callback) callback.call(true);
						};
						img.src = url;
					} else {
						img.src = result.rows.item(0).value;
						console.log("Found image in DB: " + key);
						if (callback) callback.call(false);
						return;
					}
				}}(callback), function (transaction, error) {
					img.src = url;
					console.error("error while select "+key+": ", error);
				});

			}
		);
	}
	this.empty = function () {
		console.log("EMPTY");
		opendb.transaction(

		function (transaction) {
			transaction.executeSql('DROP TABLE tiles', [], webdb_nullDataHandler, webdb_errorHandler);
		});
	}
}

if (window.openDatabase) tdb = new webdb;

this.set = function (key, url, img, callback) {
	//console.log('create_canvas');
	var tile = new Image();
	tile.src = url;
	//if (tile.complete) {
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(tile, 0, 0);
		try {
			var imageData = canvas.toDataURL();
			if (imageData.indexOf("data:image/png") < 0) {
			console.error('Your browser does not support this :(');
			return;
		}
		if (tdb) tdb.insert(key, imageData, callback);
		} catch (err) {
			console.log(err);
		}
	//} else {
	//	console.warn("tile not complete");
	//}
}
this.get = function (key, url, img, callback) {
	if (!window.openDatabase) 
		img.src = url;
	else {
		//console.log("GET: ", key, url);
		tdb.select(key, url, img, callback);
	}
}
this.empty = function () {
	tdb.empty();
}

}
