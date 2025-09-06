<?php
// api/auth.php
require_once __DIR__.'/config.php';
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

http_response_code(404);
echo json_encode(['error'=>'Not found']);
