<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_GET['model'];
	$value = $_GET['value'];

	$sequence = array();

	do {

		$sequence[] = $value;
	
		$query = <<< QUERY
SELECT `id`, `parent_id FROM `$model` WHERE `id` = '$value';
QUERY;

		$result = runQuery($query);
		if(mysql_num_rows($result) == 0)
			break;
		$row = mysql_fetch_assoc($result);

		$value = $row['parent_id'];

	} while($row['parent_id'] != $row['id']);

	$data['sequence'] = $sequence;
	$data['model'] = $model;
	$data['value'] = $value;

	outputResultJSON($data);
?>