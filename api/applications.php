<?php
// /api/applications.php
require_once __DIR__.'/config.php';
require_once __DIR__.'/lib/PHPMailer/loader.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { exit; }
header('Content-Type: application/json; charset=utf-8');

if ($method === 'POST') {
  $jobId    = (int)($_POST['job_id'] ?? 0);
  $fullName = trim($_POST['full_name'] ?? '');
  $email    = trim($_POST['email'] ?? '');
  $phone    = trim($_POST['phone'] ?? '');
  $why      = trim($_POST['why_apply'] ?? '');

  if (!$jobId || !$fullName || !$email || !$phone || !$why) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
  }

  // Get job title for the email
  $stmt = $pdo->prepare("SELECT title FROM jobs WHERE id = ?");
  $stmt->execute([$jobId]);
  $jobTitle = $stmt->fetchColumn() ?: 'your application';

  // Handle resume upload
  $resumePath = null;
  if (!empty($_FILES['resume']['name'])) {
    $ext = strtolower(pathinfo($_FILES['resume']['name'], PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
      http_response_code(400);
      echo json_encode(['error' => 'Only PDF resumes are accepted.']);
      exit;
    }
    $dir = __DIR__ . '/../uploads/applications';
    if (!is_dir($dir) && !mkdir($dir, 0775, true)) {
      http_response_code(500);
      echo json_encode(['error' => 'Failed to create upload directory.']);
      exit;
    }
    if (!is_writable($dir)) {
      http_response_code(500);
      echo json_encode(['error' => 'Upload directory is not writable.']);
      exit;
    }
    $safe = 'resume_'.time().'_'.bin2hex(random_bytes(4)).'.pdf';
    $dest = $dir . '/' . $safe;
    if (!move_uploaded_file($_FILES['resume']['tmp_name'], $dest)) {
      http_response_code(500);
      echo json_encode(['error' => 'Failed to store resume.']);
      exit;
    }
    $resumePath = '/uploads/applications/' . $safe;
  }

  // Save the application to DB
  $stmt = $pdo->prepare("INSERT INTO applications (job_id, full_name, email, phone, why_apply, resume_path)
                         VALUES (?, ?, ?, ?, ?, ?)");
  $stmt->execute([$jobId, $fullName, $email, $phone, $why, $resumePath]);

  // Send acknowledgement email to applicant (+ BCC to you)
  $emailOk = false;
  try {
    $mail = new PHPMailer(true);
    // $mail->SMTPDebug = 2; // uncomment to log SMTP debug to PHP error log

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
    $mail->addAddress($email, $fullName);  // to the applicant
    if (!empty($cfg['MAIL_NOTIFY_TO']) && $cfg['MAIL_NOTIFY_TO'] !== $email) {
      $mail->addAddress($cfg['MAIL_NOTIFY_TO']); // visible copy to you
    }

    $mail->addReplyTo($cfg['MAIL_NOTIFY_TO'] ?: $cfg['MAIL_FROM']);

    $mail->isHTML(true);
    $mail->Subject = "We received your application – {$jobTitle}";
    $mail->Body = nl2br(
      "Hi {$fullName},\n\n".
      "Thanks for applying for **{$jobTitle}** at Agencia Working.\n".
      "We’ve received your application and will review it shortly. ".
      "If your profile matches, we’ll reach out about next steps.\n\n".
      "Best regards,\nAgencia Working Recruiting Team\n".
      "agenciaworking.com"
    );
    $mail->AltBody =
      "Hi {$fullName},\n\n".
      "Thanks for applying for {$jobTitle} at Agencia Working.\n".
      "We’ve received your application and will review it shortly. ".
      "If your profile matches, we’ll reach out about next steps.\n\n".
      "Best regards,\nAgencia Working Recruiting Team\n".
      "agenciaworking.com";

    $mail->send();
    $emailOk = true;
  } catch (Exception $e) {
    // Don’t fail the application on email problems; just log it
    error_log('Mailer error: ' . $e->getMessage());
  }

  echo json_encode(['ok' => true, 'emailSent' => $emailOk]);
  exit;
}

if ($method === 'GET') {
  require_login();
  $jobId = (int)($_GET['job_id'] ?? 0);
  $stmt = $pdo->prepare("SELECT id, full_name, email, phone, why_apply, resume_path, created_at
                         FROM applications WHERE job_id = ? ORDER BY created_at DESC");
  $stmt->execute([$jobId]);
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
