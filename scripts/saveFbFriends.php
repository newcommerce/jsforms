<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$userId = esc($_GET['userId']);
$fbId = esc($_GET['fbId']);

$json = file_get_contents('php://input');

$fbFriends = json_decode($json, true);
$values = "";

$fbFriendIds = array();

foreach($fbFriends as $friend)
{
	$firstName = esc($friend['first_name']);
	$lastName = esc($friend['last_name']);
	$uid = esc($friend['uid']);
	$fbFriendIds[] = esc($fiend['uid']);
	$thumb = esc($friend['pic_square']);
	$values .= <<< VALUE
('$fbId', '$userId', '$uid', '$firstName', '$lastName', '$thumb'),
VALUE;
}

$values = substr($values, 0, -1);

// DELETE OLD RELATIONSHIPS
$notIn = "('".join("','", $fbFriendIds)."')";
$query = <<< QUERY
DELETE FROM `user_fb_friend` WHERE `fbid` = '$fbId' AND `friend_fb_uid` NOT IN $notIn
QUERY;
runQuery($query);
$usersDeleted = mysql_affected_rows();

// TODO: THIS CAN BE OPTIMISED FURTHER, only do inserts where needed.

// INSERT NEW ONES
$query = <<< QUERY
INSERT IGNORE INTO `user_fb_friend` (`fbid`, `user_id`, `friend_fb_uid`, `first_name`, `last_name`, `thumb`) VALUES $values
QUERY;
runQuery($query, "dflkafkljhds");
$usersAdded = mysql_affected_rows();

// UPDATE USER USER 
$query = <<< QUERY
UPDATE `user` SET `last_facebook_friend_poll` = NOW()
QUERY;

$result = runQuery($query);
if(mysql_affected_rows() == 0)
	// something went wrong;

$data['user_id'] = $userId;
$data['fb_id'] = $fbId;
$data['friends_added'] = $usersAdded;
$data['friends_removed'] = $usersDeleted;

outputResultJSON($data);
?>