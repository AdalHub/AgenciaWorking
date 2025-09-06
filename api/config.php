<?php
// api/config.php
session_start();

$DB_HOST = '';
$DB_NAME = '';
$DB_USER = '';
$DB_PASS = '';

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}

function json() {
  header('Content-Type: application/json; charset=utf-8');
}

function require_login() {
  if (empty($_SESSION['admin_user'])) {
    http_response_code(401);
    json();
    echo json_encode(['error' => 'Unauthorized']);
    exit;
  }
}

function slugify($str) {
  $s = preg_replace('~[^\pL\d]+~u', '-', $str);
  $s = iconv('utf-8', 'us-ascii//TRANSLIT', $s);
  $s = preg_replace('~[^-\w]+~', '', $s);
  $s = trim($s, '-');
  $s = preg_replace('~-+~', '-', $s);
  $s = strtolower($s);
  return $s ?: 'job-'.bin2hex(random_bytes(4));
}
