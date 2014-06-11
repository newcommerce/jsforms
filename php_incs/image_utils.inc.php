<?php

function getImageResolution($filename)
{
  if(!file_exists($filename))
    return FALSE;

  return getimagesize($filename);
}


function getPhotoFilename($owner, $ownerId, $originalName, $index)
{  
  return "/home/vraipro/vraipro.newcommerce.ca/user_content/pics/".$owner."_".$ownerId."_".$index."_".$originalName;
}

function getPhotoTargetFilename($owner, $ownerId, $originalName)
{
  $index = 0;
  do
  {
    $targetFile = getPhotoFilename($owner, $ownerId, $originalName, $index);
    $index++;
  }
  while(file_exists($targetFile));

  return $targetFile;
}

function validatePostedInfos($owner, $ownerId, $typeId, $dims)
{
  if(!validateOwner($owner, $ownerId))
  {
    echo "invalid owner";
    exit;
  }

  if(!validatePhotoType($typeId))
  {
    echo "invalid photo type";
    exit;
  }

  if(!validateIsImage($dims))
  {
    echo "invalid file type";
    exit;
  }
}

function validateOwner($owner, $ownerId)
{
  $validOwners = array("user", "entreprise", "project");
  if(array_search($owner, $validOwners) === FALSE)
    return FALSE;

  if(!is_numeric($ownerId) || $ownerId <= 0)
    return FALSE;

  $query = <<< QUERY
SELECT * FROM `$owner` WHERE `id` = '$ownerId'
QUERY;

  $result = runQuery($query);
  if($result === FALSE || mysql_num_rows($result) == 0)
    return FALSE;

  return TRUE;
}

// validate photo typeid
function validatePhotoType($typeId)
{
  if(!is_numeric($typeId) || $typeId <= 0)
    return FALSE;

  $query = <<< QUERY
SELECT * FROM `photo_type` WHERE `id` = '$typeId'
QUERY;

  $result = runQuery($query);
  if($result === FALSE || mysql_num_rows($result) == 0)
    return FALSE;

  return TRUE;
}

function validateIsImage($dims)
{
  $allowedTypes = array("image/jpeg", "image/png", "image/jpg");
  if($dims === FALSE || array_search($dims['mime'], $allowedTypes) === FALSE)
    return FALSE;

  return TRUE;
}

function extractLatLon($filename)
{  
  $exifData = exif_read_data($filename, 0, true);
  if(isset($exifData['GPS']))
  {
    $latitude = $exifData['GPS']['GPSLatitude'];
    $longitude = $exifData['GPS']['GPSLongitude'];

    $lon = getGps($longitude);
    $lat = getGps($latitude);
    return array("lon" => $lon, "lat" => $lat);
  }
  else
    return FALSE;
}

function getGps($exifCoord)
{
  $degrees = count($exifCoord) > 0 ? gps2Num($exifCoord[0]) : 0;
  $minutes = count($exifCoord) > 1 ? gps2Num($exifCoord[1]) : 0;
  $seconds = count($exifCoord) > 2 ? gps2Num($exifCoord[2]) : 0;

  //normalize
  $minutes += 60 * ($degrees - floor($degrees));
  $degrees = floor($degrees);

  $seconds += 60 * ($minutes - floor($minutes));
  $minutes = floor($minutes);

  //extra normalization, probably not necessary unless you get weird data
  if($seconds >= 60)
  {
    $minutes += floor($seconds/60.0);
    $seconds -= 60*floor($seconds/60.0);
  }

  if($minutes >= 60)
  {
    $degrees += floor($minutes/60.0);
    $minutes -= 60*floor($minutes/60.0);
  }

  $decimal = $degrees + $minutes/60 + $seconds / 3600;
  return array('degrees' => $degrees, 'minutes' => $minutes, 'seconds' => $seconds, 'decimal' => $decimal);
}

function gps2Num($coordPart)
{
  $parts = explode('/', $coordPart);

  if(count($parts) <= 0)// jic
    return 0;
  if(count($parts) == 1)
    return $parts[0];

  return floatval($parts[0]) / floatval($parts[1]);
}

?>