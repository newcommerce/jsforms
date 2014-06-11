<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_GET['model'];
	$modelId = $_GET['modelId'];
	$field = $_GET['field'];
	$value = $_GET['value'];

	validateModel_Id_Field($model, $modelId, $field);

	// finally update value
	$value = esc($value);
	$query = <<< QUERY
UDPATE `$model` SET `$field` = '$value' WHERE `id` = '$modelId'
QUERY;

	$result = runQuery($query);
	if(mysql_affected_rows() < 1)
	{
		echo 'should have worked, but somehow failed ['.mysql_errno().'] '.mysql_error();
		exit;
	}

	$data['success'] = true;
	$data['modelId'] = $modelId;
	$data['model'] = $model;
	$data['field'] = $field;
	$data['value'] = $value;

	outputResultJSON($data);
?>