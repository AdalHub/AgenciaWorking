<?php
// These lines should be at the very top of your PHP file.
// Adjust paths as necessary to where you upload PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Adjust these paths based on where you place the PHPMailer 'src' folder
// For example, if you upload the 'php_mailer' folder to the same directory as this script,
// and it contains the 'src' folder like: /your_website_root/send_email.php
//                                         /your_website_root/php_mailer/src/Exception.php
//                                         /your_website_root/php_mailer/src/PHPMailer.php
//                                         /your_website_root/php_mailer/src/SMTP.php
require __DIR__ . '/php_mailer/src/Exception.php';
require __DIR__ . '/php_mailer/src/PHPMailer.php';
require __DIR__ . '/php_mailer/src/SMTP.php';


// Set response headers for CORS
// IMPORTANT: Change "https://www.yourdomain.com" to your actual domain name in production (e.g., https://www.agenciaworking.com)
// Using "*" in production is a security risk as it allows any website to access your script.
header("Access-Control-Allow-Origin: *"); // Change this for production!
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); // Indicate that the response will be JSON

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // This is for CORS preflight requests
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = ['success' => false, 'message' => ''];

    // Get the raw POST data
    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        $response['message'] = 'Invalid JSON input.';
        echo json_encode($response);
        exit();
    }

    // Basic validation
    $name = isset($data['name']) ? htmlspecialchars(trim($data['name'])) : '';
    $email = isset($data['email']) ? htmlspecialchars(trim($data['email'])) : '';
    $message_content = isset($data['message']) ? htmlspecialchars(trim($data['message'])) : '';

    if (empty($name) || empty($email) || empty($message_content) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please fill all required fields and provide a valid email.';
        echo json_encode($response);
        exit();
    }

    $mail = new PHPMailer(true);
    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.siteprotect.com'; // Hostway SMTP server
        $mail->SMTPAuth   = true;
        
        // IMPORTANT: REPLACE WITH YOUR HOSTWAY EMAIL ACCOUNT AND ITS PASSWORD
        // This email must be one you manage on Hostway (e.g., admin@agenciaworking.com)
        $mail->Username   = 'your_email@agenciaworking.com'; // E.g., admin@agenciaworking.com
        $mail->Password   = 'your_email_password';     // The password for that email account
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Recommended for port 587
        // If port 587 doesn't work, try port 465 with SMTPS:
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
        $mail->Port       = 587; // Or 465 if using SMTPS

        // Enable verbose debug output if needed (comment out for production)
        // $mail->SMTPDebug = 2; 

        //Recipients
        $mail->setFrom($email, $name); // Sender from the contact form
        $mail->addAddress('adalteran@gmail.com'); // Your desired recipient email for form submissions
        // $mail->addReplyTo($email, $name); // Optional: if you want to reply directly to the sender

        // Content
        $mail->isHTML(false); // Set to true if you want to send HTML email
        $mail->Subject = 'New Contact Form Submission from Agencia Working Website: ' . $name;
        $mail->Body    = "Name: $name\nEmail: $email\nMessage:\n$message_content";
        // $mail->AltBody = 'This is the plain text version of the email.'; // Optional: for non-HTML mail clients

        $mail->send();
        $response['success'] = true;
        $response['message'] = 'Message has been sent successfully!';
    } catch (Exception $e) {
        $response['message'] = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        // For debugging, you might log $e->getMessage() to a file on your server
        error_log("PHPMailer Error: " . $e->getMessage() . " from " . $email);
    }
    echo json_encode($response);
    exit();
} else {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit();
}
?>