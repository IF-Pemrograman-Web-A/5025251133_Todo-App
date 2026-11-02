CREATE DATABASE IF NOT EXISTS todo_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_app;

DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE todos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT NULL,
  notify_time  DATETIME NULL,
  image_path   VARCHAR(255) NULL,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  is_shared    TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_todos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_shared (is_shared)
) ENGINE=InnoDB;

INSERT INTO users (id, username, display_name) VALUES
  (1, 'garda', 'Garda Putra Brahmantya'),
  (2, 'budi',  'Budi Santoso'),
  (3, 'siti',  'Siti Nurhaliza');

INSERT INTO todos (user_id, title, description, notify_time, image_path, is_completed, is_shared) VALUES
  (1, 'Belajar Competitive Programming Nonstop',
      'Latihan pemecahan masalah algoritma dan struktur data.',
      NULL, NULL, 0, 0),
  (1, 'Mengerjakan tugas pemweb',
      'Membuat aplikasi Todo List dengan PHP, MySQL, Media Capture, dan Service Worker.',
      '2025-12-31 20:00:00', NULL, 0, 1),
  (1, 'Rapat koordinasi divisi web',
      'Membahas progres migrasi front-end ke PHP.',
      '2025-12-28 09:30:00', NULL, 1, 1),
  (2, 'Review pull request modul auth',
      'Cek validasi input dan prepared statement.',
      NULL, NULL, 0, 1),
  (2, 'Menyusun dokumentasi API',
      'Format OpenAPI 3.0, minimal 5 endpoint.',
      '2025-12-29 15:00:00', NULL, 0, 1),
  (2, 'Backup database produksi',
      'Catatan pribadi.',
      NULL, NULL, 1, 0),
  (3, 'Desain UI halaman Shared',
      'Gunakan palet warna yang konsisten dengan mode gelap.',
      '2025-12-30 11:00:00', NULL, 0, 1),
  (3, 'Update materi onboarding',
      'Catatan pribadi, belum dibagikan.',
      NULL, NULL, 0, 0);