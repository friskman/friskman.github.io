const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('ultraTodos') || '[]');
let searchText = '';

function renderTodos() {
  list.innerHTML = '';
  todos.forEach((todo, idx) => {
    if (searchText && !todo.text.toLowerCase().includes(searchText.toLowerCase())) return;
    const li = document.createElement('li');
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', (e) => {
      toggleTodo(idx);
    });
    li.appendChild(checkbox);
    // Text
    const span = document.createElement('span');
    span.textContent = todo.text;
    span.style.flex = '1';
    if (todo.completed) li.classList.add('completed');
    li.appendChild(span);
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(idx);
    });
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function addTodo(text) {
  todos.push({ text, completed: false });
  saveTodos();
  renderTodos();
}

function toggleTodo(idx) {
  todos[idx].completed = !todos[idx].completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(idx) {
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem('ultraTodos', JSON.stringify(todos));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (value) {
    addTodo(value);
    input.value = '';
  }
});

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
  searchText = e.target.value;
  renderTodos();
});

renderTodos();

// CSVダウンロード機能
const downloadBtn = document.getElementById('download-csv');
downloadBtn.addEventListener('click', () => {
  const csvHeader = 'やること,完了\n';
  const csvRows = todos.map(todo => {
    const text = '"' + todo.text.replace(/"/g, '""') + '"';
    const done = todo.completed ? 'はい' : 'いいえ';
    return `${text},${done}`;
  });
  const csvContent = '\uFEFF' + csvHeader + csvRows.join('\n'); // Add BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ultra-todo.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}); 