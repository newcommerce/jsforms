<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$email = esc($_POST['email']);
$password = $_POST['password'];

// TODO: make sure the email is valid

// check to see if email is used before, this should never happen
$query = <<< QUERY
SELECT `id` FROM `user` WHERE `email` = '$email'
QUERY;

$result = runQuery($query);
if(mysql_num_rows($result) > 0)
{
	// error
	tastyError(401, "email $email is already used");
}

$password = ingestPassword($password);

$query = <<< QUERY
INSERT INTO `user` (`email`, `password`) VALUES ('$email', '$password')
QUERY;

$result = runQuery($query);
if(mysql_affected_rows() == 0)
{
	$error = "user wasn't added, something went wrong [".mysql_errno()."] ".mysql_error();
	tastyError(401, $error);
}

$id = mysql_insert_id();

$data['email'] = $email;
$data['password'] = $password;
$data['id'] = $id;

outputResultJSON($data);
?>