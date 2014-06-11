<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_POST['model'];
	$idField = $_POST['id_field'];
	$displayField = $_POST['display_field'];
	$sourceIdField = $_POST['source_id_field'];
	$sourceModel = $_POST['source_model'];
	$sourceId = $_POST['source_id'];

	$query = <<< QUERY
SELECT * FROM `$sourceModel` WHERE `id` = '$sourceId'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result) < 1)
		tastyError(401, "invalid model or sourceid");

	$query = <<< QUERY
SELECT * FROM `$model` WHERE `$sourceIdField` = '$sourceId'
QUERY;

	$result = runQuery($query);
	$data['values'] = array();
	while($row = mysql_fetch_assoc($result))
		$data['values'][] = $row;

	$data['model'] = $model;
	$data['id_field'] = $idField;
	$data['source_id_field'] = $sourceIdField;
	$data['source_model'] = $sourceModel;
	$data['source_id'] = $sourceId;

	outputResultJSON($data);
?>