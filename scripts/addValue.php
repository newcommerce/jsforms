<?php
	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_POST['model'];
	$value = $_POST['value'];
	$field = $_POST['valueField'];
	$creator = $_POST['creator'];
	$creatorId = $_POST['creator_id'];


	$query = <<< QUERY
INSERT INTO `$model` (`$field`, `creator_id`) VALUES('$value', '$creatorId')
QUERY;

	$result = runQuery($query);

	$data['model'] = $model;
	$data['value'] = $value;
	$data['field'] = $field;
	$data['creator'] = $creator;
	$data['creator_id'] = $creatorId;

	if(mysql_affected_rows() == 1)
	{
		$id = mysql_insert_id();
		$data['id'] = $id;
		$data['success'] = true;

	}
	else
	{
		$data['success'] = false;
	}

	$model = str_replace($creator."_", "", $model);
	$matchModel = $creator."_".$model."_match";
	$sourceField = $creator."_id";
	$targetField = $model."_id";


	$query = <<< QUERY
INSERT INTO `$matchModel` (`$sourceField`, `$targetField`) VALUES('$creatorId', '$id')
QUERY;

	$result = runQuery($query);


	outputResultJSON($data);
?>