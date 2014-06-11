<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");
	require_once("../../php_incs/form_util.inc.php");

	$model = $_POST['model'];
	$id = $_POST['id'];

	validateModel_Id($model, $id);

	$update = "";

	$skipFields = array("id", "model");

	foreach($_POST as $key => $value)
	{
		if(array_search($key, $skipFields) !== FALSE)
			continue;

		if($value != null && $value != "null")	
			$update .= "`$key` = '".esc($value)."',";		
	}

	$update = substr($update, 0, -1);

	$query = <<< QUERY
UPDATE `$model` SET $update WHERE `id` = '$id'
QUERY;

	$result = runQuery($query);

	$data['model'] = $model;
	$data['id'] = $id;

	outputResultJSON($data);

?>