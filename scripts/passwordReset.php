<?php
	
	$token = esc($_GET['token']);

	$query = <<< QUERY
SELECT * FROM `password_request_token` WHERE `token` = '$token AND `used` = '0'
QUERY;

	$result = runQuery($query);

	if(mysql_num_rows($result) == 0)
		tastyError(401, "nice try");

	$query = <<< QUERY
UPDATE `password_request_token` SET `used` = '1'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result))
?>
// TODO: show page
// TODO: use JS object to offer a form that allows to set a password
// DO SOMETHING FUN