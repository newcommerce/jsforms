<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$sourceModel = esc($_POST['source_model']);
	$sourceId = esc($_POST['source_id']);
	$sourceIdField = esc($_POST['source_id_field']);
	$model = esc($_POST['model']);
	$name = esc($_POST['name']);

	$sourceIdField = $sourceModel."_id";

	$query = <<< QUERY
SELECT * FROM `$sourceModel` WHERE `id` = '$sourceId'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result) == 0)
		tastyError(401, "nice try bozo");

	$query = <<< QUERY
INSERT INTO `$model` (`name`, `$sourceIdField`) VALUES('$name', '$sourceId')
QUERY;

	$result = runQuery($query);
	$data['success'] = mysql_affected_rows() > 0;
	$data['id'] = mysql_insert_id();
	$data['source_model'] = $sourceModel;
	$data['source_id'] = $sourceId;
	$data['model'] = $model;
	$data['source_id_field'] = $sourceIdField;	
	$data['name'] = $name;	

	outputResultJSON($data);
?>