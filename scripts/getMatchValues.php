<?php

require_once("../../php_incs/tasty_error.inc.php");
require_once("../../php_incs/db.inc.php");

$sourceModel = esc($_POST['source_model']);
$targetModel = esc($_POST['target_model']);
$targetDisplayField = esc($_POST['target_display_field']);
$matchModel = esc($_POST['match_model']);
$sourceIdField = esc($_POST['source_id_field']);
$targetIdField = esc($_POST['target_id_field']);
$restrict = esc($_POST['restrict']);
$restrictField = esc($_POST['restrict_field']);
$restrictValues = esc($_POST['restrict_values']);
$sourceId = esc($_POST['source_id']);

$query = <<< QUERY
SELECT * FROM `$targetModel`
QUERY;

if($restrict == "true")
	$query .= " WHERE `$restrictField` IN ($restrictValues)";

$result = runQuery($query);
$tmpData = array();

while($row = mysql_fetch_assoc($result))
{
	$tmpData[$row['id']] = $row;
}


$query = <<< QUERY
SELECT * FROM `$matchModel` WHERE `$sourceIdField` = '$sourceId'
QUERY;



$result = runQuery($query);
$data['values'] = array();

while($row = mysql_fetch_assoc($result))
{
	$targetId = $row[$targetIdField];
	$tmpData[$targetId]['selected'] = true;

	// copy over extra properties
	unset($row[$targetIdField]);
	unset($row[$sourceIdField]);
	foreach($row as $key => $value)
		$tmpData[$targetId][$key] = $value;
}

$data['values'] = array();

foreach($tmpData as $key => $value)
	$data['values'][] = $value;

$data['source_model'] = $sourceModel;
$data['target_model'] = $targetModel;
$data['target_display_field'] = $taretDisplayField;
$data['match_model'] = $matchModel;
$data['source_id_field'] = $sourceIdField;
$data['target_id_field'] = $targetIdField;
$data['restrict'] = $restrict;

outputResultJSON($data);

?>