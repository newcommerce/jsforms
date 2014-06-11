<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_GET['model'];
	$modelId = $_GET['modelId'];
	$field = $_GET['field'];

	validateModel_Id_Field($model, $modelId, $field);

	// finally update value
	$value = esc($value);
	$query = <<< QUERY
SELECT `$field` FROM `$model` WHERE `id` = '$modelId'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result) == 0)
	{
		echo 'no rows found. weird';
		exit;
	}

	$row = mysql_fetch_assoc($result);
	$value = $row[$field];

	$data['success'] = true;
	$data['modelId'] = $modelId;
	$data['model'] = $model;
	$data['field'] = $field;
	$data['value'] = $value;

	outputResultJSON($data);
?>