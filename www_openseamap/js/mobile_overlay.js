function clicker_info(mapid){
	var thediv=document.getElementById('displayinfo');
    var org_url = '';
	// lonvia variables
	var lonvia_path2route_image = 'http://mapstatic.lonvia.de/img/';
    var lonvia_mapname = '';
	var lonvia_baseurl = 'lonvia.de';
	var icon_baseurl = '../icon/';
	var icon_size = 16;
	
	if(thediv.style.display == "none"){
	    var htmlCode = '';
		thediv.style.display = "";
		htmlCode = "<table width='100%' height='100%'><tr><td class='infobackground'>" + 
		"<h1 class='infoheader'><i>osm2go</i> - die smartphone OSM-Karte</h1>" + 
		"<p class='infotxt'>Eine Idee von Jan Tappenbeck alias <a class='linktxt' href='http://wiki.openstreetmap.org/index.php/User:L%C3%BCbeck' target='self' >L&uuml;beck</a><br>" +
		"Soweit nicht anders angegeben werden nur die Daten nachfolgender (auszugsweise) Webseite entsprechend dargestellt:</p>";
	
	
	    if (mapid == 1032){  // XMAS
		    org_url = 'http://www.tappenbeck.net/osm/maps/deu/index.php?id=1032';
			
	    } else if  (mapid == 1034){  // hiking  
		     lonvia_mapname = 'Hiking-Map'; 
			 org_url = 'http://hiking.'+lonvia_baseurl;
			 
	    } else if(mapid == 1036){  // opensea
		    org_url = 'http://www.openseamap.de';
			
	    } else if(mapid == 1037){  // cycling
		    lonvia_mapname = 'Cycling-Map';
			org_url = 'http://cycling.'+lonvia_baseurl;
			
	    } else if(mapid == 1038){  // mtb
		    lonvia_mapname = 'MTB-Map';
			org_url = 'http://mtb.'+lonvia_baseurl;
			
	    } else if(mapid == 1039){  // inline
		    lonvia_mapname = 'inline-Map';
			org_url = 'http://skating.'+lonvia_baseurl;
			
	    } else if(mapid == 1041){  // missing housenumber HL & Co
		    org_url = 'http://www.tappenbeck.net/osm/maps/deu/index.php?id=1041';
			
        } else if(mapid == 1042){  // ski-piste
			org_url = 'http://www.openpistemap.org';
			
		}	

		
		if ( mapid == 1032) {
			htmlCode = htmlCode + "<h1 class='mapheader'>XMAS bei OpenStreetMap</h1>" +
			"<img src='"+icon_baseurl+"xmas_market.png' height='"+icon_size+"' width='"+icon_size+"'>  Weihnachtsmarkt<br>" +
			"<img src='"+icon_baseurl+"xmas_tree.png' height='"+icon_size+"' width='"+icon_size+"'>  Weihachtsbaum<br>" +
			"(ca. t&auml;gliches Update)";		
			
        } else if  ((mapid == 1034) || (mapid == 1037) || (mapid == 1038) || (mapid == 1039) ){	
			htmlCode = htmlCode + "<h1 class='mapheader'>Lonvia's "+lonvia_mapname+"</h1>" +
			"<img src='"+lonvia_path2route_image+"route_int.png'> Kontinentale   " +
			"<img src='"+lonvia_path2route_image+"route_nat.png'>  Nationale<br>" +
			"<img src='"+lonvia_path2route_image+"route_reg.png'>  Regionale   " +
			"<img src='"+lonvia_path2route_image+"route_other.png'>  Lokale Route<br>";

		} else if ( mapid == 1036) {
		    htmlCode = htmlCode + "<h1 class='mapheader'>OpenSeaMap - freie Seekarte</h1>"; 

		} else if ( mapid == 1041) {
			htmlCode = htmlCode + "<h1 class='mapheader'>Fehlende Hausnummern - HL+Co</h1>" +
			"ERROR-Image  note=missing housenumber" +
			"(ca. t&auml;gliches Update)";

		} else if ( mapid == 1042) {
		    htmlCode = htmlCode + "<h1 class='mapheader'>OpenPisteMap - Ski fahren</h1>"; 
		} 

		
	    htmlCode = htmlCode +"<br><a class='infoclose' href='#' onclick='return clicker_info();'>schliessen / close</a><br>" + 
		"<p class='linktxt'><a href='"+org_url+"' target='self' >Orginalkarte</a>  | <a href='http://www.tappenbeck.net' target='self' >Impressum</a></p>";
		
		
		htmlCode = htmlCode + "<p class='infotxt'>Position?? ... ungef&auml;hre Position (Funkzelle oder GPS)<br>" +
		"Routes ... Routen im aktuellen Kartenausschnit (externe Funktion)<br>" +
		"zur R&uuml;ckkehr auf die Karte bitte die Zur&uuml;ck-Taste des Phones verwenden" +
		"</p>" +
		"</td></tr></table>";
	    thediv.innerHTML = htmlCode;
	
		}else{
		thediv.style.display = "none";
		thediv.innerHTML = '';
	}
	return false;
}


function clicker_routes(){
	var thediv=document.getElementById('displayroutes');
	if(thediv.style.display == "none"){
		thediv.style.display = "";
//		thediv.innerHTML = "<table width='100%' height='100%'><tr><td align='center' valign='middle' width='100%' height='100%'><object classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B' codebase='http://www.apple.com/qtactivex/qtplugin.cab' width='640' height='500'><param name='src' value='http://cowcast.creativecow.net/after_effects/episodes/Shape_Tips_1_POD.mp4'><param name='bgcolor' value='#000000'><embed src='http://cowcast.creativecow.net/after_effects/episodes/Shape_Tips_1_POD.mp4' autoplay='true' pluginspage='http://www.apple.com/quicktime/download/' height='500' width='640' bgcolor='#000000'></embed></object><br><br><a href='#' onclick='return clicker();'>CLOSE WINDOW</a></td></tr></table>";
		thediv.innerHTML = "<table width='100%' height='100%'><tr><td align='center' valign='middle' width='100%' height='100%'><iframe src='http://hiking.lonvia.de/de/routebrowser/?bbox=10.6740761,53.8546529,10.7042885,53.8759105' width='80%' height='80%' name='iframe_info'><p>... there is nothing - error !</iframe><br><br><a href='#' onclick='return clicker_routes();'>schliessen / close</a></td></tr></table>";
	
		}else{
		thediv.style.display = "none";
		thediv.innerHTML = '';
	}
	return false;
}