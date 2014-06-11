<?php

// validate.php
require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$table = $_GET['table'];
$field = $_GET['field'];
$value = $_GET['value'];
$function = $_GET['function'];
$modelId = $_GET['modelId'];

$result = $function($table, $field, $value, $modelId);

$data = array();
$data['result'] = $result ? "true" : "false";
outputResultJSON($data);

function string_not_exists_exact($table, $field, $value, $modelId)
{
	$value = esc($value);
	$query = <<< QUERY
SELECT * FROM `$table` WHERE `$field` LIKE '$value' AND `id` <> '$modelId'
QUERY;

	$result = runQuery($query, "");
	$totalRows = mysql_num_rows($result);

	return $totalRows == 0;
}
?>