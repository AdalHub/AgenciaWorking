<?php
// api/jobs.php
require_once __DIR__.'/config.php';
json();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { exit; }

/**
 * Public list (for Careers page):
 * GET /api/jobs.php?public=1
 * Admin list (requires login):
 * GET /api/jobs.php
 */
if ($method === 'GET') {
  if (isset($_GET['public'])) {
    $q = $pdo->query("SELECT id, title, slug, team, employment_type AS employmentType, location, description, posted FROM jobs ORDER BY posted DESC, id DESC");
    echo json_encode($q->fetchAll(PDO::FETCH_ASSOC));
  } else {
    require_login();
    $q = $pdo->query("SELECT id, title, slug, team, employment_type AS employmentType, location, description, posted FROM jobs ORDER BY created_at DESC");
    echo json_encode($q->fetchAll(PDO::FETCH_ASSOC));
  }
  exit;
}

/**
 * Create job (admin)
 * POST JSON: {title, description, team, employmentType, location, posted}
 */
if ($method === 'POST') {
  require_login();
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $title = trim($data['title'] ?? '');
  $description = trim($data['description'] ?? '');
  $team = trim($data['team'] ?? '');
  $employment = trim($data['employmentType'] ?? '');
  $location = trim($data['location'] ?? '');
  $posted = trim($data['posted'] ?? date('Y-m-d'));
  $slug = slugify($title);

  $stmt = $pdo->prepare("INSERT INTO jobs (title, slug, team, employment_type, location, description, posted)
                         VALUES (?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([$title, $slug, $team, $employment, $location, $description, $posted]);
  echo json_encode(['ok'=>true, 'id'=>$pdo->lastInsertId(), 'slug'=>$slug]);
  exit;
}

/**
 * Update job (admin)
 * PUT /api/jobs.php?id=123  with same JSON as POST
 */
if ($method === 'PUT') {
  require_login();
  $id = (int)($_GET['id'] ?? 0);
  parse_str(file_get_contents('php://input'), $putVars);
  $data = json_decode($putVars['json'] ?? '[]', true);

  $title = trim($data['title'] ?? '');
  $description = trim($data['description'] ?? '');
  $team = trim($data['team'] ?? '');
  $employment = trim($data['employmentType'] ?? '');
  $location = trim($data['location'] ?? '');
  $posted = trim($data['posted'] ?? date('Y-m-d'));
  $slug = slugify($title);

  $stmt = $pdo->prepare("UPDATE jobs SET title=?, slug=?, team=?, employment_type=?, location=?, description=?, posted=? WHERE id=?");
  $stmt->execute([$title, $slug, $team, $employment, $location, $description, $posted, $id]);
  echo json_encode(['ok'=>true]);
  exit;
}

/**
 * Delete job (admin)
 * DELETE /api/jobs.php?id=123
 */
if ($method === 'DELETE') {
  require_login();
  $id = (int)($_GET['id'] ?? 0);
  $pdo->prepare("DELETE FROM jobs WHERE id=?")->execute([$id]);
  echo json_encode(['ok'=>true]);
  exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
