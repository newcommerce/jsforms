<?php

require_once("../../php_incs/image_utils.inc.php");
require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$owner = esc($_POST['owner']);
$ownerId = esc($_POST['owner_id']);
$typeId = esc($_POST['type_id']);

$query = <<< QUERY
SELECT * FROM `photo` WHERE `owner` = '$owner' AND `owner_id` = '$ownerId' AND `photo_type_id` = '$typeId'
QUERY;

$result = runQuery($query);
$data['photos'] = array();

while($row = mysql_fetch_assoc($result))
	$data['photos'][] = $row;

$data['owner'] = $owner;
$data['owner_id'] = $ownerId;
$data['type_id'] = $typeId;

outputResultJSON($data);

?>