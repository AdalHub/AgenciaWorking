<?php
// api/applications.php
require_once __DIR__.'/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { exit; }

if ($method === 'POST') {
  // Public endpoint: candidate submits application + PDF
  $jobId = (int)($_POST['job_id'] ?? 0);
  $fullName = trim($_POST['full_name'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $phone = trim($_POST['phone'] ?? '');
  $why = trim($_POST['why_apply'] ?? '');

  $resumePath = null;
  if (!empty($_FILES['resume']['name'])) {
    $ext = strtolower(pathinfo($_FILES['resume']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['pdf'])) {
      http_response_code(400);
      header('Content-Type: application/json');
      echo json_encode(['error' => 'Only PDF resumes are accepted.']);
      exit;
    }
    $safe = 'resume_'.time().'_'.bin2hex(random_bytes(4)).'.pdf';
    $dest = __DIR__.'/../uploads/applications/'.$safe;
    if (!move_uploaded_file($_FILES['resume']['tmp_name'], $dest)) {
      http_response_code(500);
      header('Content-Type: application/json');
      echo json_encode(['error' => 'Failed to store resume.']);
      exit;
    }
    $resumePath = '/uploads/applications/'.$safe;
  }

  $stmt = $pdo->prepare("INSERT INTO applications (job_id, full_name, email, phone, why_apply, resume_path)
                         VALUES (?, ?, ?, ?, ?, ?)");
  $stmt->execute([$jobId, $fullName, $email, $phone, $why, $resumePath]);

  header('Content-Type: application/json');
  echo json_encode(['ok'=>true]);
  exit;
}

if ($method === 'GET') {
  // Admin list applications for a job
  require_login();
  header('Content-Type: application/json');
  $jobId = (int)($_GET['job_id'] ?? 0);
  $stmt = $pdo->prepare("SELECT id, full_name, email, phone, why_apply, resume_path, created_at
                         FROM applications WHERE job_id = ? ORDER BY created_at DESC");
  $stmt->execute([$jobId]);
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
  exit;
}

http_response_code(405);
header('Content-Type: application/json');
echo json_encode(['error'=>'Method not allowed']);
