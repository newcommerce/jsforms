<?php

function stringContainsChar($sequence, $target)
{
	$length = strlen($sequence);
	$pos = "";
	for($i = 0; $i < $length; $i++)
	{
		if(($pos = strpos($target, $sequence[$i])) !== FALSE)			
			return TRUE;
	}

	return FALSE;
}

function validateModel($model, $field = "")
{
	// validate that the model exists and contains the field
	$query = <<< QUERY
DESCRIBE `$model`
QUERY;

	$result = runQuery($query);
	$found = $field == "";

	if(mysql_num_rows($result) != 0)
	{
		while($row = mysql_fetch_assoc($result))
		{
			$found |= $row['Field'] == $field;
			if($found)
				break;
		}
	}

	if(!$found)
	{
		echo "field not found";
		exit;
	}
}

function validateModel_Id($model, $modelId)
{
	if(!isset($model) || $model == "" || 
	   !isset($modelId) || $modelId == "")
	{
		echo "err what are you trying to do? model[$model] modelId[$modelId]";
		exit;
	}

	// validate that model contains none of the following "();,.|~!@#$%^&" and no spaces
	if(stringContainsChar("();,.|~!@#$%^& ", $model))
	{
		echo "invalid model name [$model]";
		exit;		
	}

	// validate that the model_id is numeric, not a float and above 0
	if(!is_numeric($modelId) || is_float($modelId) || $modelId <= 0)
	{
		echo "invalid model id";
		exit;
	}

	validateModel($model);

	// validate that the modelid exists
	$query = <<< QUERY
SELECT * FROM `$model` WHERE `id` = '$modelId'
QUERY;

	$result = runQuery($query);
	if(mysql_num_rows($result) == 0)
	{
		echo 'model id not found';
		exit;
	}
}

function validateModel_Id_Field($model, $modelId, $field = "")
{

	// if any of them are not sure, just output an error
	if(!isset($model) || $model == "" || 
	   !isset($modelId) || $modelId == "" || 
	   !isset($field) || $field == "")
	   
	{
		echo "err, what are you trying to do?";
		exit;
	}
	
	validateModel_Id($model, $modelId);
	validateModel($model, $field);
}
?>