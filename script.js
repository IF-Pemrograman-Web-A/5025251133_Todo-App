const defaultTodos = [
  {
    id: 1,
    title: "Belajar Competitive Programming Nonstop",
    desc: "Dunia hanya berputar untuk COMPETITIVE PROGRAMMING RAHHHHHHHHHHHHHHHH\nBelajar COMPETITIVE PROGRAMMING supaya cepat menua RAHHHHHHHHHHHHHHHH",
    completed: false
  },
  {
    id: 2,
    title: "Mengerjakan tugas pemweb",
    desc: "Membuat manipulasi DOM interaktif dan fitur dark mode.",
    completed: false
  },
  {
    id: 3,
    title: "Sholat Magrib Berjamaah",
    desc: "Berangkat ke masjid tepat waktu saat adzan berkumandang.",
    completed: false
  },
  {
    id: 4,
    title: "Menjadi kakak pembimbing OKKBK",
    desc: "Membimbing mahasiswa baru departemen.",
    completed: true
  }
];

let todos = [...defaultTodos];
let selectedTodoId = 1;
let editingTodoId = null;

const todoForm = document.getElementById("todoForm");
const todoInputTitle = document.getElementById("todoInputTitle");
const todoInputDesc = document.getElementById("todoInputDesc");
const todoList = document.getElementById("todoList");

const viewMode = document.getElementById("viewMode");
const detailTitle = document.getElementById("detailTitle");
const detailStatus = document.getElementById("detailStatus");
const detailDesc = document.getElementById("detailDesc");

const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editStatus = document.getElementById("editStatus");
const editDesc = document.getElementById("editDesc");
const btnCancelEdit = document.getElementById("btnCancelEdit");

const themeToggleBtn = document.getElementById("themeToggleBtn");

function renderDetail() {
  const activeTodo = todos.find((item) => item.id === selectedTodoId);

  if (!activeTodo) {
    detailTitle.textContent = "Tidak ada aktivitas yang dipilih";
    detailStatus.textContent = "-";
    detailStatus.className = "";
    detailDesc.textContent = "-";
    return;
  }

  detailTitle.textContent = activeTodo.title;
  detailDesc.textContent = activeTodo.desc || "Tidak ada catatan.";

  if (activeTodo.completed) {
    detailStatus.textContent = "Completed";
    detailStatus.className = "status-completed";
  } else {
    detailStatus.textContent = "In Progress";
    detailStatus.className = "status-in-progress";
  }
}

function openEditMode(todo) {
  editingTodoId = todo.id;
  selectedTodoId = todo.id;

  editTitle.value = todo.title;
  editStatus.value = todo.completed ? "true" : "false";
  editDesc.value = todo.desc;

  viewMode.style.display = "none";
  editForm.style.display = "flex";

  renderTodos();
}

function closeEditMode() {
  editingTodoId = null;
  editForm.style.display = "none";
  viewMode.style.display = "block";
  renderDetail();
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `item ${todo.id === selectedTodoId ? "selected" : ""} ${
      todo.completed ? "completed" : ""
    }`;

    const leftContainer = document.createElement("div");
    leftContainer.className = "item-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      selectedTodoId = todo.id;

      if (editingTodoId === todo.id) {
        editStatus.value = todo.completed ? "true" : "false";
      }

      renderTodos();
      renderDetail();
    });

    const titleSpan = document.createElement("span");
    titleSpan.className = "item-title";
    titleSpan.textContent = todo.title;

    leftContainer.appendChild(checkbox);
    leftContainer.appendChild(titleSpan);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-action btn-edit";
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditMode(todo);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.textContent = "Hapus";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      todos = todos.filter((item) => item.id !== todo.id);

      if (editingTodoId === todo.id) {
        closeEditMode();
      }

      if (selectedTodoId === todo.id) {
        selectedTodoId = todos.length > 0 ? todos[0].id : null;
      }

      renderTodos();
      renderDetail();
    });

    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);

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

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const targetTodo = todos.find((item) => item.id === editingTodoId);
  if (targetTodo) {
    targetTodo.title = editTitle.value.trim();
    targetTodo.completed = editStatus.value === "true";
    targetTodo.desc = editDesc.value.trim();
  }

  closeEditMode();
});

btnCancelEdit.addEventListener("click", () => {
  closeEditMode();
});

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleValue = todoInputTitle.value.trim();
  const descValue = todoInputDesc.value.trim();

  if (!titleValue) return;

  const newTodo = {
    id: Date.now(),
    title: titleValue,
    desc: descValue,
    completed: false
  };

  todos.unshift(newTodo);
  selectedTodoId = newTodo.id;

  todoForm.reset();
  closeEditMode();
});

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  themeToggleBtn.textContent = isDarkMode ? "To Light Mode" : "To Dark Mode";
});

renderTodos();
renderDetail();
