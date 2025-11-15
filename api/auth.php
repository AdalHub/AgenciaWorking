<?php
// api/auth.php
require_once __DIR__.'/config.php';
require_once __DIR__.'/lib/PHPMailer/loader.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

json();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'OPTIONS') { exit; }

if ($method === 'POST' && $action === 'login') {
  $payload = json_decode(file_get_contents('php://input'), true);
  $u = trim($payload['username'] ?? '');
  $p = $payload['password'] ?? '';

  $stmt = $pdo->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ?");
  $stmt->execute([$u]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($row && password_verify($p, $row['password_hash'])) {
    $_SESSION['admin_user'] = ['id'=>$row['id'],'username'=>$row['username']];
    echo json_encode(['ok' => true, 'user' => $_SESSION['admin_user']]);
  } else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
  }
  exit;
}

if ($method === 'POST' && $action === 'logout') {
  session_destroy();
  echo json_encode(['ok' => true]);
  exit;
}

if ($method === 'GET' && $action === 'me') {
  echo json_encode(['user' => $_SESSION['admin_user'] ?? null]);
  exit;
}

// Password reset: request reset code
if ($method === 'POST' && $action === 'request-reset') {
  $payload = json_decode(file_get_contents('php://input'), true);
  $email = trim($payload['email'] ?? '');
  
  if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
  }
  
  // Check if user exists
  $stmt = $pdo->prepare("SELECT id, username FROM admin_users WHERE username = ?");
  $stmt->execute([$email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  
  // Always return success to prevent email enumeration
  if (!$user) {
    // Still return success, but don't send email
    echo json_encode(['ok' => true, 'message' => 'If the email exists, a reset code has been sent.']);
    exit;
  }
  
  // Invalidate any existing unused codes for this user
  $stmt = $pdo->prepare("UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0");
  $stmt->execute([$user['id']]);
  
  // Generate a secure 6-digit code
  $resetCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
  
  // Code expires in 15 minutes
  $expiresAt = date('Y-m-d H:i:s', time() + (15 * 60));
  
  // Store the reset code
  $stmt = $pdo->prepare("INSERT INTO password_reset_codes (user_id, reset_code, expires_at) VALUES (?, ?, ?)");
  $stmt->execute([$user['id'], $resetCode, $expiresAt]);
  
  // Send email with reset code
  $emailSent = false;
  try {
    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host       = $cfg['SMTP_HOST'] ?? 'smtp.ionos.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['SMTP_USER'] ?? '';
    $mail->Password   = $cfg['SMTP_PASS'] ?? '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)($cfg['SMTP_PORT'] ?? 587);
    
    if (empty($cfg['MAIL_FROM']) || empty($cfg['SMTP_USER']) || empty($cfg['SMTP_PASS'])) {
      throw new Exception('SMTP credentials not configured');
    }
    
    $mail->setFrom($cfg['MAIL_FROM'], $cfg['MAIL_FROM_NAME'] ?? 'Agencia Working');
    $mail->addAddress($email, $user['username']);
    
    $mail->isHTML(true);
    $mail->Subject = 'Password Reset Code - Agencia Working';
    $mail->Body = nl2br(
      "Hello,\n\n".
      "You requested a password reset for your Agencia Working admin account.\n\n".
      "Your reset code is: <strong>{$resetCode}</strong>\n\n".
      "This code will expire in 15 minutes.\n\n".
      "If you did not request this reset, please ignore this email.\n\n".
      "Best regards,\nAgencia Working"
    );
    $mail->AltBody =
      "Hello,\n\n".
      "You requested a password reset for your Agencia Working admin account.\n\n".
      "Your reset code is: {$resetCode}\n\n".
      "This code will expire in 15 minutes.\n\n".
      "If you did not request this reset, please ignore this email.\n\n".
      "Best regards,\nAgencia Working";
    
    $mail->send();
    $emailSent = true;
  } catch (Exception $e) {
    error_log('Password reset email error: ' . $e->getMessage());
    // Don't expose email sending failure to user
  }
  
  echo json_encode(['ok' => true, 'message' => 'If the email exists, a reset code has been sent.']);
  exit;
}

// Password reset: verify code
if ($method === 'POST' && $action === 'verify-code') {
  $payload = json_decode(file_get_contents('php://input'), true);
  $email = trim($payload['email'] ?? '');
  $code = trim($payload['code'] ?? '');
  
  if (empty($email) || empty($code)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and code are required']);
    exit;
  }
  
  // Get user
  $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
  $stmt->execute([$email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid email or code']);
    exit;
  }
  
  // Check for valid, unused, non-expired code
  $stmt = $pdo->prepare("
    SELECT id FROM password_reset_codes 
    WHERE user_id = ? AND reset_code = ? AND used = 0 AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  ");
  $stmt->execute([$user['id'], $code]);
  $resetRecord = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$resetRecord) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired code']);
    exit;
  }
  
  echo json_encode(['ok' => true, 'message' => 'Code verified']);
  exit;
}

// Password reset: reset password with code
if ($method === 'POST' && $action === 'reset-password') {
  $payload = json_decode(file_get_contents('php://input'), true);
  $email = trim($payload['email'] ?? '');
  $code = trim($payload['code'] ?? '');
  $newPassword = $payload['password'] ?? '';
  
  if (empty($email) || empty($code) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email, code, and password are required']);
    exit;
  }
  
  // Validate password strength
  if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit;
  }
  
  // Get user
  $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
  $stmt->execute([$email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Invalid email or code']);
    exit;
  }
  
  // Verify code is valid and not expired
  $stmt = $pdo->prepare("
    SELECT id FROM password_reset_codes 
    WHERE user_id = ? AND reset_code = ? AND used = 0 AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  ");
  $stmt->execute([$user['id'], $code]);
  $resetRecord = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$resetRecord) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired code']);
    exit;
  }
  
  // Update password
  $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
  $stmt->execute([$newHash, $user['id']]);
  
  // Mark code as used
  $stmt = $pdo->prepare("UPDATE password_reset_codes SET used = 1 WHERE id = ?");
  $stmt->execute([$resetRecord['id']]);
  
  // Invalidate all other unused codes for this user
  $stmt = $pdo->prepare("UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0");
  $stmt->execute([$user['id']]);
  
  echo json_encode(['ok' => true, 'message' => 'Password reset successfully']);
  exit;
}

http_response_code(404);
echo json_encode(['error'=>'Not found']);
