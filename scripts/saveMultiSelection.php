<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$sourceModel = esc($_POST['source_model']);
$targetModel = esc($_POST['target_model']);
$matchModel = esc($_POST['match_model']);
$sourceIdField = esc($_POST['source_id_field']);
$targetIdField = esc($_POST['target_id_field']);

$targetId = esc($_POST['target_id']);
$sourceId = esc($_POST['source_id']);
$selected = esc($_POST['selected']);

$attrField = esc($_POST['attr_field']);
$attrValue = esc($_POST['attr_value']);


// check to see that the targetid exists
// check to see that the sourceid exists

// if not selected, see if the entry existed, if it did, delete it
// if not selected, see if the entry existed, if it didn't, create it.

$query = <<< QUERY
SELECT * FROM `$targetModel` WHERE `id` = '$targetId'
QUERY;
$resultSource = runQuery($query);

$query = <<< QUERY
SELECT * FROM `$sourceModel` WHERE `id` = '$sourceId'
QUERY;
$resultTarget = runQuery($query);

$query = <<< QUERY
SELECT * FROM `$matchModel` WHERE `$targetIdField` = '$targetId' AND `$sourceIdField` = '$sourceId'
QUERY;
$resultMatch = runQuery($query);

$sourceExists = mysql_num_rows($resultSource) > 0;
$targetExists = mysql_num_rows($resultTarget) > 0;
$matchExists = mysql_num_rows($resultMatch) > 0;

if($sourceExists && $targetExists)
{
	$valid = true;
	$query = "";
	if($selected == "true" && $matchExists)
	{
		$modificationNeeded = false;
		// do nothing
	}
	else if($selected == "true")
	{
		$modificationNeeded = true;
		if(isset($attrField) && $attrField != "" && isset($attrValue) && $attrValue != "")
		{
			$query = <<< QUERY
INSERT INTO `$matchModel` (`$targetIdField`, `$sourceIdField`, `$attrField`) VALUES ('$targetId', '$sourceId', '$attrValue')
QUERY;
		}
		else
		{
			$query = <<< QUERY
INSERT INTO `$matchModel` (`$targetIdField`, `$sourceIdField`) VALUES ('$targetId', '$sourceId')
QUERY;
		}

	}
	else
	{
		$modificationNeeded = true;
		$query = <<< QUERY
DELETE FROM `$matchModel` WHERE `$targetIdField` = '$targetId' AND `$sourceIdField` = '$sourceId'
QUERY;
	}

	if($query != "")
	{
		$result = runQuery($query);
		$success = mysql_affected_rows() != 0;
	}
}
else
	$valid = false;

if(isset($attrField) && $attrField != "" && isset($attrValue) && $attrValue != "")
{
	$data['attr_field'] = $attrField;
	$data['attr_value'] = $attrValue;
}

$data['match_exists'] = $matchExists;
$data['source_exists'] = $sourceExists;
$data['target_exists'] = $targetExists;
$data['source_model'] = $sourceModel;
$data['target_model'] = $targetModel;
$data['match_model'] = $matchModel;
$data['source_id_field'] = $sourceIdField;
$data['target_id_field'] = $targetIdField;
$data['source_id'] = $sourceId;
$data['target_id'] = $targetId;
$data['selected'] = $selected;
$data['modificationNeeded'] = $modificationNeeded;
$data['success'] = $success;
$data['valid'] = $valid;

outputResultJSON($data);

?>