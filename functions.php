<?php

function getUsers(PDO $pdo): array
{
    return $pdo->query("SELECT id, username, display_name FROM users ORDER BY id")
               ->fetchAll();
}

function getCurrentUser(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare("SELECT id, username, display_name FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/* ============ READ ============ */

function getTodos(PDO $pdo, int $userId, string $view): array
{
    $order = "ORDER BY t.is_completed ASC, t.created_at DESC";

    if ($view === 'shared') {
        $sql = "SELECT t.*, u.display_name AS owner_name
                FROM todos t
                JOIN users u ON u.id = t.user_id
                WHERE t.is_shared = 1
                $order";
        return $pdo->query($sql)->fetchAll();
    }

    $sql = "SELECT t.*, u.display_name AS owner_name
            FROM todos t
            JOIN users u ON u.id = t.user_id
            WHERE t.user_id = ?
            $order";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function getTodoById(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare(
        "SELECT t.*, u.display_name AS owner_name
         FROM todos t JOIN users u ON u.id = t.user_id
         WHERE t.id = ?"
    );
    $stmt->execute([$id]);
    $todo = $stmt->fetch();
    return $todo ?: null;
}

function createTodo(
    PDO $pdo,
    int $userId,
    string $title,
    string $desc,
    ?string $notify,
    ?string $imagePath,
    int $isShared
): int {
    $stmt = $pdo->prepare(
        "INSERT INTO todos (user_id, title, description, notify_time, image_path, is_shared)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$userId, $title, $desc, $notify, $imagePath, $isShared]);
    return (int) $pdo->lastInsertId();
}

function updateTodo(PDO $pdo, int $id, array $data): void
{
    $stmt = $pdo->prepare(
        "UPDATE todos
         SET title = ?, description = ?, notify_time = ?, is_completed = ?, is_shared = ?
         WHERE id = ?"
    );
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['notify_time'],
        $data['is_completed'],
        $data['is_shared'],
        $id,
    ]);
}

function toggleTodo(PDO $pdo, int $id): void
{
    $pdo->prepare("UPDATE todos SET is_completed = 1 - is_completed WHERE id = ?")
        ->execute([$id]);
}

function deleteTodoWithImage(PDO $pdo, int $id): void
{
    $todo = getTodoById($pdo, $id);
    if ($todo && !empty($todo['image_path'])) {
        $file = __DIR__ . '/' . $todo['image_path'];
        if (is_file($file)) {
            @unlink($file);
        }
    }
    $pdo->prepare("DELETE FROM todos WHERE id = ?")->execute([$id]);
}

function handleImageUpload(): ?string
{
    if (!empty($_FILES['image_file']['tmp_name'])
        && is_uploaded_file($_FILES['image_file']['tmp_name'])) {

        $tmp  = $_FILES['image_file']['tmp_name'];
        $size = (int) ($_FILES['image_file']['size'] ?? 0);

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
        ];

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($tmp);

        if (isset($allowed[$mime]) && $size > 0 && $size <= MAX_UPLOAD_BYTES) {
            $filename = 'todo_' . uniqid('', true) . '.' . $allowed[$mime];
            if (move_uploaded_file($tmp, UPLOAD_DIR . $filename)) {
                return UPLOAD_URL . $filename;
            }
        }
    }

    $dataUrl = $_POST['image_data'] ?? '';
    if (is_string($dataUrl) && $dataUrl !== ''
        && preg_match('#^data:image/(jpeg|png|webp);base64,#', $dataUrl, $m)) {

        $payload = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $binary  = base64_decode($payload, true);

        if ($binary !== false && strlen($binary) > 0 && strlen($binary) <= MAX_UPLOAD_BYTES) {
            $filename = 'todo_' . uniqid('', true) . '.' . $m[1];
            if (file_put_contents(UPLOAD_DIR . $filename, $binary) !== false) {
                return UPLOAD_URL . $filename;
            }
        }
    }

    return null;
}

function normalizeDateTime(?string $value): ?string
{
    if ($value === null || trim($value) === '') {
        return null;
    }
    $value = str_replace('T', ' ', $value);
    $ts = strtotime($value);
    return $ts === false ? null : date('Y-m-d H:i:s', $ts);
}

function formatNotify(?string $datetime): string
{
    if (!$datetime) {
        return 'Tidak diatur';
    }
    $ts = strtotime($datetime);
    if (!$ts) {
        return 'Tidak diatur';
    }
    $bulan = [1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
              'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return date('j', $ts) . ' ' . $bulan[(int) date('n', $ts)] . ' ' . date('Y', $ts)
        . ', ' . date('H.i', $ts);
}

function flash(string $message, string $type = 'success'): void
{
    $_SESSION['flash'] = ['message' => $message, 'type' => $type];
}

function getFlash(): ?array
{
    if (empty($_SESSION['flash'])) {
        return null;
    }
    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $flash;
}