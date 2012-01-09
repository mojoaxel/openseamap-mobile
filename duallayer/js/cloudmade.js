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
        "http://c.tile.cloudmade.com/" + prefix];
        this.async = true;
        this.images = [];
        var newArguments = [name, url, options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },

    getURLasync: function (bounds, scope, url, callback) {
        //console.log("getURLasync: ",bounds,scope,url);
        callback.apply(scope);
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
        var z = this.map.getZoom();
        var limit = Math.pow(2, z);

        if (y < 0 || y >= limit) return 'http://cloudmade.com/js-api/images/empty-tile.png'
        else {
            var t = new tilecache();
            x = ((x % limit) + limit) % limit;

            var url = this.url;
            var path = z + "/" + x + "/" + y + ".png";

            if (url instanceof Array) url = this.selectUrl(path, url);

			var key = z + '_' + x + '_' + y;
            t.get(key, url + path, scope.imgDiv, function() {
				console.log("GET ready");
				//scope.imgDiv.onload = function() {
					console.log("image finished loading ", scope.imgDiv.id);
					t.set(key, url + path, document.getElementById(scope.imgDiv.id), function() {
						console.log("SET ready");
					});
				//};
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

var db = function (arg) {
        console.log("OPEN: ", arg);
        var db = openDatabase('testdb1', '1.0', 'todo manager', 50 * 1024 * 1024); //50MB
        return db;
    }();

function tilecache() {
    var tdb;
    this.size = 50;
    this.width = 256;
    this.height = 256;

    //database interface
    var opendb = db;
    var webdb = function () {
            this.insert = function (key, value, callback) {
                console.log("INSERT: ", key);
                opendb.transaction(
					function (transaction) {
						transaction.executeSql('CREATE TABLE IF NOT EXISTS tiles (id text,value text)', [], 
							function(error) { console.log("NO ERROR in create table: ", error); }, 
							function(error) { console.log("ERROR in create table: ", error); });
						transaction.executeSql('DELETE FROM tiles WHERE id = ?', [key], 
							function(error) { console.log("NO ERROR in create table: ", error); }, 
							function(error) { console.log("ERROR in delete: ", error); });
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
            this.select = function (key, url, img, onerror) {
                console.log("SELECT: ", key, url);
                opendb.transaction(

                function (transaction) {
                    transaction.executeSql('SELECT value FROM tiles WHERE id = ?', [key], function (transaction, result) {
                        if (result.rows.length < 1) {
                            img.src = url;
                            console.error("image not found in DB: " + url);
                            if (onerror) onerror(key, url, img);
                        } else {
                            img.src = result.rows.item(0).value;
                            console.debug("found image in DB: " + result.rows.item(0).value);
                            return;
                        }
                    }, function () {
                        img.src = url;
                        console.error("image not found in DB: " + url);
                        if (onerror) onerror(key, url, img);
                    });

                });
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
        console.time('create_canvas');
        var tile = new Image();
		tile.src = url;
        if (tile.complete) {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(tile, 0, 0);
            var imageData = canvas.toDataURL();
            if (imageData.indexOf("data:image/png") < 0) {
                alert('Your browser does not support this :(');
                return;
            }
            if (tdb) tdb.insert(key, imageData, callback);
        }
    }
    this.get = function (key, url, img, callback) {
        if (!window.openDatabase) 
			img.src = url;
			//tdb.insert(key, url, img);
        else {
			//console.log("GET: ", key, url);
			tdb.select(key, url, img, callback);
        }
    }
    this.empty = function () {
        tdb.empty();
    }

}


/*
==========================================================================================
 Orinal cloudmade layer
==========================================================================================
OpenLayers.Layer.CloudMade = OpenLayers.Class(OpenLayers.Layer.TMS, {
    initialize: function(name, options) {
		if (!options.key) {
			throw "Please provide key property in options (your API key).";
		}
        options = OpenLayers.Util.extend({
            attribution: "Data &copy; 2009 <a href='http://openstreetmap.org/'>OpenStreetMap</a>. Rendering &copy; 2009 <a href='http://cloudmade.com'>CloudMade</a>.",
            maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
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
        var url = [
            "http://a.tile.cloudmade.com/" + prefix,
            "http://b.tile.cloudmade.com/" + prefix,
            "http://c.tile.cloudmade.com/" + prefix
        ];
        var newArguments = [name, url, options];
        OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
    },

    getURL: function (bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = this.map.getZoom();
        var limit = Math.pow(2, z);

        if (y < 0 || y >= limit)
        {
            return "http://cloudmade.com/js-api/images/empty-tile.png";
        }
        else
        {
            x = ((x % limit) + limit) % limit;

            var url = this.url;
            var path = z + "/" + x + "/" + y + ".png";

            if (url instanceof Array)
            {
                url = this.selectUrl(path, url);
            }

            return url + path;
        }
    },

    CLASS_NAME: "OpenLayers.Layer.CloudMade"
});
*/