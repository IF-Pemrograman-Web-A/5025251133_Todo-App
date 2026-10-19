<section class="panelLeft" aria-labelledby="headingList">
  <h2 id="headingList">
    <?= $view === 'shared' ? 'Aktivitas Bersama (Shared)' : 'Aktivitas Saya (Personal)' ?>
  </h2>

  <?php $flash = getFlash(); if ($flash): ?>
    <div class="flash <?= e($flash['type']) ?>" role="alert"><?= e($flash['message']) ?></div>
  <?php endif; ?>

  <form id="todoForm" method="post" action="index.php"
        enctype="multipart/form-data" class="form-todo"
        aria-label="Form Tambah Aktivitas Baru">

    <input type="hidden" name="action" value="add">
    <input type="hidden" name="view" value="<?= e($view) ?>">
    <input type="hidden" name="image_data" id="imageData" value="">

    <div class="form-group">
      <label for="todoInputTitle">Nama Aktivitas <span class="required">*</span></label>
      <input type="text" id="todoInputTitle" name="title"
             placeholder="Nama aktivitas..." required aria-required="true">
    </div>

    <div class="form-group">
      <label for="todoInputDesc">Catatan Detail</label>
      <textarea id="todoInputDesc" name="description"
                placeholder="Tulis catatan atau detail aktivitas di sini..." rows="3"></textarea>
    </div>

    <div class="form-group">
      <label for="todoInputNotify">Waktu Pengingat Notifikasi</label>
      <input type="datetime-local" id="todoInputNotify" name="notify_time"
             aria-describedby="notifyHelp">
      <small id="notifyHelp" class="help-text">
        Pilih waktu untuk menerima notifikasi pengingat.
      </small>
    </div>

    <div class="form-group checkbox-group">
      <input type="checkbox" id="todoInputShared" name="is_shared" value="1"
             <?= $view === 'shared' ? 'checked' : '' ?>>
      <label for="todoInputShared">Bagikan ke menu Shared</label>
    </div>

    <fieldset class="camera-section">
      <legend>Lampiran Foto Aktivitas</legend>

      <div class="camera-preview-wrapper">
        <video id="cameraVideo" autoplay playsinline hidden
               aria-label="Pratinjau Kamera Langsung"></video>
        <canvas id="cameraCanvas" hidden></canvas>
        <img id="capturedImagePreview" alt="Pratinjau Foto Terlampir" hidden>
      </div>

      <div class="camera-controls">
        <button type="button" id="btnStartCamera" class="btn-secondary">Buka Kamera</button>
        <button type="button" id="btnCapture" class="btn-action btn-edit" hidden>Ambil Foto</button>
        <button type="button" id="btnClearImage" class="btn-action btn-delete" hidden>Hapus Foto</button>
      </div>

      <div class="form-group">
        <label for="todoInputFile">Atau unggah file gambar (maks 3 MB)</label>
        <input type="file" id="todoInputFile" name="image_file"
               accept="image/jpeg,image/png,image/webp">
      </div>
    </fieldset>

    <button type="submit" class="btn-submit">+ Add Aktivitas</button>
  </form>

  <ul id="todoList" class="list-aktivitas"
      aria-label="Daftar Tugas Aktivitas" role="list">

    <?php if (count($todos) === 0): ?>
      <li class="item-empty">Belum ada aktivitas. Silakan tambah aktivitas baru.</li>
    <?php else: ?>
      <?php foreach ($todos as $t):
        $tid        = (int) $t['id'];
        $isSelected = $tid === $selectedId;
        $isOwner    = (int) $t['user_id'] === $currentUserId;
        $done       = (int) $t['is_completed'] === 1;
      ?>
        <li class="item <?= $isSelected ? 'selected' : '' ?> <?= $done ? 'completed' : '' ?>">
          <div class="item-left">

            <form method="post" action="index.php" class="toggle-form">
              <input type="hidden" name="action" value="toggle">
              <input type="hidden" name="id" value="<?= $tid ?>">
              <input type="hidden" name="view" value="<?= e($view) ?>">
              <input type="checkbox" class="toggle-checkbox" id="chk-<?= $tid ?>"
                     <?= $done ? 'checked' : '' ?>
                     aria-label="Tandai &quot;<?= e($t['title']) ?>&quot; sebagai <?= $done ? 'belum selesai' : 'selesai' ?>">
              <noscript>
                <button type="submit" class="btn-action btn-edit">Tandai</button>
              </noscript>
            </form>

            <a class="item-title"
               href="index.php?view=<?= e($view) ?>&id=<?= $tid ?>"
               <?= $isSelected ? 'aria-current="true"' : '' ?>>
              <?= e($t['title']) ?>
            </a>

            <?php if ($view === 'shared' && !$isOwner): ?>
              <span class="badge-owner">oleh <?= e($t['owner_name']) ?></span>
            <?php endif; ?>
          </div>

          <div class="item-actions">
            <?php if ($isOwner): ?>
              <a class="btn-action btn-edit"
                 href="index.php?view=<?= e($view) ?>&id=<?= $tid ?>&edit=1"
                 aria-label="Edit aktivitas <?= e($t['title']) ?>">Edit</a>

              <form method="post" action="index.php"
                    onsubmit="return confirm('Hapus aktivitas ini?');">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?= $tid ?>">
                <input type="hidden" name="view" value="<?= e($view) ?>">
                <button type="submit" class="btn-action btn-delete"
                        aria-label="Hapus aktivitas <?= e($t['title']) ?>">Hapus</button>
              </form>
            <?php endif; ?>
          </div>
        </li>
      <?php endforeach; ?>
    <?php endif; ?>
  </ul>
</section>

<aside class="panelRight" aria-labelledby="headingDetail">
  <h2 id="headingDetail">Detail Aktivitas</h2>

  <?php if (!$selectedTodo): ?>

    <div id="viewMode" class="isi-detail" aria-live="polite">
      <p>Tidak ada aktivitas yang dipilih.</p>
    </div>

  <?php elseif ($editMode): ?>

    <form id="editForm" method="post" action="index.php"
          class="form-edit" aria-label="Form Edit Aktivitas">
      <input type="hidden" name="action" value="update">
      <input type="hidden" name="id" value="<?= (int) $selectedTodo['id'] ?>">
      <input type="hidden" name="view" value="<?= e($view) ?>">

      <div class="edit-group">
        <label for="editTitle"><strong>Judul Aktivitas:</strong></label>
        <input type="text" id="editTitle" name="title"
               value="<?= e($selectedTodo['title']) ?>" required aria-required="true">
      </div>

      <div class="edit-group">
        <label for="editStatus"><strong>Status Penyelesaian:</strong></label>
        <select id="editStatus" name="is_completed">
          <option value="0" <?= (int) $selectedTodo['is_completed'] === 0 ? 'selected' : '' ?>>In Progress</option>
          <option value="1" <?= (int) $selectedTodo['is_completed'] === 1 ? 'selected' : '' ?>>Completed</option>
        </select>
      </div>

      <div class="edit-group">
        <label for="editNotify"><strong>Waktu Pengingat:</strong></label>
        <input type="datetime-local" id="editNotify" name="notify_time"
               value="<?= $selectedTodo['notify_time']
                   ? e(date('Y-m-d\TH:i', strtotime($selectedTodo['notify_time'])))
                   : '' ?>">
      </div>

      <div class="edit-group">
        <label for="editDesc"><strong>Catatan:</strong></label>
        <textarea id="editDesc" name="description" rows="4"><?= e($selectedTodo['description']) ?></textarea>
      </div>

      <div class="edit-group checkbox-group">
        <input type="checkbox" id="editShared" name="is_shared" value="1"
               <?= (int) $selectedTodo['is_shared'] ? 'checked' : '' ?>>
        <label for="editShared">Bagikan ke menu Shared</label>
      </div>

      <div class="edit-actions">
        <button type="submit" class="btn-save">Simpan Perubahan</button>
        <a href="index.php?view=<?= e($view) ?>&id=<?= (int) $selectedTodo['id'] ?>"
           class="btn-cancel">Batal</a>
      </div>
    </form>

  <?php else: ?>

    <div id="viewMode" class="isi-detail" aria-live="polite">
      <p><strong>Judul:</strong> <span id="detailTitle"><?= e($selectedTodo['title']) ?></span></p>

      <p class="statusParagraph">
        <strong>Status:</strong>
        <span id="detailStatus" role="status"
              class="<?= (int) $selectedTodo['is_completed'] ? 'status-completed' : 'status-in-progress' ?>">
          <?= (int) $selectedTodo['is_completed'] ? 'Completed' : 'In Progress' ?>
        </span>
      </p>

      <p><strong>Pemilik:</strong> <span><?= e($selectedTodo['owner_name']) ?></span></p>

      <p><strong>Pengingat:</strong>
        <span id="detailNotify"><?= e(formatNotify($selectedTodo['notify_time'])) ?></span>
      </p>

      <p><strong>Catatan:</strong></p>
      <div id="detailDesc" class="kotak-catatan">
        <?= nl2br(e($selectedTodo['description'] ?: 'Tidak ada catatan.')) ?>
      </div>

      <div id="detailImageWrapper" class="detail-image-container">
        <p><strong>Lampiran Gambar:</strong></p>
        <?php if (!empty($selectedTodo['image_path'])): ?>
          <img id="detailImage" src="<?= e($selectedTodo['image_path']) ?>"
               alt="Lampiran foto untuk <?= e($selectedTodo['title']) ?>">
        <?php else: ?>
          <p id="noImageText" class="text-muted">Tidak ada gambar terlampir.</p>
        <?php endif; ?>
      </div>
    </div>

  <?php endif; ?>
</aside>