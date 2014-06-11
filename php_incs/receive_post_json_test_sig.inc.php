<?php

error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR);

require_once("http_header_status.inc.php");
require_once("tasty_error.inc.php");

$timeStart = microtime(true);

$contentType = $headers['ContentType'];

if($contentType != "application/json; charset=utf-8")
{
	tastyError(1, "Invalid request, contentType is wrong", 400);
	exit();
}


// read headers, make sure it is JSON
$json = file_get_contents("php://input");
$data = json_decode($json, true);

$jsonSig = md5(substr($json, 0, min(strlen($json), 50)))." secrettasty";
$sig = md5($jsonSig);

$receivedSig = $_GET["sig"];
if($sig != $receivedSig)
{
	echo $json."\r\n\r\n";	
    tastyError(1, "[$receivedSig] != [$sig] .. Invalid request, invalid post content or signature mismatch", 400);
}
?>