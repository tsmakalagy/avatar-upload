
<?php
include "LiquenImg.php";
require('upload.class.php');
ini_set('display_errors', '0');     # don't show any errors...
error_reporting(E_ALL | E_STRICT);

$upload_handler = new UploadHandler();
$lii = new LiquenImg();


/*print_r($_POST);
echo '
<br>dire: '.substr( $upload_handler->getOption('relative_upload_dir'). urldecode(array_pop(array_splice(explode('/','http://localhost/jQuery-File-Upload-and-Crop/server/php/files/DSC02004%20-%20agaricus%20arvensis.JPG'),-1))),1).'
<br>isfile:'.is_file( substr( $upload_handler->getOption('relative_upload_dir'). urldecode(array_pop(array_splice(explode('/','http://localhost/jQuery-File-Upload-and-Crop/server/php/files/DSC02004%20-%20agaricus%20arvensis.JPG'),-1))),1) ).'
<br>';*/

$newUrl = '';
$source = array();

if(isset($_POST['source'])){
	$source = $_POST['source'];    
	$thePicture = substr( $upload_handler->getOption('relative_upload_dir'). urldecode(array_pop(array_splice(explode('/',$_POST['source']['file']),-1))),1);
	$uploadPath = substr($thePicture, 0, strrpos($thePicture, '/'));
	$cacheFolder = $uploadPath . '/cropped/';
	if (!is_dir($cacheFolder)) {
		mkdir($cacheFolder, 0777, true);
	}
	$lii->setCacheFolder($cacheFolder);
}else{
	$thePicture = substr( $upload_handler->getOption('relative_upload_dir'). urldecode(array_pop(array_splice(explode('/',$_POST['file']),-1))),1);
	$_POST['url']=$thePicture;
}

if (!is_file($thePicture)) exit('ERROR: Source image file not found');

if(!isset($_POST['source'])){
	$newFile = $lii->genImage($_POST);

	$thumb = $lii->genImage(array(
	'url' =>  $newFile,
	'outputFolder' => 'thumbnails/',
	'rename' => 'false',
	'oc' => '1',
	'width' => 80
	));

	echo json_encode(array('newFile'=>$newFile));
	exit();
}

$size=getimagesize($thePicture);
$sizeRatio=$size[0]/$_POST['source']['width'];

$type = image_type_to_mime_type($size[2]);
$ft = '';
switch( $type )
{
	case 'image/jpeg':
		$ft = 'jpg';
		break;
	case 'image/gif':
		$ft = 'gif';
		break;
	case 'image/png':
		$ft = 'png';
		break;
}
$w = array();
$w['24'] = 24;
$w['40'] = 40;
$w['60'] = 60;
$images = array();
foreach ($w as $wd) {
	$return = $lii->genImage(array(
	'url'=>$thePicture,
	//'width'=>$_POST['source']['endWidth'],
	'width'=>$wd,
	//'height'=>$_POST['source']['endHeight'],
	'oc' => '1',
	'ft' => $ft,
	'cx' => floor($_POST['c']['x']*$sizeRatio),
	'cy' => floor($_POST['c']['y']*$sizeRatio),
	'cw' => floor($_POST['c']['w']*$sizeRatio),
	'ch' => floor($_POST['c']['h']*$sizeRatio)
	));
	$images['image_'.$wd] = preg_replace("|files/.*$|", $return, $source['file']);
}

/*$file24 = $lii->genImage(array(
	'url'=>$thePicture,
	//'width'=>$_POST['source']['endWidth'],
	'width'=>24,
	//'height'=>$_POST['source']['endHeight'],
	'oc' => '1',
	'ft' => $ft,
	'cx' => floor($_POST['c']['x']*$sizeRatio),
	'cy' => floor($_POST['c']['y']*$sizeRatio),
	'cw' => floor($_POST['c']['w']*$sizeRatio),
	'ch' => floor($_POST['c']['h']*$sizeRatio)
	));

$file60 = $lii->genImage(array(
	'url'=>$thePicture,
	//'width'=>$_POST['source']['endWidth'],
	'width'=>60,
	//'height'=>$_POST['source']['endHeight'],
	'oc' => '1',
	'ft' => $ft,
	'cx' => floor($_POST['c']['x']*$sizeRatio),
	'cy' => floor($_POST['c']['y']*$sizeRatio),
	'cw' => floor($_POST['c']['w']*$sizeRatio),
	'ch' => floor($_POST['c']['h']*$sizeRatio)
	));

$file40 = $lii->genImage(array(
	'url'=>$thePicture,
	//'width'=>$_POST['source']['endWidth'],
	'width'=>40,
	//'height'=>$_POST['source']['endHeight'],
	'oc' => '1',
	'ft' => $ft,
	'cx' => floor($_POST['c']['x']*$sizeRatio),
	'cy' => floor($_POST['c']['y']*$sizeRatio),
	'cw' => floor($_POST['c']['w']*$sizeRatio),
	'ch' => floor($_POST['c']['h']*$sizeRatio)
	));
*/
//$lii2 = new LiquenImg();
/*$thumb = $lii->genImage(array(
	'url' =>  $newFile,
	'outputFolder' => 'thumbnails/',
	'rename' => 'false',
	'oc' => '1',
	'width' => 80//,
	//'height' => 60//,
	//'crop' => false
	));*/
echo json_encode(array('images' => $images));
?>
