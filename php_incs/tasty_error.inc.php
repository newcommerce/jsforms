<?php

error_reporting(E_ERROR | E_PARSE);

$debug = false;
$timeStart = microtime(true);
$queries = array();

function ingestPassword($password)
{
    return md5($password."masturbt0nbr@in");
}

function comparePasswords($fromDb, $fromForm)
{
    return ingestPassword($fromForm) == $fromDb;    
}

function tastyError($code, $message, $httpCode = 500)
{
	global $lastQuery, $queries, $log;

	header_status($httpCode);
	header('Content-type: application/json');
	$backtrace = debug_backtrace();
	
	$error = array("code" => $code,
		           "message" => $message, 
		           "lastQuery" => $lastQuery, 
		           "queries" => $queries, 
		           "log" => $log,
		           "trace" => $backtrace,
                   "success" => false);

	echo json_encode($error);
	exit();
}

function testDataValidity($data, $fields, $projected_action)
{
	foreach($fields as $field)
	{
		if(!isset($data[$field]) || trim($data[$field]) === "")
			tastyError(1, "$field needs to be specified to $projected_action", 400);
	}
}

function logg($message)
{
	global $log, $debug;	
	$log[] = $message;
	if($debug)
		echo $message.'\r\n';
}

function logg_r($data)
{
	logg(print_r($data, true));
}

function debug($on)
{
	global $debug;
	$debug = $on;
}

function outputResultJSON($data, $debug = true)
{
	global $queries, $timeStart, $log;

	$queryTime = 0;
	foreach($queries as $query)
		$queryTime += $query['elapsed'];

	$elapsed = round((microtime(true) - $timeStart) * 1000);

	$data["elapsed"] = $elapsed;
	$data['query total'] = $queryTime;	

	if($debug)
	{
		$data["log"] = $log;
		$data["queries"] = $queries;
	}

	header('Content-type: application/json; charset=utf-8');	
	echo js_encode($data);
}

function js_encode($data)
{
	return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

 function header_status($statusCode) {
    static $status_codes = null;

    if ($status_codes === null) {
        $status_codes = array (
            100 => 'Continue',
            101 => 'Switching Protocols',
            102 => 'Processing',
            200 => 'OK',
            201 => 'Created',
            202 => 'Accepted',
            203 => 'Non-Authoritative Information',
            204 => 'No Content',
            205 => 'Reset Content',
            206 => 'Partial Content',
            207 => 'Multi-Status',
            300 => 'Multiple Choices',
            301 => 'Moved Permanently',
            302 => 'Found',
            303 => 'See Other',
            304 => 'Not Modified',
            305 => 'Use Proxy',
            307 => 'Temporary Redirect',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            402 => 'Payment Required',
            403 => 'Forbidden',
            404 => 'Not Found',
            405 => 'Method Not Allowed',
            406 => 'Not Acceptable',
            407 => 'Proxy Authentication Required',
            408 => 'Request Timeout',
            409 => 'Conflict',
            410 => 'Gone',
            411 => 'Length Required',
            412 => 'Precondition Failed',
            413 => 'Request Entity Too Large',
            414 => 'Request-URI Too Long',
            415 => 'Unsupported Media Type',
            416 => 'Requested Range Not Satisfiable',
            417 => 'Expectation Failed',
            422 => 'Unprocessable Entity',
            423 => 'Locked',
            424 => 'Failed Dependency',
            426 => 'Upgrade Required',
            500 => 'Internal Server Error',
            501 => 'Not Implemented',
            502 => 'Bad Gateway',
            503 => 'Service Unavailable',
            504 => 'Gateway Timeout',
            505 => 'HTTP Version Not Supported',
            506 => 'Variant Also Negotiates',
            507 => 'Insufficient Storage',
            509 => 'Bandwidth Limit Exceeded',
            510 => 'Not Extended'
        );
    }

    if ($status_codes[$statusCode] !== null) {
        $status_string = $statusCode . ' ' . $status_codes[$statusCode];
        header($_SERVER['SERVER_PROTOCOL'] . ' ' . $status_string, true, $statusCode);
    }
}

$headers = array();
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $headers[str_replace(' ', '', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))))] = $value;
    }
}

?>