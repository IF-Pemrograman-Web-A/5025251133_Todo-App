# 5025251133_Todo-App

## Identitas
- Nama: Garda Putra Brahmantya
- NRP: 5025251133
- Kelas: Pemrograman Web - A

---

## Deskripsi Pembaruan Proyek (E03 - The Lost Cavern)

Aplikasi **Todo List** dikembangkan dari versi sebelumnya (in-memory + DOM manipulation + Dark Mode sederhana) menjadi aplikasi web yang lengkap sesuai kriteria **E03 – The Lost Cavern**:

1. **IndexedDB** untuk menyimpan data todo.
2. **localStorage** untuk menyimpan preferensi tema (light/dark).
3. **Media Capture API** untuk mengambil foto aktivitas dari kamera.
4. **Service Worker** (`sw.js`) untuk caching aset dan notifikasi.
5. Field **Waktu Pengingat Notifikasi** (`datetime-local`) pada form.
6. **Accessibility** menyeluruh: ARIA roles/labels, live region, keyboard navigation, focus visible, `sr-only`.
7. Praktik terbaik tambahan: `aria-pressed`, `role="status"`, `role="list"`, responsive, dsb.

---

## Fitur Utama (Setelah Pembaruan)

- Tambah / edit / hapus aktivitas tanpa reload halaman.
- Status selesai via checkbox dengan label aksesibel.
- Detail aktivitas di panel kanan (judul, status, pengingat, catatan, gambar).
- Lampirkan foto aktivitas dari kamera (getUserMedia + canvas).
- Atur waktu pengingat notifikasi per aktivitas.
- Notifikasi pengingat via Service Worker / Notification API.
- Dark Mode / Light Mode yang persisten via localStorage.
- Data todo persisten di IndexedDB (tetap ada setelah reload).
- Service Worker caching (aset bisa dimuat offline).
- Aksesibilitas: ARIA, live region, keyboard nav, `:focus-visible`, `sr-only`.

---

## Perbandingan Kode Lama vs Kode Baru

### A. `Perubahan pada index.html`

| No | Bagian | Kode Lama | Kode Baru | Alasan / Kriteria |
|----|--------|-----------|-----------|-------------------|
| 1 | `<header>` | `<header>` | `<header role="banner">` | Landmark ARIA eksplisit (A11y). |
| 2 | `<h1>` | `<h1> ( ͡° ͜ʖ ͡°) - To Do List - ( ͡° ͜ʖ ͡°) </h1>` | `<h1 id="appTitle">…</h1>` | Diberi `id` untuk referensi/landmark. |
| 3 | Tombol tema | `<button id="themeToggleBtn" class="btn-theme">` | Ditambah `aria-pressed="false"` dan `aria-label="Beralih ke Mode Gelap"` | State tombol toggle dapat dibaca screen reader. |
| 4 | `<main>` | `<main class="container">` | `<main class="container" role="main">` | Landmark eksplisit. |
| 5 | `<section>` | `<section class="panelLeft">` | `<section class="panelLeft" aria-labelledby="headingList">` | Panel dikaitkan dengan headingnya. |
| 6 | Heading panel kiri | `<h2>List Aktivitas</h2>` | `<h2 id="headingList">List Aktivitas</h2>` | Target `aria-labelledby`. |
| 7 | Form tambah | `<form id="todoForm" class="form-todo">` | `<form id="todoForm" class="form-todo" aria-label="Form Tambah Aktivitas Baru">` | Form punya nama aksesibel. |
| 8 | Input judul | `<input id="todoInputTitle" required>` | Dibungkus `<div class="form-group">` + `<label for="todoInputTitle">Nama Aktivitas *</label>` + `aria-required="true"` | Label eksplisit + indikator wajib. |
| 9 | Textarea catatan | `<textarea id="todoInputDesc">` | Dibungkus `<div class="form-group">` + `<label for="todoInputDesc">Catatan Detail</label>` | Label eksplisit. |
| 10 | **Field baru: pengingat** | *(tidak ada)* | `<input type="datetime-local" id="todoInputNotify" aria-describedby="notifyHelp">` + `<small id="notifyHelp" class="help-text">` | Kriteria E03 – field waktu notifikasi + deskripsi aksesibel. |
| 11 | **Fieldset kamera baru** | *(tidak ada)* | `<fieldset class="camera-section">` + `<legend>` + `<video>` + `<canvas>` + `<img>` + tombol Buka/Ambil/Hapus | Kriteria E03 – Media Capture API. |
| 12 | **Live region baru** | *(tidak ada)* | `<div id="srAnnouncement" class="sr-only" aria-live="polite" aria-atomic="true"></div>` | Umpan balik ke screen reader. |
| 13 | `<ul>` daftar | `<ul id="todoList" class="list-aktivitas">` | Ditambah `aria-label="Daftar Tugas Aktivitas"` dan `role="list"` | Peran list eksplisit. |
| 14 | `<aside>` | `<aside class="panelRight">` | `<aside class="panelRight" aria-labelledby="headingDetail">` | Panel dikaitkan dengan headingnya. |
| 15 | Heading panel kanan | `<h2>Detail Aktivitas</h2>` | `<h2 id="headingDetail">Detail Aktivitas</h2>` | Target `aria-labelledby`. |
| 16 | Detail view | `<div id="viewMode" class="isi-detail">` | Ditambah `aria-live="polite"` | Perubahan detail diumumkan. |
| 17 | **Field baru: detailNotify** | *(tidak ada)* | `<p><strong>Pengingat:</strong> <span id="detailNotify">-</span></p>` | Menampilkan waktu pengingat. |
| 18 | **Field baru: detailImage** | *(tidak ada)* | `<div id="detailImageWrapper">…<img id="detailImage">…<p id="noImageText">` | Menampilkan lampiran foto. |
| 19 | Status | `<span id="detailStatus">-</span>` | `<span id="detailStatus" role="status">-</span>` | Perubahan status diumumkan. |
| 20 | Edit form | `<form id="editForm" class="form-edit" style="display: none;">` | Ditambah `aria-label="Form Edit Aktivitas"` | Nama aksesibel. |
| 21 | Label edit | `Judul:` / `Status:` / `Catatan:` | `Judul Aktivitas:` / `Status Penyelesaian:` / `Catatan:` | Lebih deskriptif. |
| 22 | **Field edit baru: editNotify** | *(tidak ada)* | `<input type="datetime-local" id="editNotify">` | Edit pengingat. |
| 23 | `<footer>` | `<footer>` | `<footer role="contentinfo">` | Landmark eksplisit. |
| 24 | Script | `<script src="script.js">` | Tetap sama, tapi `script.js` sekarang juga mendaftarkan `sw.js` | Menambah Service Worker. |

---

### B. `Perubahan pada script.js`

#### B.1. Header file   IndexedDB ditambahkan

**Lama:**
```javascript
const defaultTodos = [
  { id: 1, title: "Belajar Competitive Programming Nonstop", ... },
  ...
];
```

**Baru:**
```javascript
const DB_NAME = "TodoAppDB";
const DB_VERSION = 1;
const STORE_NAME = "todos";

function openDB() { ... }
async function getAllTodosFromDB() { ... }
async function saveTodoToDB(todo) { ... }
async function deleteTodoFromDB(id) { ... }
```

> **Perubahan:** Data tidak lagi hanya in-memory; sekarang persisten di **IndexedDB**.

#### B.2. State global

| Lama | Baru |
|------|------|
| `let todos = [...defaultTodos];` | `let todos = [];` (diisi dari DB saat `initApp`) |
| `let selectedTodoId = 1;` | `let selectedTodoId = null;` |
| `let editingTodoId = null;` | `let editingTodoId = null;` (tetap) |
| - | **Baru:** `let capturedImageData = "";` |
| - | **Baru:** `let mediaStream = null;` |

#### B.3. `defaultTodos`

| Lama | Baru |
|------|------|
| 4 item (Belajar CP, Tugas Pemweb, Sholat Magrib, OKKBK) tanpa `notifyTime` / `image` | 2 item (Belajar CP, Tugas Pemweb) dengan field tambahan `notifyTime: ""` dan `image: ""` |

> **Perubahan:** Struktur data objek sekarang punya `notifyTime` dan `image`.

#### B.4. DOM Refs

Ditambah referensi baru:

```javascript
const todoInputNotify = document.getElementById("todoInputNotify");
const detailNotify    = document.getElementById("detailNotify");
const detailImage     = document.getElementById("detailImage");
const noImageText     = document.getElementById("noImageText");
const editNotify      = document.getElementById("editNotify");
const srAnnouncement  = document.getElementById("srAnnouncement");

const cameraVideo          = document.getElementById("cameraVideo");
const cameraCanvas         = document.getElementById("cameraCanvas");
const capturedImagePreview = document.getElementById("capturedImagePreview");
const btnStartCamera       = document.getElementById("btnStartCamera");
const btnCapture           = document.getElementById("btnCapture");
const btnClearImage        = document.getElementById("btnClearImage");
```

#### B.5. Tema   dari toggle sederhana → persist + announce

**Lama:**
```javascript
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  themeToggleBtn.textContent = isDarkMode ? "To Light Mode" : "To Dark Mode";
});
```

**Baru:**
```javascript
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") { ... }
}

themeToggleBtn.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  themeToggleBtn.setAttribute("aria-pressed", isDarkMode ? "true" : "false");
  themeToggleBtn.setAttribute("aria-label", ...);
  announceToSR(...);
});
```

> **Perubahan:** Tema disimpan di **localStorage** (kriteria E03 #1), state tombol toggle diumumkan ke screen reader.

#### B.6. Fungsi baru   Media Capture

```javascript
btnStartCamera.addEventListener("click", async () => {
  mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  cameraVideo.srcObject = mediaStream;
  ...
});

btnCapture.addEventListener("click", () => {
  const context = cameraCanvas.getContext("2d");
  cameraCanvas.width  = cameraVideo.videoWidth  || 320;
  cameraCanvas.height = cameraVideo.videoHeight || 240;
  context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
  capturedImageData = cameraCanvas.toDataURL("image/jpeg");
  ...
});

function stopCamera() {
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
  ...
}
```

> **Perubahan:** Implementasi **Media Capture API** (kriteria E03 #2).

#### B.7. Fungsi baru   Service Worker

```javascript
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")...
  }
}
```

> **Perubahan:** Registrasi **Service Worker** .

#### B.8. Fungsi baru   Notifikasi

```javascript
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function scheduleNotification(todo) {
  if (!todo.notifyTime || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const delay = new Date(todo.notifyTime).getTime() - Date.now();
  if (delay > 0) setTimeout(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification(`Pengingat: ${todo.title}`, { ... })
      );
    } else {
      new Notification(...);
    }
  }, delay);
}
```

> **Perubahan:** Field **waktu pengingat** + **notifikasi**.

#### B.9. Fungsi baru   `announceToSR`

```javascript
function announceToSR(message) {
  srAnnouncement.textContent = message;
}
```

> **Perubahan:** Live region ke screen reader (A11y).

#### B.10. `renderDetail()`   tambah notify & image

**Lama:**
```javascript
detailTitle.textContent = activeTodo.title;
detailDesc.textContent  = activeTodo.desc || "Tidak ada catatan.";
if (activeTodo.completed) { ... } else { ... }
```

**Baru:**
```javascript
// + blok pengingat
if (activeTodo.notifyTime) {
  detailNotify.textContent = new Date(activeTodo.notifyTime).toLocaleString("id-ID", {...});
} else {
  detailNotify.textContent = "Tidak diatur";
}

// + blok gambar
if (activeTodo.image) {
  detailImage.src = activeTodo.image;
  detailImage.hidden = false;
  detailImage.alt = `Foto terlampir untuk ${activeTodo.title}`;
  noImageText.hidden = true;
} else {
  detailImage.hidden = true;
  noImageText.hidden = false;
}
```

#### B.11. `renderTodos()`   tambah ARIA, label, keyboard

**Lama:**
```javascript
const titleSpan = document.createElement("span");
titleSpan.className = "item-title";
titleSpan.textContent = todo.title;
```

**Baru:**
```javascript
const labelTitle = document.createElement("label");
labelTitle.htmlFor = `chk-${todo.id}`;
labelTitle.className = "item-title";
labelTitle.textContent = todo.title;
```

**Tambahan di `<li>`:**
```javascript
li.setAttribute("role", "listitem");
li.setAttribute("tabindex", "0");
li.setAttribute("aria-selected", todo.id === selectedTodoId ? "true" : "false");

li.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectItem(); }
});
```

**Checkbox:**
```javascript
checkbox.id = `chk-${todo.id}`;
checkbox.setAttribute("aria-label", `Tandai "${todo.title}" sebagai ...`);
```

**Tombol aksi:**
```javascript
editBtn.setAttribute("aria-label", `Edit aktivitas ${todo.title}`);
deleteBtn.setAttribute("aria-label", `Hapus aktivitas ${todo.title}`);
```

**Hapus sekarang juga async ke DB:**
```javascript
await deleteTodoFromDB(todo.id);
todos = todos.filter((item) => item.id !== todo.id);
...
announceToSR(`Aktivitas "${todo.title}" telah dihapus.`);
```

**Empty state:**
```javascript
if (todos.length === 0) {
  const emptyLi = document.createElement("li");
  emptyLi.className = "item-empty";
  emptyLi.textContent = "Belum ada aktivitas. Silakan tambah aktivitas baru.";
  todoList.appendChild(emptyLi);
  renderDetail();
  return;
}
```

#### B.12. `openEditMode()`   set `editNotify`, focus ke `editTitle`

```javascript
editNotify.value = todo.notifyTime || "";
...
editTitle.focus();
```

#### B.13. `editForm` submit   async + DB + notif

**Lama:**
```javascript
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  targetTodo.title = editTitle.value.trim();
  targetTodo.completed = editStatus.value === "true";
  targetTodo.desc = editDesc.value.trim();
  closeEditMode();
});
```

**Baru:**
```javascript
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const targetTodo = todos.find((item) => item.id === editingTodoId);
  if (targetTodo) {
    targetTodo.title = editTitle.value.trim();
    targetTodo.completed = editStatus.value === "true";
    targetTodo.notifyTime = editNotify.value;   
    targetTodo.desc = editDesc.value.trim();

    await saveTodoToDB(targetTodo);             
    scheduleNotification(targetTodo);           
    announceToSR(`Aktivitas "${targetTodo.title}" berhasil diperbarui.`); 
  }
  closeEditMode();
});
```

#### B.14. `todoForm` submit   async + DB + notif + reset kamera

**Lama:**
```javascript
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newTodo = { id: Date.now(), title, desc, completed: false };
  todos.unshift(newTodo);
  selectedTodoId = newTodo.id;
  todoForm.reset();
  closeEditMode();
});
```

**Baru:**
```javascript
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const notifyValue = todoInputNotify.value;       
  const newTodo = {
    id: Date.now(),
    title: titleValue,
    desc: descValue,
    notifyTime: notifyValue,                       
    image: capturedImageData,                      
    completed: false
  };

  await saveTodoToDB(newTodo);                     
  todos.unshift(newTodo);
  selectedTodoId = newTodo.id;

  scheduleNotification(newTodo);                   

  todoForm.reset();
  capturedImageData = "";                          
  capturedImagePreview.src = "";                   
  capturedImagePreview.hidden = true;              
  btnClearImage.hidden = true;                     
  stopCamera();                                    

  closeEditMode();
  announceToSR(`Aktivitas baru "${newTodo.title}" berhasil ditambahkan.`); 
});
```

#### B.15. Bootstrap akhir   dari langsung render → `initApp()`

**Lama:**
```javascript
renderTodos();
renderDetail();
```

**Baru:**
```javascript
async function initApp() {
  initTheme();
  registerServiceWorker();

  try {
    const dbTodos = await getAllTodosFromDB();
    if (dbTodos.length > 0) {
      todos = dbTodos;
    } else {
      const defaultTodos = [ /* 2 item */ ];
      for (const item of defaultTodos) await saveTodoToDB(item);
      todos = defaultTodos;
    }
    if (todos.length > 0) selectedTodoId = todos[0].id;
  } catch (err) {
    console.error("Gagal memuat data dari IndexedDB:", err);
  }

  renderTodos();
  renderDetail();

  document.body.addEventListener("click", requestNotificationPermission, { once: true });
}

initApp();
```

> **Perubahan:** Bootstrap async, memuat data dari IndexedDB, mendaftarkan SW, dan meminta izin notifikasi pada interaksi pertama.

---

### C. `Perubahan pada style.css`

| No | Selector | Lama | Baru | Alasan |
|----|----------|------|------|--------|
| 1 | `:focus-visible` | *(tidak ada)* | `outline: 3px solid #3182ce; outline-offset: 2px;` | Fokus keyboard terlihat (A11y). |
| 2 | `.sr-only` | *(tidak ada)* | Didefinisikan | Untuk live region khusus screen reader. |
| 3 | `body { font-family }` | `Arial, sans-serif` | `system-ui, -apple-system, …` | Font native yang lebih modern. |
| 4 | `body` colors | `#f4f6f8` / `#333` | `#f4f6f8` / `#1a202c` | Kontras teks lebih tinggi (A11y). |
| 5 | `header` | `lightseagreen` | `#137973` | Konsisten dengan brand tombol submit. |
| 6 | `.btn-theme` border | `1px solid #ccc` | `2px solid #cbd5e0` | Border lebih tegas. |
| 7 | `.container` `max-width` | `900px` | `960px` | Ruang lebih luas. |
| 8 | `.panelLeft, .panelRight` | `border: 1px solid #ddd` | `border: 1px solid #cbd5e0` | Warna border konsisten. |
| 9 | `h2` | `color: #2b6cb0; border-bottom: #edf2f7` | `color: #1a365d; border-bottom: #e2e8f0` | Warna kontras lebih baik. |
| 10 | `.form-group` | *(tidak ada)* | Ditambahkan | Layout label + input baru. |
| 11 | `.required` | *(tidak ada)* | `color: #e53e3e` | Penanda field wajib. |
| 12 | `.help-text` | *(tidak ada)* | Ditambahkan | Deskripsi field pengingat. |
| 13 | Inputs di `.form-todo` | Hanya `input, textarea` | Tambah `select` + `border: 1px solid #a0aec0` | Konsistensi border. |
| 14 | `.camera-section` | *(tidak ada)* | `border: 1px dashed; padding: 12px` | Fieldset kamera. |
| 15 | `.camera-controls` | *(tidak ada)* | `display:flex; gap:8px` | Tombol kamera. |
| 16 | `.btn-submit` | `rgb(32, 178, 170)` | `#0d9488` | Warna teal konsisten. |
| 17 | `.btn-secondary` | *(tidak ada)* | Ditambahkan | Tombol Buka Kamera. |
| 18 | `.item-empty` | *(tidak ada)* | Ditambahkan | Empty state aksesibel. |
| 19 | `.item-title` | *(tidak ada cursor)* | `cursor: pointer;` | Karena sekarang `<label>`. |
| 20 | `.detail-image-container img` | *(tidak ada)* | Ditambahkan | Tampilan lampiran foto. |
| 21 | `.text-muted` | *(tidak ada)* | Ditambahkan | Teks "Tidak ada gambar". |
| 22 | `.kotak-catatan` color | `#4a5568` | `#2d3748` | Kontras lebih tinggi. |
| 23 | Dark mode palette | `#12161a` / `#1e252b` | `#0f172a` / `#1e293b` | Nuansa slate. |
| 24 | Dark mode `h2` | `#63b3ed` | `#60a5fa` | Lebih terang. |
| 25 | Dark mode input | `#2a343d` | `#0f172a` | Menyatu dengan background. |
| 26 | Dark mode `.btn-delete` | `#742a2a` | `#7f1d1d` | Warna lebih dalam. |
| 27 | Media query `max-width: 640px` | Sama | Sama | Responsive tetap. |

---

### D. `sw.js`   File Baru

File ini **tidak ada** pada versi lama. Isinya:

```javascript
const CACHE_NAME = "todo-app-v1";
const ASSETS_TO_CACHE = ["./", "./index.html", "./style.css", "./script.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) if (c.url && "focus" in c) return c.focus();
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
```

> **Perubahan:** Implementasi **Service Worker** untuk caching (offline) dan penanganan klik notifikasi.

---

## Struktur Data Todo

```javascript
{
  id: number,
  title: string,
  desc: string,
  notifyTime: string,   : hasil datetime-local
  image: string,        : data URL JPEG
  completed: boolean
}
```

---

## Struktur File

```text
.
├── index.html
├── style.css
├── script.js
├── sw.js
├── README.md
└── assets/
    ├── SavedThemePreference.gif
    └── SavedChanges.gif
```

---

## Cara Menjalankan

1. Simpan semua file dalam satu folder.
2. Jalankan lewat file index.html sampai muncul di browser utama.
3. Izinkan akses kamera saat menekan **Buka Kamera**.
4. Izinkan notifikasi saat diminta.
5. Service Worker akan terdaftar dan aset akan di-cache.

---

## Preview Tampilan

- **Theme Preference yang Tersimpan**: ![SavedThemes](https://github.com/IF-Pemrograman-Web-A/5025251133_Todo-App/blob/E03/assets/SavedThemePreference.gif)
- **Navigasi Menggunakan Tab dan Enter untuk Press Button**: ![AccessibilityandSavedChanges](https://github.com/IF-Pemrograman-Web-A/5025251133_Todo-App/blob/E03/assets/SavedChanges.gif)
