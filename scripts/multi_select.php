<?php

	require_once("../../php_incs/tasty_error.inc.php");
	require_once("../../php_incs/db.inc.php");

	$model = $_GET['model'];
	// expect an array of values
	$preSelection = $_GET['preselection'];
	$default = $_GET['default'];
	$displayField = $_GET['displayField'];
	$selectId = $_GET['selectId'];
	$condition = $_GET['condition'];

	// add condition fields
	$conditionAdded = false;
	
	$query = <<< QUERY
SELECT `id`, `$displayField` FROM `$model`
QUERY;

	if(isset($preSelection) && $preSelection != "")
	{
		$query .= ' WHERE `id` IN ('.join(",", $preSelection).")";
		$conditionAdded = true;
	}

	if(isset($condition) && $condition != "")
	{
		if($conditionAdded)
			$query .= " AND ";
		else
			$query .= " WHERE ";
		$query .= $condition;
	}

	$result = runQuery($query);

	$rows = array();

	while($row = mysql_fetch_assoc($result))
	{
		$optionObj = array("key" => $row['id'], 
						   "value" => $row[$displayField]);

		unset($row['id']);
		unset($row[$displayField]);

		foreach($row as $key => $value)
		{
			if($key == 'key' || $key == 'value')
				$key = "_".$key;
		
			$optionObj[$key] = $value;
		}

		$rows[] = $optionObj;
	}

	$data['values'] = $rows;
	$data['selectId'] = $selectId;
	$data['displayField'] = $displayField;
	$data['default'] = $default;
	$data['preSelection'] = $preSelection;
	$data['condition'] = $condition;

	outputResultJSON($data);	
?>