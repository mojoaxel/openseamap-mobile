//--------------------------------------------------------------------------------
//	$Id: tappenbeck.js,v 1.7 2010/09/04 18:07:49 wolf Exp $
//--------------------------------------------------------------------------------

//------------------------------------------------------------------------
//	vorkonfigurierte PopupMarker
//  2011-03-22  JT   Fehler in dem JOSM-Remote-Link behoben
//------------------------------------------------------------------------

OpenLayers.Layer.PopupMarker.JT = OpenLayers.Class(OpenLayers.Layer.PopupMarker,{

        initialize:function(name, db, options){
                OpenLayers.Layer.PopupMarker.prototype.initialize.apply(this,[name, options]);
		this.db = db;
        },

	createIconFromData: function (data) {
		var size   = data.iconSize.split(',');
		var offset = data.iconOffset.split(',');
		return new OpenLayers.Icon (data.icon,
			{w:parseFloat(size[0]),h:parseFloat(size[1])},
			{x:-parseFloat(offset[0]),y:-parseFloat(offset[1])});
                },

	createHtmlFromData: function (data) {
		text = '<h3>'+data.title+'</h3>'+data.description;
		//-----------[ optional ]--------------
		text += '<hr>';
		text += '<a target="browse" href="http://www.openstreetmap.org/browse/'+data.osm+'">browse</a> or edit with ';
		text +=	'<a target="_blank" href="http://www.openstreetmap.org/edit'+
				'?lat='+data.lat+'&amp;lon='+data.lon+'&amp;zoom=17">potlatch</a> or '
		text += '<a target="josmremote" href="http://127.0.0.1:8111/load_and_zoom'+
                	'?left='+(data.lon-0.001)+'&amp;right='+(data.lon*1+0.001)+
        		'&amp;top='+(data.lat*1+0.0005)+'&amp;bottom='+(data.lat-0.0005)+
        		'&amp;select='+data.osm.replace(/\//, '')+'">josm</a>'
		
		//text += '<a target="josm" href="http://localhost:8111/import?url=http://api.openstreetmap.org/api/0.6/'+data.osm+'/full">josm</a>.';
		//-----------[ optional ]--------------
		return text;
	},

	createUrlForBounds: function (bounds) {
		return "../script/csv.phtml?db="+this.db+
			"&lon.ge="+bounds.left+
			"&lon.lt="+bounds.right+
			"&lat.ge="+bounds.bottom+
			"&lat.lt="+bounds.top;
	},

	minZoom: 12,
	tileSize: 0.1,

	CLASS_NAME:"OpenLayers.Layer.PopupMarker.JT"
});

//------------------------------------------------------------------------
//	ShadingLayer
//------------------------------------------------------------------------

OpenLayers.Layer.Shading=OpenLayers.Class (OpenLayers.Layer.XYZ, {

        attribution: 'elevation data by <a href="http://nasa.gov/">NASA SRTM</a>',
	isBaseLayer: false,
        name: 'SRTM Shading',
        sphericalMercator:true,
	url: 'http://toolserver.org/~cmarqu/hill/\${z}/\${x}/\${y}.png',
        CLASS_NAME: 'OpenLayers.Layer.Shading'
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//
//	class:	OpenLayers.Tile.Image
//	method:	initImgDiv
//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//
//	The Problem:
//
//	This functions creates an image using "OpenLayers.Util.createImage"
//	with the sixst parameter "delayDisplay" set to "true".
//
//	This causes the image to observe the events "load" and "error",
//	binding "load" to OpenLayers.Util.onImageLoad()
//	and "error" to OpenLayers.Util.onImageLoadError()
//
//	The function OpenLayers.Util.onImageLoadError() will //	count up
//	the instance variable _attempts and retry loading the image using
//	possibly different urls until a certain limit is reached
//
//	But initImgDiv does itself observe "load" and "error",
//	effectively overwriting the former bindings.
//	(Hint: addEventListener only accepts ONE listener)
//
//--------------------------------------------------------------------------------
//
//	Result:
//	- there is no retry on tile image loading
//	- on error the instance variable "_attempts" is null,
//	  preventing the "onerror"-handler to call "onload".
//	  So no "loadend" is sent to OpenLayers.Layer.Grid,
//	  keeping the "numLoadingTiles" counter permanently > 0.
//	  Therefore no "loadend" ist sent from Grid until the
//	  tiles in error are purged from the system
//	  
//--------------------------------------------------------------------------------
//
//	Quick+dirty hack (this is NOT a permanent solution):
//	  
//	- hardcoded callback to OpenLayers.Util.onImageLoadError
//	  allows retrying the load and computation of _attempts
//	  
//--------------------------------------------------------------------------------
/*
 
OpenLayers.Tile.Image.prototype.initImgDiv = function() {

	var offset=this.layer.imageOffset;
	var size=this.layer.getImageSize(this.bounds);

	if(this.layerAlphaHack){
		this.imgDiv=OpenLayers.Util.createAlphaImageDiv(null,offset,size,null,"relative",null,null,null,true);
	}else{
		this.imgDiv=OpenLayers.Util.createImage(null,offset,size,null,"relative",null,null,true);
	}

	this.imgDiv.className='olTileImage';
	this.frame.style.zIndex=this.isBackBuffer?0:1;
	this.frame.appendChild(this.imgDiv);
	this.layer.div.appendChild(this.frame);

	if(this.layer.opacity!=null){
		OpenLayers.Util.modifyDOMElement(this.imgDiv,null,null,null,null,null,null,this.layer.opacity);
	}

	this.imgDiv.map=this.layer.map;

	var onload=function(){
		if(this.isLoading){
			this.isLoading=false;
			this.events.triggerEvent("loadend");
		}
	};

	if(this.layerAlphaHack){
		OpenLayers.Event.observe(this.imgDiv.childNodes[0],'load',OpenLayers.Function.bind(onload,this));
	}else{
		OpenLayers.Event.observe(this.imgDiv,'load',OpenLayers.Function.bind(onload,this));
	}

	var onerror=function(){

		//----------------------------------------------------------------
		//	ADDED	callback to retry handler	ADDED
		//----------------------------------------------------------------
		OpenLayers.Util.onImageLoad.call (this.imgDiv);
		//----------------------------------------------------------------
		//	ADDED	callback to retry handler	ADDED
		//----------------------------------------------------------------

		if(this.imgDiv._attempts==null||this.imgDiv._attempts>OpenLayers.IMAGE_RELOAD_ATTEMPTS){
			onload.call(this);
		}
	};
	OpenLayers.Event.observe(this.imgDiv,"error",OpenLayers.Function.bind(onerror,this));
};

*/

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



//--------------------------------------------------------------------------------
//	$Id: tappenbeck.js,v 1.7 2010/09/04 18:07:49 wolf Exp $ - change JT
//--------------------------------------------------------------------------------
