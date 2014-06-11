<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$sourceModel = $_POST['source_model'];
	$sourceId = $_POST['source_id'];
	$model = $_POST['model'];
	$id = $_POST['id'];
	$name = $_POST['name'];

	$sourceIdField = $sourceModel."_id";

	$query = <<< QUERY
DELETE FROM `$model` WHERE `id` = '$id' AND `$sourceIdField` = '$sourceId'
QUERY;

	$result = runQuery($query);

	$data['success'] = mysql_affected_rows() > 0;

	$data['source_model'] = $sourceModel;
	$data['source_id'] = $sourceId;
	$data['model'] = $model;
	$data['id'] = $id;
	$data['name'] = $name;

	outputResultJSON($data);
?>