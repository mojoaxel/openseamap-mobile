//--------------------------------------------------------------------------------
//	$Id: popupmarker.js,v 1.55 2011/09/17 11:23:49 wolf Exp wolf $
//--------------------------------------------------------------------------------
//	Erklärung:	http://www.netzwolf.info/kartografie/openlayers/#csv
//--------------------------------------------------------------------------------
//	Fragen, Wuensche, Bedenken, Anregungen?
//	<openlayers(%40)netzwolf.info>
//--------------------------------------------------------------------------------

if (!OpenLayers.Lang.en)
	OpenLayers.Lang.en = {};
if (!OpenLayers.Lang.en.errorLoadingCSV)
	OpenLayers.Lang.en.errorLoadingCSV = 'Error loading CSV file "${url}": ${phase}';

OpenLayers.Layer.PopupMarker = OpenLayers.Class(OpenLayers.Layer.Markers,{

	popupOnHover: true,
	popupOnClick: true,
	restrictMapExtent: false,
	location: null,
	fieldSeparator: "\t",
	defaultIcon: null,
	popupClass:OpenLayers.Popup.AnchoredBubble,
	createIconFromData: null,
	createUrlForBounds: null,
	opacity: null,
	minZoom: 10,
	lastZoom: -1,
	tileSize: 0.1,
	clusterSize: 0,
	clusterSort: null,
	clusterLimit: 10,
	zindex: null,
	cloudImage: null,
	zoomSteps: null,
	hideMarkerBelowMinZoom: false,
	region: null,	// XXX experimental

	//---------------------------------------------------------
	//	Init
	//---------------------------------------------------------

        initialize:function(name, options){
                OpenLayers.Layer.Markers.prototype.initialize.apply(this,arguments);
		this.currentMarker	= null,
		this.currentPopup	= null;
		this.loadBounds		= null;
		this.loadedAreas	= new Object();
		this.loadedBounds	= null;
		this.loadingUrl		= null;
		this.markers		= [];
		this.locations		= [];
		this.nextId		= 0;
		if (this.opacity ) this.setOpacity(opacity);
		if (this.minZoom) this.zoomSteps = 1<<this.minZoom;
        },

	afterAdd: function() {
		if (this.location) this.request(this.location);
	},

	//---------------------------------------------------------
	//	Reload Marker on move or zoom
	//---------------------------------------------------------

	moveTo: function (bounds, zoomChanged, dragging) {

                OpenLayers.Layer.Markers.prototype.moveTo.apply(this,arguments);

		//---------------------------------------------------------
		//	but not while dragging or invisible
		//---------------------------------------------------------

		if (dragging || !this.visibility) return;

		//---------------------------------------------------------
		//	XXX QUICKFIX WILL BE REMOVED XXX
		//---------------------------------------------------------

		if (this.zindex && this.div.style.zIndex!=this.zindex)
			this.div.style.zIndex=this.zindex

		//---------------------------------------------------------
		//	Change visibility of marker
		//---------------------------------------------------------

		if ((this.lastZoom>=this.minZoom) != (this.map.zoom>=this.minZoom)) {
			this.lastZoom = this.map.zoom;
			if (this.location && this.createUrlForBounds) {
				if (this.map.zoom >= this.minZoom) {
					for (var i=0; i<this.markers.length; i++) {
						this.markers[i].display(this.markers[i].data._csize<=0);
					}
				} else {
					for (var i=0; i<this.markers.length; i++) {
						this.markers[i].display(this.markers[i].data._csize>0);
					}
				}
			}
			if (!this.location && this.createUrlForBounds && this.hideMarkerBelowMinZoom) {
				for (var i=0; i<this.markers.length; i++) {
					this.markers[i].display(this.map.zoom >= this.minZoom);
				}
			}
		}

		//---------------------------------------------------------
		//	Transform center and border to geogr. Coordinates
		//---------------------------------------------------------

		if (this.map.zoom >= this.minZoom && this.createUrlForBounds) {

			this.loadBounds = bounds.clone().
				transform(this.map.getProjectionObject(), this.map.displayProjection);
			this.loadNext();
		}

		//---------------------------------------------------------
		//	delayed Popup
		//---------------------------------------------------------

		var marker = this.delayedPopupMarker;
		if (marker) {
			this.delayedPopupMarker=null;
			this.createPopup(marker);
			this.currentMarker=marker;
		}
	},

	//---------------------------------------------------------
	//	Load next
	//---------------------------------------------------------

	getUnknownArea: function (bounds) {

		var l0 = Math.floor (bounds.left  / this.tileSize);
		var r0 = Math.ceil  (bounds.right / this.tileSize);
		var b0 = Math.floor (bounds.bottom/ this.tileSize);
		var t0 = Math.ceil  (bounds.top   / this.tileSize);
		var l=r0;
		var r=l0;
		var t=b0;
		var b=t0;
		for (var y=b0; y<t0; y++) {
			for (var x=l0; x<r0; x++) {
				var id = y+":"+x;
				if (this.loadedAreas[id]) continue;
				this.loadedAreas[id]=true;
				if (x< l) l=x;
				if (x>=r) r=x+1;
				if (y< b) b=y;
				if (y>=t) t=y+1;
			}
		}

		if (l>=r || b>=t) return null;
		return new OpenLayers.Bounds (l*this.tileSize,b*this.tileSize,r*this.tileSize,t*this.tileSize);
	},

	loadNext: function () {
		if (this.loadBounds==this.loadedBounds) return;
		if (this.loadingUrl) return;
		this.loadedBounds = this.loadBounds;
		var area = this.getUnknownArea (this.loadedBounds);
		if (area) this.request (this.createUrlForBounds(area));
	},

	//---------------------------------------------------------
	//	Download CSV
	//---------------------------------------------------------

	request: function(url){
		if(this.loadingUrl) return false;
		this.loadingUrl=url;
		OpenLayers.Request.GET({
			url:this.loadingUrl,
			success:this.requestSuccess,
			failure:this.requestFailure,
			scope:this
		});
		this.events.triggerEvent("loadstart");
	},

	//---------------------------------------------------------
	//	Success downloading CSV
	//---------------------------------------------------------

	requestSuccess: function(request) {
		if (request.responseText==null || request.responseText=="")
			alert ('"' + this.loadingUrl + '" returns' +
				(request.getResponseHeader ?
				' content type "'+request.getResponseHeader('Content-Type')+'" with' : '') +
				' no content.');
		var objects = this.parseCSV (request.responseText);
		for (var i=0; objects.length>i; i++) {
			this.createMarker (objects[i]);
		}
		if (this.loadingUrl==this.location && !map.getCenter()) {
			var extent = this.getBounds();
			if (extent) {
				this.map.zoomToExtent(extent);
				if (this.restrictMapExtent) {
					extent.extend(this.map.restrictedExtent);
					this.map.restrictedExtent=extent;
				}
			}
		}
		if (!map.getCenter()) this.map.zoomToMaxExtent();
		this.events.triggerEvent("loadend");
		this.loadingUrl = null;
		if (this.visibility) this.loadNext();
	},

	//---------------------------------------------------------
	//	Error downloading of CSV
	//---------------------------------------------------------

	requestFailure: function(request){
		OpenLayers.Console.userError(OpenLayers.i18n("errorLoadingCSV",{
			'url':    this.loadingUrl,
			'phase': 'request failed'
		}));
		if (!map.getCenter()) this.map.zoomToMaxExtent();
		this.events.triggerEvent("loadend");
		this.loadingUrl = null;
		this.loadNext();
	},

	//---------------------------------------------------------
	//	createObject
	//---------------------------------------------------------

	getMarkerByDataId: function (id) {
		for (var i=0; i<this.markers.length; i++) {
			if (this.markers[i].data.id==id) return this.markers[i];
		}
		return null;
	},

	createMarker: function (data) {
		if (!data) return;
		if (this.filter && !this.filter(data)) return;
		if (!data.id) data.id = ++this.nextId + "";
		if (this.getMarkerByDataId(data.id)) return false;

		if (!data.lat && data.point) data.lat=data.point.split(',')[0];
		if (!data.lon && data.point) data.lon=data.point.split(',')[1];
		var lon = parseFloat (data.lon);
		var lat = parseFloat (data.lat);

		if (isNaN(lon) || isNaN(lat)) {
			if (data.location) {
				if (!this.locations[data.location]) this.locations[data.location] = [];
				this.locations[data.location].push(data);
			}
			return false;
		}

		var lonLat=new OpenLayers.LonLat(lon, lat).
			transform(this.map.displayProjection, this.map.getProjectionObject());

		var icon = this.createIconFromData ? this.createIconFromData(data) : this.icon?this.icon.clone():null;

		var marker = new OpenLayers.Marker (lonLat, icon);

		marker.icon.imageDiv.firstChild.className='olPopupMarker';
		marker.icon.imageDiv.className='olPopupMarker';
		marker.layer=this;
		marker.data =data;

		if (this.popupOnClick) {
			marker.events.register('click', marker, this.markerClick);
		}
		if (this.popupOnHover) {
			marker.events.register('mouseover', marker, this.markerMouseOver);
			marker.events.register('mouseout', marker, this.markerMouseOut);
		}

		this.addMarker (marker);
		return true;
	},

	//---------------------------------------------------------
	//	markerClick
	//---------------------------------------------------------

	markerClick: function (ev) {
		if (ev.shiftKey) return false;
		var layer = this.layer;
		if (layer.currentMarker==this) {
			layer.destroyPopup();
			layer.currentMarker=null;
		} else {
			layer.createPopup(this);
			layer.currentMarker=this;
		}
	},

	markerMouseOver: function (ev) {
		if (ev.shiftKey) return false;
		if (!this.layer.currentMarker)
			this.layer.createPopup(this, true);
	},

	markerMouseOut: function (ev) {
		if (!this.layer.currentMarker)
			this.layer.destroyPopup();
	},

	//---------------------------------------------------------
	//	selectMarker
	//---------------------------------------------------------

	selectMarker: function (marker, options) {
		if (typeof (marker) != 'object') marker=this.getMarkerByDataId(marker);
		if (!marker) return null;
		if (this.currentMarker==marker) {
			this.destroyPopup();
			this.currentMarker=null;
			return false;
		} else {
			if (options && options.pan) {
				this.destroyPopup ();
				this.delayedPopupMarker = marker;
				this.map.panTo (marker.lonlat);
				if (this.map.panTween && this.map.panTween.playing) return true;
			}
			this.delayedPopupMarker = null;
			this.createPopup(marker);
			this.currentMarker=marker;
			return true;
		}
	},

	//---------------------------------------------------------
	//	Popups
	//---------------------------------------------------------

	createPopup: function (marker, nopan) {
		this.destroyPopup ();
		//---------------------------------------------------------
		//	check for overlapping icons
		//---------------------------------------------------------
		var cluster = [];
		if (this.clusterSize>0) {
			var limit = this.clusterSize/Math.pow(2,this.map.zoom)*156543;
			for (var i=0; i<this.markers.length; i++) {
				var member=this.markers[i];
                        	if (Math.abs(marker.lonlat.lat-member.lonlat.lat)>limit) continue;
                        	if (Math.abs(marker.lonlat.lon-member.lonlat.lon)>limit) continue;
				cluster.push (member.data);
				if (member.data.location && this.locations[member.data.location]) {
					for (var j=0; j<this.locations[member.data.location].length; j++) {
						cluster.push (this.locations[member.data.location][j]);
					}
				}
			}
			if (this.clusterSort) cluster.sort(this.clusterSort);
		}
		//---------------------------------------------------------
		//	create popup
		//---------------------------------------------------------
		this.currentPopup = new OpenLayers.Popup.FramedCloud (null,
			marker.lonlat,
			null, //size
			(cluster.length>=2 ? this.createHtmlFromList(cluster) : this.createHtmlFromData(marker.data)),
			marker.icon,
			true,
			function (e) {this.layer.destroyPopup();}
		);
		this.currentPopup.layer = this;
		if (this.cloudImage) this.currentPopup.imageSrc = this.cloudImage;
		if (nopan)
		this.currentPopup.panMapIfOutOfView=false;
		this.map.addPopup(this.currentPopup);
	},

	//---------------------------------------------------------
	//	Popups
	//---------------------------------------------------------

	destroyPopup: function () {
		if (!this.currentPopup) return false;
		this.currentPopup.destroy();
		this.currentPopup=null;
		this.currentMarker=null;
		return true;
	},

	//---------------------------------------------------------
	//	Parse CSV, get fieldnames from first line
	//---------------------------------------------------------

	parseCSV: function (text) {
		var lines=text.split('\n');
		var names = OpenLayers.String.trim(lines.shift()).split(this.fieldSeparator);
		if (names.length<2) {
			OpenLayers.Console.userError (OpenLayers.i18n ("errorLoadingCSV", {
				'url':   this.loadingUrl,
				'phase': 'not a CSV file'
			}));
		}
		var result=[];
		for (var lineno=0;lines.length>lineno;lineno++) {
			var object = new Object();
			var values = OpenLayers.String.trim(lines[lineno]).split(this.fieldSeparator);
			if (values.length<=1) continue;
			for (var col=0; values.length>col && names.length>col; col++) {
				object[names[col]] = values[col];
			}
			result.push(object);
		}
		return result;
	},

	//---------------------------------------------------------
	//	Gen HTML code for Popup
	//---------------------------------------------------------

	html: function (text) {
		return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	},

	createHtmlFromData: function (data) {
		if (data._csize) {
			var icon = '<img src="'+this.getIconUrl(data)+'" alt=""/>';
			return '<div>'+icon+'&nbsp;Dieses Icon ist in der &#220;bersichtsdarstellung Platzhalter f&#252;r '+data._csize+' Knoten in der nahen Umgebung. Diese werden ab Zoomstufe '+this.minZoom+' nachgeladen und angezeigt.</div>\n';
		}
		var info = [];
		for (var tag in data) {
			if (data[tag] != '') info.push (this.html(tag)+": "+this.formatValue(data[tag]))
		}
		var text = "<pre>"+info.join("\n")+"</pre>";

		if (this.osmlinks) {
			osmlinks = this.createOsmLinks(data);
			if (osmlinks) text += '<p>'+osmlinks+'</p>\n';
		}
		return text;
	},

	formatValue: function (text) {
		var list=text.split (';');
		var result=[];
		for (var i=0; i<list.length;i++) {
			var value = this.html (OpenLayers.String.trim(list[i]));
			if (value.substr (0,7)=='http://') {
				result.push ('<a target="_blank" href="'+value+'">'+value+'</a>');
				continue;
			}
			result.push (value);
		}
		return result.join ("; ");
	},

	createOsmLinks: function (data, id) {

		if (!id) id=data.id;
		if (!id) return '';

		var tid = id.match (/^([nwr]?)([1-9][0-9]*)$/);

		if (!tid) return;

		var type;
		switch (tid[1]) {
		case '':
		case 'n':
			type = 'node'; break;
		case 'w':
			type = 'way'; break;
		case 'r':
			type = 'relation'; break;
		default:
			return '';
		}

		var id=tid[2];

		var l=parseFloat(data.lon)-0.0003;
		var b=parseFloat(data.lat)-0.0005;
		var r=parseFloat(data.lon)+0.0003;
		var t=parseFloat(data.lat)+0.0005;

		if (data.bbox) {
			var lbrt = data.bbox.split(',');
			l = parseFloat(lbrt[0])-0.0001;
			b = parseFloat(lbrt[1])-0.0001;
			r = parseFloat(lbrt[2])+0.0001;
			t = parseFloat(lbrt[3])+0.0001;
		}

		return '<a target="_blank" href="http://www.openstreetmap.org/browse/'+type+'/'+id+'">'+type+' '+id+'</a>'+
		' – edit with '+
	'<a target="_blank" href="http://www.openstreetmap.org/edit?'+
		'lat='+data.lat+'&amp;lon='+data.lon+'&amp;zoom=17">potlatch</a>, '+
	'<a target="_blank" href="http://www.openstreetmap.org/edit?editor=potlatch2&'+
		'lat='+data.lat+'&amp;lon='+data.lon+'&amp;zoom=17">potlatch2</a> or '+
	'<a target="josmremote" href="http://127.0.0.1:8111/load_and_zoom'+
		'?left='+l+'&amp;bottom='+b+'&amp;right='+r+'&amp;top='+t+
		'&amp;select='+type+''+id+'">josm</a>';
	},

	createHtmlFromList: function (list) {
		var items = [];
		var clusters = [];
		var nItems=0;
		var limit = this.clusterLimit && this.clusterLimit<list.length ? this.clusterLimit : list.length;
		for (var i=0; i<list.length; i++) {
			if (list[i]._csize || list[i].cluster) {
				clusters.push (this.createHtmlFromData(list[i]));
			} else {
				nItems++;
				if (items.length<limit) items.push (this.createHtmlFromData(list[i]));
			}
		}
		if (nItems>limit) {
			if (limit!=1) items.unshift('Die ersten '+items.length+' von '+nItems+ ' Eintr&#228;gen:');
		} else if (items.length) {
			if (limit!=1) items.unshift('Alle '+items.length+ ' Eintr&#228;ge:');
		} else {
			items=clusters;
		}
		return items.join('<hr/>\n');
	},

	//---------------------------------------------------------
	//	Bounding box for markers
	//---------------------------------------------------------

	getBounds: function () {
		if (!this.markers || !this.markers.length)
			return null;
		var bounds = new OpenLayers.Bounds ();
		// XXX experimental
		if (this.region) {
			var count=0;
			var length=this.region.length;
			for (var i=0; i<this.markers.length; i++) {
				if (!this.markers[i].data.region)
					continue;
				if (this.markers[i].data.region.substr(0,length)!=this.region)
					continue;
				bounds.extend (this.markers[i].lonlat);
				count++;
			}
			if (count) return bounds;
		}
		// XXX experimental
		for (var i=0; i<this.markers.length; i++) {
			bounds.extend (this.markers[i].lonlat);
		}
		return bounds;
	},

	CLASS_NAME:"OpenLayers.Layer.PopupMarker"
});

//--------------------------------------------------------------------------------
//	$Id: popupmarker.js,v 1.55 2011/09/17 11:23:49 wolf Exp wolf $
//--------------------------------------------------------------------------------
