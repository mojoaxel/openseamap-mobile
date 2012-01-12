<?php
	//$ttl = 86400; //cache timeout in seconds

	$key = intval($_GET['key']);
	$styleid = intval($_GET['styleid']);
	$x = intval($_GET['x']);
	$y = intval($_GET['y']);
	$z = intval($_GET['z']);

	$file = "tiles/cloudmade_".$styleid."/".$z."_".$x."_".$y.".png";
	if (!is_file($file) || filemtime($file)<time()-(86400*30)) {
		$url = "http://c.tile.cloudmade.com/".$key."/".$styleid."/256/".$z."/".$x."/".$y.".png";
		$ch = curl_init($url);
		$fp = fopen($file, "w");
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_exec($ch);
		curl_close($ch);
		fflush($fp);    // need to insert this line for proper output when tile is first requestet
		fclose($fp);
	}

	//header("Expires: " . gmdate("D, d M Y H:i:s", time() + $ttl * 60) ." GMT");
	//header("Last-Modified: " . gmdate("D, d M Y H:i:s", filemtime($file)) ." GMT");
	//header("Cache-Control: public, max-age=" . $ttl * 60);
	// for MSIE 5
	//header("Cache-Control: pre-check=" . $ttl * 60, FALSE);  
	header ('Content-Type: image/png');
	//readfile($file);
	imagepng($file);
  ?>