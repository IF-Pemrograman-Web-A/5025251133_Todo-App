<aside class="sidebar" aria-labelledby="sidebarHeading">
  <h2 id="sidebarHeading" class="sr-only">Menu Navigasi</h2>

  <div class="brand">
    ( ͡° ͜ʖ ͡°) Todo
    <small>Organizational Edition</small>
  </div>

  <nav aria-label="Menu Utama">
    <ul class="menu-list">
      <li>
        <a class="menu-link <?= $view === 'personal' ? 'active' : '' ?>"
           href="index.php?view=personal"
           <?= $view === 'personal' ? 'aria-current="page"' : '' ?>>
          Personal
        </a>
      </li>
      <li>
        <a class="menu-link <?= $view === 'shared' ? 'active' : '' ?>"
           href="index.php?view=shared"
           <?= $view === 'shared' ? 'aria-current="page"' : '' ?>>
          Shared
        </a>
      </li>
    </ul>
  </nav>

  <form method="post" action="index.php" class="user-switcher">
    <input type="hidden" name="action" value="switch_user">
    <input type="hidden" name="view" value="<?= e($view) ?>">
    <label for="userSelect">Pengguna Aktif</label>
    <select id="userSelect" name="user_id" onchange="this.form.submit()">
      <?php foreach ($users as $u): ?>
        <option value="<?= (int) $u['id'] ?>"
          <?= (int) $u['id'] === $currentUserId ? 'selected' : '' ?>>
          <?= e($u['display_name']) ?>
        </option>
      <?php endforeach; ?>
    </select>
    <noscript><button type="submit" class="btn-secondary">Ganti Pengguna</button></noscript>
  </form>

  <div class="sidebar-user">
    Masuk sebagai<br>
    <strong><?= e($currentUser['display_name'] ?? 'Tidak diketahui') ?></strong>
  </div>
</aside>