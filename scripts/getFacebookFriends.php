<?php

	require_once("../../php_incs/tasty_error.php");
	require_once("../../php_incs/db.inc.php");

	$fbId = esc($_GET['fb_id']);

	$query = <<< QUERY
SELECT * FROM `user_fb_friend` WHERE `fbid` = '$fbId'
QUERY;

	$result = runQuery($query);

	$data['friends'] = array();
	$data['fb_id'] = $fbId;

	while($row = mysql_fetch_assoc($result))
		$data['friends'][] = $row;

	outputResultJSON($data);	
?>