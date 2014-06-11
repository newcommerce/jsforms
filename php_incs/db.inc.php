<?php

$host = "";
$user = "";
$pass = "";
$db = "";
$lastQuery = "";

$mysql_con = mysql_connect($host, $user, $pass);
if(!$mysql_con)
{
	// send me an email
	header_status(500);
	tastyError(1, "Couldn't connect to the database", 500);
}

mysql_select_db($db);
mysql_query("SET character_set_results = 'utf8', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'");

function esc($str)
{
    return mysql_real_escape_string($str);
}

function mysql_value_filter($value)
{
	// $value = utf8_decode($value);
	$value = mysql_real_escape_string($value);
	return $value;	
}

function mysql_insert($table, $inserts, $conn, $alreadyExistCB = null) {
	global $lastQuery, $queries;

    $values = array_map('mysql_value_filter', array_values($inserts));
    $keys = array_keys($inserts);
    $query = 'INSERT INTO `'.$table.'` (`'.implode('`,`', $keys).'`) VALUES (\''.implode('\',\'', $values).'\')';    
    
    $timeStart = microtime(true);
    $result = mysql_query($query, $conn);
    $elapsed = round((microtime(true) - $timeStart) * 1000);

    $lastQuery = $query;
    $queries[] = array("query" => $query, "elapsed" => $elapsed);

    $alreadyExists = false;
    
    if($result === FALSE)
    {
    	$errorNumber = mysql_errno();
    	$error = mysql_error();
    	$alreadyExists = ($errorNumber == 1062);

    	if($alreadyExists)
        {
            if(is_string($alreadyExistCB))
            {
                $alreadyExistCB();
                return false;
            }
            else
                tastyError(199, "item in $table already exists", 409);
        }
    		
    	else
    		mysqlError("inserting into $table");
    }

    return mysql_affected_rows($conn) == 1;
}

function runQuery($query, $errorMessage = "")
{
    global $mysql_con, $lastQuery, $queries;
    if(!isset($queries))
        $queries = array();

    $lastQuery = $query;
    $timeStart = microtime(true);
    $result = mysql_query($query);
    $elapsed = round((microtime(true) - $timeStart) * 1000);
    if($result === FALSE)
    {
        logg("mysql_con: $mysql_con, query:$query");
        mysqlError($errorMessage);
    }

    $queries[] = array("query" => $query, "elapsed" => $elapsed);

    return $result;
}

function mysqlError($message = "")
{
    global $mysql_con, $lastQuery;
    $errorNumber = mysql_errno($mysql_con);
    $error = mysql_error($mysql_con);
    if(strlen($message) > 0)
        $message .= " --";

    tastyError(100, "$message [$errorNumber] $error running query: $lastQuery");
}


/* UTILS */
function removePunctuation( $text )
{
    $urlbrackets    = '\[\]\(\)';
    $urlspacebefore = ':;\'_\*%@&?!' . $urlbrackets;
    $urlspaceafter  = '\.,:;\'\-_\*@&\/\\\\\?!#' . $urlbrackets;
    $urlall         = '\.,:;\'\-_\*%@&\/\\\\\?!#' . $urlbrackets;
 
    $specialquotes  = '\'"\*<>';
 
    $fullstop       = '\x{002E}\x{FE52}\x{FF0E}';
    $comma          = '\x{002C}\x{FE50}\x{FF0C}';
    $arabsep        = '\x{066B}\x{066C}';
    $numseparators  = $fullstop . $comma . $arabsep;
 
    $numbersign     = '\x{0023}\x{FE5F}\x{FF03}';
    $percent        = '\x{066A}\x{0025}\x{066A}\x{FE6A}\x{FF05}\x{2030}\x{2031}';
    $prime          = '\x{2032}\x{2033}\x{2034}\x{2057}';
    $nummodifiers   = $numbersign . $percent . $prime;
 
    return preg_replace(
        array(
        // Remove separator, control, formatting, surrogate,
        // open/close quotes.
            '/[\p{Z}\p{Cc}\p{Cf}\p{Cs}\p{Pi}\p{Pf}]/u',
        // Remove other punctuation except special cases
            '/\p{Po}(?<![' . $specialquotes .
                $numseparators . $urlall . $nummodifiers . '])/u',
        // Remove non-URL open/close brackets, except URL brackets.
            '/[\p{Ps}\p{Pe}](?<![' . $urlbrackets . '])/u',
        // Remove special quotes, dashes, connectors, number
        // separators, and URL characters followed by a space
            '/[' . $specialquotes . $numseparators . $urlspaceafter .
                '\p{Pd}\p{Pc}]+((?= )|$)/u',
        // Remove special quotes, connectors, and URL characters
        // preceded by a space
            '/((?<= )|^)[' . $specialquotes . $urlspacebefore . '\p{Pc}]+/u',
        // Remove dashes preceded by a space, but not followed by a number
            '/((?<= )|^)\p{Pd}+(?![\p{N}\p{Sc}])/u',
        // Remove consecutive spaces
            '/ +/',
        ),
        ' ',
        $text );
}


/* /UTIL */
?>