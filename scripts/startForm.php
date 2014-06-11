<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");
	require_once("../../php_incs/form_util.inc.php");

	// TODO: create edit token

	$model = $_POST['model'];
	$id = $_POST['id'];
	$relations = json_decode($_POST['relations'], true);

	$fields = "(";
	$values = "(";

	validateModel($model);

	foreach($relations as $relation)
	{
		$fields .= '`'.esc($relation['model']).'_id`,';
		$values .= "'".esc($relation['id'])."',";
	}

	if(count($relations))
	{
		$fields = substr($fields, 0, -1).")";
		$values = substr($values, 0, -1).")";
	}
	else
	{
		$fields .= ")";
		$values .= ")";
	}

	// run the query
	// identify 

	if($id == 0)
	{
		$conditions = "";
		foreach($relations as $relation)
		{
			$condition .= "`".$relation['model']."_id` = '".esc($relation['id'])."' AND ";
		}

		$condition = substr($condition, 0, -4);
		$query = <<< QUERY
SELECT * FROM `$model` WHERE $condition
QUERY;
		$result = runQuery($query);
		if(mysql_num_rows($result) == 1)			
			$id = mysql_fetch_assoc($result)['id'];
		else
			$id = -1;
	}

	if($id == -1)
	{
		$query = <<< QUERY
INSERT INTO `$model` $fields VALUES $values
QUERY;
		
		$result = runQuery($query);
		if(mysql_affected_rows() == 0)
		{
			echo "query worked awfully";
			// something went wrong
			exit;
		}
		else
			$id = mysql_insert_id();
	}

	$query = <<< QUERY
SELECT * FROM `$model` WHERE `id` = '$id'
QUERY;

	$result = runQuery($query);
	$row = mysql_fetch_assoc($result);
	$data['data'] = $row;
	$data['model'] = $model;
	$data['id'] = $id;
	$data['relations'] = $relations;

	outputResultJSON($data);
?>