<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$email = esc($_GET['email']);

	function randomPassword() {
    	$alphabet = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    	$pass = array(); //remember to declare $pass as an array
    	$alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
    	for ($i = 0; $i < 8; $i++) {
	        $n = rand(0, $alphaLength);
        	$pass[] = $alphabet[$n];
    	}
    	return implode($pass); //turn the array into a string
	}


	function create_guid($namespace = '')
	{
	    static $guid = '';
	    $uid = uniqid("", true);
	    $data = $namespace;
	    $data .= $_SERVER['REQUEST_TIME'];
	    $data .= $_SERVER['HTTP_USER_AGENT'];
	    $data .= $_SERVER['LOCAL_ADDR'];
	    $data .= $_SERVER['LOCAL_PORT'];
	    $data .= $_SERVER['REMOTE_ADDR'];
	    $data .= $_SERVER['REMOTE_PORT'];
	    $hash = strtoupper(hash('ripemd128', $uid . $guid . md5($data)));
	    $guid = '{' .   
	            substr($hash,  0,  8) . 
	            '-' .
	            substr($hash,  8,  4) .
	            '-' .
	            substr($hash, 12,  4) .
	            '-' .
	            substr($hash, 16,  4) .
	            '-' .
	            substr($hash, 20, 12) .
	            '}';
	    return $guid;
	}
	

	// first make sure the account works	
	$query = <<< QUERY
SELECT * FROM `user` WHERE `email` = '$email'
QUERY;

	$result = runQuery($query);

	if(mysql_num_rows($result) == 0)
	{
		// something went wrong
		tastyError(401, "no user found with email $email");
	}

	$row = mysql_fetch_assoc($result);
	$email = $row['email'];
	$firstName = $row['first_name'];
	$lastName = $row['last_name'];	

	// need the userid
	$userId = esc($row['id']);

	// create the token
	$token = esc(create_guid($email."_".$userId));

	// insert in the database
	$query = <<< QUERY
INSERT INTO `password_request_token` (`user_id`, `token`) VALUES('$userId', '$token')
QUERY;

	$result = runQuery($query);
	if(mysql_affected_rows() == 0)
		tastyError(401, "something went wrong creating token");

	// generate random password
	$newPassword = randomPassword();
	$ingestedPwd = ingestPassword($newPassword);

	// update the database
	$query = <<< QUERY
UPDATE `user` SET `password` = '$ingestedPwd' WHERE `id` = '$userId'
QUERY;

	$result = runQuery($query);
	if(mysql_affected_rows() == 0)
		tastyError(401, "something went wrong setting new password");

	$data['user_id'] = $userId;
	$data['email'] = $email;
	$data['token'] = "you wish";
	$data['success'] = true;

	$message = "Hi $firstName, \r\n We've reset your password for you to '$newPassword'. If you would like to reset it yourself to something new please <a href='passwordReset.php?token=$token'>click here</a>. \r\n Thank you";

	// send email

	$headers = 'From: info@vraipro.ca' ."\r\n" .
			   'Reply-To: info@vraipro.ca' ."\r\n" .
			   'X-Mailer: PHP/'.phpversion();
	mail($email, "VraiPro.ca -- Password Reset", $message, $headers);

	outputResultJSON($data);
?>