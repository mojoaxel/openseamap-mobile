<?php
	error_reporting(0); 
	$stream = stream_context_create(array('http' => array('timeout' => 3))); 
	//$result = file_get_contents("http://c.tile.cloudmade.com/".$_GET['key']."/".$_GET['styleid']."/256/".$_GET['z']."/".$_GET['x']."/".$_GET['y'].".png", false, $stream); 
	$result = 
		//file_get_contents("http://a.tile.openstreetmap.de/tiles/osmde/".$_GET['z']."/".$_GET['x']."/".$_GET['y'].".png", false, $stream); 
		file_get_contents("http://osm1.wtnet.de/tiles/base/".$_GET['z']."/".$_GET['x']."/".$_GET['y'].".png", false, $stream); 
	if ($result === false) { 
		//$image = imagecreatefrompng('assets/offline.png'); 
		header("HTTP/1.0 404 Not Found");
	} else { 
		$image = imagecreatefromstring($result);
		
	} 
	header('Content-Type: image/png'); 
		imagepng($image);
?>