<?php

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    return;
}

$action   = $_POST['action'] ?? '';
$view     = in_array($_POST['view'] ?? '', ['personal', 'shared'], true)
            ? $_POST['view'] : 'personal';
$redirect = 'index.php?view=' . $view;

switch ($action) {

    case 'switch_user':
        $uid = (int) ($_POST['user_id'] ?? 0);
        if ($uid > 0) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$uid]);
            if ($stmt->fetch()) {
                $_SESSION['user_id'] = $uid;
                flash('Pengguna aktif berhasil diganti.');
            }
        }
        header('Location: index.php?view=' . $view);
        exit;

    case 'add':
        $title  = trim($_POST['title'] ?? '');
        $desc   = trim($_POST['description'] ?? '');
        $notify = normalizeDateTime($_POST['notify_time'] ?? null);
        $shared = isset($_POST['is_shared']) ? 1 : 0;

        if ($title === '') {
            flash('Judul aktivitas wajib diisi.', 'error');
            break;
        }

        $imagePath = handleImageUpload(); // file handling
        $newId = createTodo($pdo, $currentUserId, $title, $desc, $notify, $imagePath, $shared);

        flash('Aktivitas baru berhasil ditambahkan.');
        $redirect .= '&id=' . $newId;
        break;

    case 'update':
        $id   = (int) ($_POST['id'] ?? 0);
        $todo = $id > 0 ? getTodoById($pdo, $id) : null;

        if (!$todo) {
            flash('Aktivitas tidak ditemukan.', 'error');
            break;
        }
        if ((int) $todo['user_id'] !== $currentUserId) {
            flash('Anda tidak berhak mengubah aktivitas ini.', 'error');
            $redirect .= '&id=' . $id;
            break;
        }

        $title = trim($_POST['title'] ?? '');
        if ($title === '') {
            flash('Judul tidak boleh kosong.', 'error');
            $redirect .= '&id=' . $id . '&edit=1';
            break;
        }

        updateTodo($pdo, $id, [
            'title'        => $title,
            'description'  => trim($_POST['description'] ?? ''),
            'notify_time'  => normalizeDateTime($_POST['notify_time'] ?? null),
            'is_completed' => ($_POST['is_completed'] ?? '0') === '1' ? 1 : 0,
            'is_shared'    => isset($_POST['is_shared']) ? 1 : 0,
        ]);

        flash('Aktivitas berhasil diperbarui.');
        $redirect .= '&id=' . $id;
        break;

    case 'delete':
        $id   = (int) ($_POST['id'] ?? 0);
        $todo = $id > 0 ? getTodoById($pdo, $id) : null;

        if (!$todo) {
            flash('Aktivitas tidak ditemukan.', 'error');
            break;
        }
        if ((int) $todo['user_id'] !== $currentUserId) {
            flash('Anda tidak berhak menghapus aktivitas ini.', 'error');
            break;
        }

        deleteTodoWithImage($pdo, $id); // hapus juga file gambarnya
        flash('Aktivitas berhasil dihapus.');
        break;

    case 'toggle':
        $id   = (int) ($_POST['id'] ?? 0);
        $todo = $id > 0 ? getTodoById($pdo, $id) : null;

        if ($todo) {
            $isOwner = (int) $todo['user_id'] === $currentUserId;
            $isShared = (int) $todo['is_shared'] === 1;

            if ($isOwner || $isShared) {
                toggleTodo($pdo, $id);
                flash('Status aktivitas diperbarui.');
            } else {
                flash('Anda tidak berhak mengubah aktivitas ini.', 'error');
            }
            $redirect .= '&id=' . $id;
        }
        break;

    default:
        break;
}

header('Location: ' . $redirect);
exit;