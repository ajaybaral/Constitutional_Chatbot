<?php
// Google Drive File ID
$fileId = '1y_mvT0bXMREY-WYnvytUP6dMtJBpR3EF';

// Construct direct download link
$file = "https://drive.google.com/uc?export=download&id=$fileId";

// Set headers
header('Content-Description: File Transfer');
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="myfile.zip"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');

// Output the file from Google Drive
readfile($file);
exit;
?>

