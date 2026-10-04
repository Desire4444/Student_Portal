/* =========================================================
   Student Information Portal - script.js
   variables, conditionals, arrays, functions, events
   DOM-based To-Do list
   ========================================================= */

/* ---------- Variables: one student represented with variables ---------- */
const studentName = "Theophilus Miri";
const studentRegNo = "BICT/2026/001";
let studentLevel = 2;
const passMark = 50;

/* ---------- Array of student objects ---------- */
const students = [
  { name: "Amina Bello",   regNo: "BICT/2026/101", marks: [72, 65, 80] },
  { name: "Chidi Okafor",  regNo: "BICT/2026/102", marks: [45, 38, 52] },
  { name: "Grace Adeyemi", regNo: "BICT/2026/103", marks: [58, 61, 49] },
  { name: "Tunde Bakare",  regNo: "BICT/2026/104", marks: [30, 42, 35] },
  { name: "Ngozi Eze",     regNo: "BICT/2026/105", marks: [88, 91, 79] },
  { name: "Ibrahim Musa",  regNo: "BICT/2026/106", marks: [50, 50, 50] }
];

/* ---------- calculate average mark ---------- */
function calculateAverage(marks) {
  let total = 0;
  for (let i = 0; i < marks.length; i++) {
    total += marks[i];
  }
  return marks.length === 0 ? 0 : total / marks.length;
}

/* ---------- Conditional fuunction: PASS / FAIL ---------- */
function getResult(average) {
  if (average >= passMark) {
    return "PASS";
  } else {
    return "FAIL";
  }
}

/* ---------- Render results table dynamically ---------- */
const resultsBody = document.getElementById("results-body");
const resultMessage = document.getElementById("result-message");

function renderResults() {
  resultsBody.innerHTML = "";
  students.forEach(function (student, index) {
    const average = calculateAverage(student.marks);
    const result = getResult(average);
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + escapeHTML(student.name) + "</td>" +
      "<td>" + escapeHTML(student.regNo) + "</td>" +
      "<td>" + student.marks.join(", ") + "</td>" +
      "<td>" + average.toFixed(1) + "</td>" +
      '<td><span class="badge ' + (result === "PASS" ? "badge-pass" : "badge-fail") + '">' + result + "</span></td>" +
      '<td><button type="button" class="btn btn-small" data-index="' + index + '">View</button></td>';
    resultsBody.appendChild(row);
  });
}

function showResultMessage(student) {
  const average = calculateAverage(student.marks);
  const result = getResult(average);
  resultMessage.textContent =
    student.name + " (" + student.regNo + ") scored an average of " +
    average.toFixed(1) + " - " + result + (result === "PASS" ? ". Well done!" : ". Please see your lecturer.");
  resultMessage.className = "message " + (result === "PASS" ? "ok" : "bad");
}

/* ---------- Events: click on a "View" button (event delegation) ---------- */
resultsBody.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-index]");
  if (button) {
    showResultMessage(students[Number(button.dataset.index)]);
  }
});

/* ---------- Events: submit the result-check form ---------- */
document.getElementById("check-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const reg = document.getElementById("check-reg").value.trim().toUpperCase();
  const found = students.find(function (s) { return s.regNo.toUpperCase() === reg; });
  if (!reg) {
    resultMessage.textContent = "Please enter a registration number.";
    resultMessage.className = "message bad";
  } else if (found) {
    showResultMessage(found);
  } else {
    resultMessage.textContent = "No student found with registration number " + reg + ".";
    resultMessage.className = "message bad";
  }
});

/* ---------- Registration form (student requests) ---------- */
const registerForm = document.getElementById("register-form");
const requestsBody = document.getElementById("requests-body");
const noRequests = document.getElementById("no-requests");
const formMessage = document.getElementById("form-message");
let requests = loadFromStorage("portalRequests");

function renderRequests() {
  requestsBody.innerHTML = "";
  requests.forEach(function (r) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + escapeHTML(r.name) + "</td><td>" + escapeHTML(r.regno) + "</td><td>" +
      escapeHTML(r.email) + "</td><td>" + escapeHTML(r.programme) + "</td><td>" +
      escapeHTML(r.gender) + '</td><td><span class="badge badge-pending">Pending</span></td>';
    requestsBody.appendChild(row);
  });
  noRequests.style.display = requests.length ? "none" : "block";
}

function setError(fieldId, message) {
  const el = document.getElementById("err-" + fieldId);
  el.textContent = message;
  const wrapper = el.closest(".field");
  wrapper.classList.toggle("invalid", message !== "");
}

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = registerForm.name.value.trim();
  const regno = registerForm.regno.value.trim().toUpperCase();
  const email = registerForm.email.value.trim();
  const programme = registerForm.programme.value;
  const genderInput = registerForm.querySelector('input[name="gender"]:checked');

  let valid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regPattern = /^[A-Z]{2,6}\/\d{4}\/\d{3,4}$/;

  if (name.length < 3) { setError("name", "Enter your full name (at least 3 characters)."); valid = false; } else { setError("name", ""); }
  if (!regPattern.test(regno)) { setError("regno", "Use the format BICT/2026/107."); valid = false; }
  else if (requests.some(function (r) { return r.regno === regno; }) ||
           students.some(function (s) { return s.regNo === regno; })) {
    setError("regno", "This registration number already exists."); valid = false;
  } else { setError("regno", ""); }
  if (!emailPattern.test(email)) { setError("email", "Enter a valid email address."); valid = false; } else { setError("email", ""); }
  if (!programme) { setError("programme", "Please select a programme."); valid = false; } else { setError("programme", ""); }
  if (!genderInput) { setError("gender", "Please select a gender."); valid = false; } else { setError("gender", ""); }

  if (!valid) {
    formMessage.textContent = "Please fix the errors above and try again.";
    formMessage.className = "message bad";
    return;
  }

  requests.push({ name: name, regno: regno, email: email, programme: programme, gender: genderInput.value });
  saveToStorage("portalRequests", requests);
  renderRequests();
  registerForm.reset();
  formMessage.textContent = "Thank you, " + name + ". Your registration request has been received.";
  formMessage.className = "message ok";
});

/* ---------- To-Do List (DOM manipulation) ---------- */
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoMessage = document.getElementById("todo-message");
const todoCount = document.getElementById("todo-count");

function updateTodoCount() {
  const items = todoList.querySelectorAll(".todo-item");
  const done = todoList.querySelectorAll(".todo-item.completed").length;
  todoCount.textContent = items.length === 0
    ? "No tasks yet. Add one above."
    : done + " of " + items.length + " task(s) completed.";
}

function createTaskElement(text, completed) {
  const li = document.createElement("li");
  li.className = "todo-item" + (completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!completed;
  checkbox.setAttribute("aria-label", "Mark task completed");

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = text;

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-small";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-small btn-danger";
  deleteBtn.textContent = "Delete";

  actions.append(editBtn, deleteBtn);
  li.append(checkbox, span, actions);

  // Mark completed
  checkbox.addEventListener("change", function () {
    li.classList.toggle("completed", checkbox.checked);
    updateTodoCount();
    saveTodos();
  });

  // Delete
  deleteBtn.addEventListener("click", function () {
    li.remove();
    updateTodoCount();
    saveTodos();
  });

  // Edit (toggles between Edit and Save)
  editBtn.addEventListener("click", function () {
    const editing = li.querySelector(".todo-edit");
    if (!editing) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "todo-edit";
      input.value = span.textContent;
      li.replaceChild(input, span);
      editBtn.textContent = "Save";
      input.focus();
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { editBtn.click(); }
      });
    } else {
      const newText = editing.value.trim();
      if (newText === "") {
        todoMessage.textContent = "A task cannot be empty.";
        todoMessage.className = "message bad";
        return;
      }
      span.textContent = newText;
      li.replaceChild(span, editing);
      editBtn.textContent = "Edit";
      todoMessage.textContent = "Task updated.";
      todoMessage.className = "message ok";
      saveTodos();
    }
  });

  return li;
}

function saveTodos() {
  const data = Array.from(todoList.querySelectorAll(".todo-item")).map(function (li) {
    return { text: li.querySelector(".todo-text, .todo-edit").value || li.querySelector(".todo-text").textContent,
             completed: li.classList.contains("completed") };
  });
  saveToStorage("portalTodos", data);
}

todoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (text === "") {
    todoMessage.textContent = "Please enter a task first.";
    todoMessage.className = "message bad";
    return;
  }
  todoList.appendChild(createTaskElement(text, false));
  todoInput.value = "";
  todoInput.focus();
  todoMessage.textContent = "Task added.";
  todoMessage.className = "message ok";
  updateTodoCount();
  saveTodos();
});

/* ---------- Helpers ---------- */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

/* ---------- Start-up ---------- */
console.log("Logged in as " + studentName + " (" + studentRegNo + "), level " + studentLevel);
renderResults();
renderRequests();
loadFromStorage("portalTodos").forEach(function (t) { todoList.appendChild(createTaskElement(t.text, t.completed)); });
updateTodoCount();
