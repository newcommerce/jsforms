<?php

require_once("../../php_incs/exif_extraction.inc.php");

// get the file list of directory ./assets
$files = scandir("./assets");
$images = array();

foreach($files as $file)
{
	if(strpos($file, ".jpg") !== FALSE)
	{
		echo "<b>".$file."</b><br />";
		$exifData = exif_read_data("./assets/".$file, 0, true);

		echo "<pre>";
		print_r($exifData);
		echo "</pre><br><br>";
		$images[] = $file;

	}
}

?>