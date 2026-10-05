const DB_NAME = "TodoAppDB";
const DB_VERSION = 1;
const STORE_NAME = "todos";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject("Gagal membuka IndexedDB: " + e.target.error);
  });
}

async function getAllTodosFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveTodoToDB(todo) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(todo);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteTodoFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

let todos = [];
let selectedTodoId = null;
let editingTodoId = null;
let capturedImageData = "";
let mediaStream = null;

const todoForm = document.getElementById("todoForm");
const todoInputTitle = document.getElementById("todoInputTitle");
const todoInputDesc = document.getElementById("todoInputDesc");
const todoInputNotify = document.getElementById("todoInputNotify");
const todoList = document.getElementById("todoList");

const viewMode = document.getElementById("viewMode");
const detailTitle = document.getElementById("detailTitle");
const detailStatus = document.getElementById("detailStatus");
const detailNotify = document.getElementById("detailNotify");
const detailDesc = document.getElementById("detailDesc");
const detailImage = document.getElementById("detailImage");
const noImageText = document.getElementById("noImageText");

const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editStatus = document.getElementById("editStatus");
const editNotify = document.getElementById("editNotify");
const editDesc = document.getElementById("editDesc");
const btnCancelEdit = document.getElementById("btnCancelEdit");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const srAnnouncement = document.getElementById("srAnnouncement");

const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const capturedImagePreview = document.getElementById("capturedImagePreview");
const btnStartCamera = document.getElementById("btnStartCamera");
const btnCapture = document.getElementById("btnCapture");
const btnClearImage = document.getElementById("btnClearImage");

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "To Light Mode";
    themeToggleBtn.setAttribute("aria-pressed", "true");
    themeToggleBtn.setAttribute("aria-label", "Beralih ke Mode Terang");
  } else {
    document.body.classList.remove("dark-mode");
    themeToggleBtn.textContent = "To Dark Mode";
    themeToggleBtn.setAttribute("aria-pressed", "false");
    themeToggleBtn.setAttribute("aria-label", "Beralih ke Mode Gelap");
  }
}

themeToggleBtn.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");

  themeToggleBtn.textContent = isDarkMode ? "To Light Mode" : "To Dark Mode";
  themeToggleBtn.setAttribute("aria-pressed", isDarkMode ? "true" : "false");
  themeToggleBtn.setAttribute("aria-label", isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap");
  announceToSR(isDarkMode ? "Mode Gelap diaktifkan" : "Mode Terang diaktifkan");
});

btnStartCamera.addEventListener("click", async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    cameraVideo.srcObject = mediaStream;
    cameraVideo.hidden = false;
    btnCapture.hidden = false;
    btnStartCamera.hidden = true;
    announceToSR("Kamera diaktifkan. Tekan tombol Ambil Foto untuk mengambil gambar.");
  } catch (err) {
    alert("Tidak dapat mengakses kamera: " + err.message);
    announceToSR("Gagal mengakses kamera.");
  }
});

btnCapture.addEventListener("click", () => {
  const context = cameraCanvas.getContext("2d");
  cameraCanvas.width = cameraVideo.videoWidth || 320;
  cameraCanvas.height = cameraVideo.videoHeight || 240;
  context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

  capturedImageData = cameraCanvas.toDataURL("image/jpeg");
  capturedImagePreview.src = capturedImageData;
  capturedImagePreview.hidden = false;
  btnClearImage.hidden = false;

  stopCamera();
  announceToSR("Foto berhasil diambil.");
});

btnClearImage.addEventListener("click", () => {
  capturedImageData = "";
  capturedImagePreview.src = "";
  capturedImagePreview.hidden = true;
  btnClearImage.hidden = true;
  stopCamera();
  announceToSR("Foto berhasil dihapus.");
});

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  cameraVideo.hidden = true;
  btnCapture.hidden = true;
  btnStartCamera.hidden = false;
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then((reg) => console.log("Service Worker terdaftar:", reg.scope))
      .catch((err) => console.error("SW Registration error:", err));
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function scheduleNotification(todo) {
  if (!todo.notifyTime || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notifyTimestamp = new Date(todo.notifyTime).getTime();
  const delay = notifyTimestamp - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(`Pengingat: ${todo.title}`, {
            body: todo.desc || "Waktunya menyelesaikan aktivitas ini!",
            icon: todo.image || undefined,
            tag: `todo-notify-${todo.id}`
          });
        });
      } else {
        new Notification(`Pengingat: ${todo.title}`, {
          body: todo.desc || "Waktunya menyelesaikan aktivitas ini!",
          icon: todo.image || undefined
        });
      }
    }, delay);
  }
}

function announceToSR(message) {
  srAnnouncement.textContent = message;
}

function renderDetail() {
  const activeTodo = todos.find((item) => item.id === selectedTodoId);

  if (!activeTodo) {
    detailTitle.textContent = "Tidak ada aktivitas yang dipilih";
    detailStatus.textContent = "-";
    detailStatus.className = "";
    detailNotify.textContent = "-";
    detailDesc.textContent = "-";
    detailImage.hidden = true;
    noImageText.hidden = false;
    return;
  }

  detailTitle.textContent = activeTodo.title;
  detailDesc.textContent = activeTodo.desc || "Tidak ada catatan.";

  if (activeTodo.notifyTime) {
    const dateObj = new Date(activeTodo.notifyTime);
    detailNotify.textContent = dateObj.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } else {
    detailNotify.textContent = "Tidak diatur";
  }

  if (activeTodo.completed) {
    detailStatus.textContent = "Completed";
    detailStatus.className = "status-completed";
  } else {
    detailStatus.textContent = "In Progress";
    detailStatus.className = "status-in-progress";
  }

  if (activeTodo.image) {
    detailImage.src = activeTodo.image;
    detailImage.hidden = false;
    detailImage.alt = `Foto terlampir untuk ${activeTodo.title}`;
    noImageText.hidden = true;
  } else {
    detailImage.hidden = true;
    noImageText.hidden = false;
  }
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "item-empty";
    emptyLi.textContent = "Belum ada aktivitas. Silakan tambah aktivitas baru.";
    todoList.appendChild(emptyLi);
    renderDetail();
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `item ${todo.id === selectedTodoId ? "selected" : ""} ${todo.completed ? "completed" : ""}`;
    li.setAttribute("role", "listitem");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-selected", todo.id === selectedTodoId ? "true" : "false");

    const leftContainer = document.createElement("div");
    leftContainer.className = "item-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.id = `chk-${todo.id}`;
    checkbox.setAttribute("aria-label", `Tandai "${todo.title}" sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`);

    checkbox.addEventListener("click", (e) => e.stopPropagation());
    checkbox.addEventListener("change", async () => {
      todo.completed = checkbox.checked;
      selectedTodoId = todo.id;

      await saveTodoToDB(todo);

      if (editingTodoId === todo.id) {
        editStatus.value = todo.completed ? "true" : "false";
      }

      renderTodos();
      renderDetail();
      announceToSR(`Status "${todo.title}" diubah menjadi ${todo.completed ? "Selesai" : "In Progress"}`);
    });

    const labelTitle = document.createElement("label");
    labelTitle.htmlFor = `chk-${todo.id}`;
    labelTitle.className = "item-title";
    labelTitle.textContent = todo.title;

    leftContainer.appendChild(checkbox);
    leftContainer.appendChild(labelTitle);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-action btn-edit";
    editBtn.textContent = "Edit";
    editBtn.setAttribute("aria-label", `Edit aktivitas ${todo.title}`);

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditMode(todo);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.textContent = "Hapus";
    deleteBtn.setAttribute("aria-label", `Hapus aktivitas ${todo.title}`);

    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteTodoFromDB(todo.id);
      todos = todos.filter((item) => item.id !== todo.id);

      if (editingTodoId === todo.id) {
        closeEditMode();
      }

      if (selectedTodoId === todo.id) {
        selectedTodoId = todos.length > 0 ? todos[0].id : null;
      }

      renderTodos();
      renderDetail();
      announceToSR(`Aktivitas "${todo.title}" telah dihapus.`);
    });

    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);

    const selectItem = () => {
      selectedTodoId = todo.id;
      if (editingTodoId !== null && editingTodoId !== todo.id) {
        closeEditMode();
      } else {
        renderTodos();
        renderDetail();
      }
    };

    li.addEventListener("click", () => {
      selectedTodoId = todo.id;
      if (editingTodoId !== null && editingTodoId !== todo.id) {
        closeEditMode();
      } else {
        renderTodos();
        renderDetail();
      }
    });

    li.appendChild(leftContainer);
    li.appendChild(actionsContainer);
    todoList.appendChild(li);
  });
}

function openEditMode(todo) {
  editingTodoId = todo.id;
  selectedTodoId = todo.id;

  editTitle.value = todo.title;
  editStatus.value = todo.completed ? "true" : "false";
  editNotify.value = todo.notifyTime || "";
  editDesc.value = todo.desc || "";

  viewMode.style.display = "none";
  editForm.style.display = "flex";

  renderTodos();
  editTitle.focus();
}

function closeEditMode() {
  editingTodoId = null;
  editForm.style.display = "none";
  viewMode.style.display = "block";
  renderDetail();
  renderTodos();
}

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

btnCancelEdit.addEventListener("click", () => {
  closeEditMode();
});

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titleValue = todoInputTitle.value.trim();
  const descValue = todoInputDesc.value.trim();
  const notifyValue = todoInputNotify.value;

  if (!titleValue) return;

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

async function initApp() {
  initTheme();
  registerServiceWorker();

  try {
    const dbTodos = await getAllTodosFromDB();
    if (dbTodos.length > 0) {
      todos = dbTodos;
    } else {
      const defaultTodos = [
        {
          id: 1,
          title: "Belajar Competitive Programming Nonstop",
          desc: "Latihan pemecahan masalah algoritma dan struktur data.",
          notifyTime: "",
          image: "",
          completed: false
        },
        {
          id: 2,
          title: "Mengerjakan tugas pemweb",
          desc: "Membuat aplikasi Todo List dengan IndexedDB, Media Capture, Service Worker, dan A11y.",
          notifyTime: "",
          image: "",
          completed: false
        }
      ];
      for (const item of defaultTodos) {
        await saveTodoToDB(item);
      }
      todos = defaultTodos;
    }
    if (todos.length > 0) {
      selectedTodoId = todos[0].id;
    }
  } catch (err) {
    console.error("Gagal memuat data dari IndexedDB:", err);
  }

  renderTodos();
  renderDetail();

  document.body.addEventListener("click", requestNotificationPermission, { once: true });
}

initApp();
