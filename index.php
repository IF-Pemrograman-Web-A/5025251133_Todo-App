<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/actions.php';

$view = $_GET['view'] ?? 'personal';
if (!in_array($view, ['personal', 'shared'], true)) {
    $view = 'personal';
}

$users       = getUsers($pdo);
$currentUser = getCurrentUser($pdo, $currentUserId);

if (!$currentUser && !empty($users)) {
    $currentUserId       = (int) $users[0]['id'];
    $_SESSION['user_id'] = $currentUserId;
    $currentUser         = $users[0];
}

$todos = getTodos($pdo, $currentUserId, $view);

$selectedId = isset($_GET['id']) ? (int) $_GET['id'] : null;
$todoIds    = array_map(static fn($t) => (int) $t['id'], $todos);

if ($selectedId === null || !in_array($selectedId, $todoIds, true)) {
    $selectedId = !empty($todoIds) ? $todoIds[0] : null;
}

$selectedTodo = null;
foreach ($todos as $t) {
    if ((int) $t['id'] === $selectedId) {
        $selectedTodo = $t;
        break;
    }
}

$editMode = isset($_GET['edit'])
    && $selectedTodo
    && (int) $selectedTodo['user_id'] === $currentUserId;

$todosForJs = array_map(static function ($t) {
    return [
        'id'         => (int) $t['id'],
        'title'      => $t['title'],
        'desc'       => $t['description'] ?? '',
        'notifyTime' => $t['notify_time']
            ? date('c', strtotime($t['notify_time']))
            : '',
    ];
}, $todos);
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To Do List Organizational Edition</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>

  <header role="banner">
    <div class="header-content">
      <h1 id="appTitle">( ͡° ͜ʖ ͡°) - To Do List - ( ͡° ͜ʖ ͡°)</h1>
      <button
        id="themeToggleBtn"
        type="button"
        class="btn-theme"
        aria-pressed="false"
        aria-label="Beralih ke Mode Gelap"
      >
        To Dark Mode
      </button>
    </div>
  </header>

  <div class="app-shell">
    <?php require __DIR__ . '/menubar.php'; ?>

    <main class="container" role="main">
      <?php require __DIR__ . '/content.php'; ?>
    </main>
  </div>

  <footer role="contentinfo">
    <p>&copy; Garda Putra Brahmantya | 5025251133 Organizational Todo App (PHP + MySQL)</p>
  </footer>

  <div id="srAnnouncement" class="sr-only" aria-live="polite" aria-atomic="true"></div>

  <script>
    window.__TODOS__ = <?= json_encode(
        $todosForJs,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
    ) ?>;
  </script>
  <script src="assets/script.js"></script>
</body>
</html>