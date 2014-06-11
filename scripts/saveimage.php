<?php

require_once("../../php_incs/image_utils.inc.php");
require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$owner = $_POST['owner'];
$ownerId = $_POST['ownerId'];
$description = $_POST['description'];
$typeId = $_POST['typeId'];
$description = esc($_POST['description']);

$_FILES['image']['type'];
$_FILES['image']['name'];
$_FILES['image']['size'];

$originalName = $_FILES['image']['name'];
$tmpFilename = $_FILES['image']['tmp_name'];
$dims = getImageResolution($tmpFilename);

validatePostedInfos($owner, $ownerId, $typeId, $dims);

$width = $dims[0];
$mime = $dims['mime'];
$height = $dims[1];

$latLon = extractLatLon($tmpFilename);
if($latLon !== FALSE)
{
	$lat = $latLon['lat']['decimal'];
	$lon = $latLon['lon']['decimal'];
}
else
{
	$lat = -1000;
	$lon = -1000;
}

$targetFilename = getPhotoTargetFilename($owner, $ownerId, $originalName);
rename($tmpFilename, $targetFilename);
chmod($targetFilename, 0744);
$url = str_replace("/home/vraipro/", "http://", $targetFilename);

$query = <<< QUERY
INSERT INTO `photo` (`owner`, `owner_id`, `mime_type`, `description`, `url`, `original_width`, `original_height`, `photo_type_id`, `lat`, `lon`, `at`) 
VALUES ('$owner', '$ownerId', '$mime', '$description', '$url', '$width', '$height', '$typeId', '$lat', '$lon', NOW())
QUERY;

$result = runQuery($query);
if(mysql_affected_rows() == 0)
	tastyError(405, "query failed", 500);
else
{
	$id = mysql_insert_id();
	$data = array("id" => $id, 
	              "filename" => $targetFilename,
		          "width" => $width,
		          "height" => $height,
		          "owner" => $owner,
		          "owner_id" => $ownerId,
		          "url" => $url,
		          "type_id" => $typeId, 
		          "lat" => $lat,
		          "lon" => $lon,
		          "description" => $description, 
		          "originalName" => $originalName,
		          "mimeType" => $mime);

	outputResultJSON($data);
}
?>