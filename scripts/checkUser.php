<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

// username, password

// or

// fbToken, fbId, fbName, fbEmail

function userNotFound()
{
	tastyError(401, "no user found");
 	exit;
}

function userFound($row)
{
	$data = $row;
	unset($data['password']);	
	outputResultJSON($data);
}

function createUser($fbId, $fbFirstName,$fbLastName,$fbEmail,$fbToken)
{
	$fbId = esc($fbId);
	$fbFirstName = esc($fbFirstName);
	$fbLastName = esc($fbLastName);
	$fbEmail = esc($fbEmail);
	$fbToken = esc($fbToken);

	$query = <<< QUERY
INSERT INTO `user` (`email`, `first_name`, `last_name`, `facebook_id`, `facebook_connect_token`) VALUES ('$fbEmail' , '$fbFirstName', '$fbLastName', '$fbId', '$fbToken')
QUERY;

	$result = runQuery($query, "dskfjhasdfkj");
	if(mysql_affected_rows() == 0)
	{
		tastyError(401, "something went wrong");
		// something went wrong
	}
	else
	{
		$userId = mysql_insert_id();
		return $userId;
	}
}

function updateTokenFbInfo($userId, $fbId, $fbFirstName, $fbLastName, $fbEmail, $fbToken)
{
	$fbId = esc($fbId);
	$fbLastName = esc($fbLastName);
	$fbFirstName = esc($fbFirstName);
	$fbEmail = esc($fbEmail);
	$fbToken = esc($fbToken);

	$query = <<< QUERY
UPDATE `user` SET `facebook_id` = '$fbId', `first_name` = '$fbFirstName', `last_name` = '$fbLastName', `email` = '$fbEmail', `facebook_connect_token` = '$fbToken' WHERE `id` = '$userId'
QUERY;

	$result = runQuery($query, "something");
	if(mysql_affected_rows() == 0)
	{
		tasyError(401, "uh... query[$query] didn't affect any rows // UH?");

	}
	else
	{
		// echo $userId;
		// good!
	}
}

if(isset($_POST['fbId']))
{
	$fbToken = $_POST['fbToken'];
	$fbId = $_POST['fbId'];
	$fbLastName = $_POST['fbLastName'];
	$fbFirstName = $_POST['fbFirstName'];
	$fbEmail = $_POST['fbEmail'];

	$fbId = esc($fbId);

	$query = <<< QUERY
SELECT * FROM `user` WHERE `facebook_id` = '$fbId'
QUERY;

	$result = runQuery($query, "something");
	if(mysql_num_rows($result) == 0)
	{
		if(isset($_POST['fbEmail']))
		{
			$query = <<< QUERY
SELECT * FROM `user` WHERE `email` = '$fbEmail'
QUERY;

			$result = runQuery($query, "something");
			if(mysql_num_rows($result) == 0)
			{
				$userId = createUser($fbId, $fbFirstName,$fbLastName,$fbEmail,$fbToken);
				$row = array("id" => $userId, 
					         "email" => $fbEmail,
					         "first_name" => $fbFirstName,
					         "last_name" => $fbLastName,
					         "facebook_id" => $fbId,
					         "facebook_connect_token" => $fbToken);
			}
		}
		else
		{
			userNotFound();
		}
	}

	if(!isset($userId))
	{
		// get the user
		$row = mysql_fetch_assoc($result);
		$userId = $row['id'];
		updateTokenFbInfo($userId, $fbId, $fbFirstName, $fbLastName, $fbEmail, $fbToken);
	}

	userFound($row);
	exit;
}

if(isset($_POST['email']) && isset($_POST['password']))
{
	$password = ingestPassword($_POST['password']);	
	$email = esc($_POST['email']);

	$query = <<< QUERY
SELECT * FROM `user` WHERE `password` = '$password' AND `email` = '$email'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result) > 0)
	{
		$row = mysql_fetch_assoc($result);
		userFound($row);
	}
	else
		userNotFound();
}
else
{
	tastyError(401, "no fbId, no email, no password");
}
?>