<?php
/**
 * Created by PhpStorm.
 * User: SHAKIL
 * Date: 3/7/2015
 * Time: 9:18 PM
 */
$name = $_POST['name'];
$email = $_POST['email'];
$msg = $_POST['msg'];
$to = "shakhout@live.com";
$subject = "Email From own website contact Page";

$message = "
<html>
<head>
<title>Email From own website contact Page</title>
</head>
<body>
<p>From: ".$name."</p>
<br>
<p>Email: ".$email."</p>
<br>
<p>".$msg."</p>
</body>
</html>
";

// Always set content-type when sending HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

// More headers
$headers .= 'From: <webmaster@example.com>' . "\r\n";

mail($to, $subject, $message, $headers);
echo "success";