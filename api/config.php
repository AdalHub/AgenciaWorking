<?php
// /api/config.php
session_start();

/**
 * Safe config loader:
 * - Loads defaults (harmless to commit)
 * - Merges /api/config.local.php if present (real secrets, not committed)
 * - Optionally reads from environment variables
 */

$cfg = [
  // DB
  'DB_HOST' => getenv('DB_HOST') ?: '',
  'DB_NAME' => getenv('DB_NAME') ?: '',
  'DB_USER' => getenv('DB_USER') ?: '',
  'DB_PASS' => getenv('DB_PASS') ?: '',

  // SMTP defaults (can be overridden in config.local.php)
  'SMTP_HOST' => 'smtp.ionos.com',
  'SMTP_PORT' => 587,
  'SMTP_USER' => '',
  'SMTP_PASS' => '',
  'MAIL_FROM' => '',
  'MAIL_FROM_NAME' => 'Agencia Working',
  'MAIL_NOTIFY_TO' => '',

  // PayPal defaults (can be overridden in config.local.php)
  'PAYPAL_CLIENT_ID' => '',
  'PAYPAL_CLIENT_SECRET' => '',
  'PAYPAL_MODE' => 'sandbox', // 'sandbox' or 'live'
  'BASE_URL' => getenv('BASE_URL') ?: 'https://agenciaworking.com',
];

// Merge server-only secrets if present
if (file_exists(__DIR__ . '/config.local.php')) {
  require __DIR__ . '/config.local.php';
  if (!empty($LOCAL_CFG) && is_array($LOCAL_CFG)) {
    $cfg = array_merge($cfg, $LOCAL_CFG);
  }
}

// Connect PDO using merged config
try {
  $pdo = new PDO(
    "mysql:host={$cfg['DB_HOST']};dbname={$cfg['DB_NAME']};charset=utf8mb4",
    $cfg['DB_USER'],
    $cfg['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
} catch (Exception $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}

// Helpers
function json() { header('Content-Type: application/json; charset=utf-8'); }
function require_login() {
  if (empty($_SESSION['admin_user'])) {
    http_response_code(401); json(); echo json_encode(['error' => 'Unauthorized']); exit;
  }
}
function slugify($str) {
  $s = preg_replace('~[^\pL\d]+~u', '-', $str);
  $s = @iconv('utf-8', 'us-ascii//TRANSLIT', $s);
  $s = preg_replace('~[^-\w]+~', '', $s);
  $s = trim($s, '-'); $s = preg_replace('~-+~', '-', $s);
  $s = strtolower($s);
  return $s ?: 'job-'.bin2hex(random_bytes(4));
}
