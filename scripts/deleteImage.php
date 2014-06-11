<?php

	require_once("../../php_incs/image_utils.inc.php");
	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");
	
	$photoId = $_GET['id'];

	if(!is_numeric($photoId) || $photoId <= 0)
	{
		echo "invalid file id";
    	exit;
	}
	else
	{

		$query = <<< QUERY
DELETE FROM `photo` WHERE `id` = '$photoId'
QUERY;

		$result = runQuery($query);
		if(mysql_affected_rows() == 0)
		{
			// failed
			$data['success'] = false;
		}
		else
		{
			$data['success'] = true;
		}
	}

	outputResultJSON($data);
?>