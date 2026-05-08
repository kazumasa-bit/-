(function () {
  "use strict";

  const STORAGE_KEY = "task-manager-v1";

  const state = {
    tasks: [],
    filter: "all",
    category: "",
    sortBy: "created",
  };

  const el = {
    form: document.getElementById("task-form"),
    title: document.getElementById("task-title"),
    due: document.getElementById("task-due"),
    priority: document.getElementById("task-priority"),
    category: document.getElementById("task-category"),
    tags: document.getElementById("task-tags"),
    list: document.getElementById("task-list"),
    empty: document.getElementById("empty-state"),
    stats: document.getElementById("stats"),
    filterBtns: document.querySelectorAll(".filter-btn"),
    filterCategory: document.getElementById("filter-category"),
    sortBy: document.getElementById("sort-by"),
    clearDone: document.getElementById("clear-done"),
    template: document.getElementById("task-template"),
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.tasks = JSON.parse(raw);
    } catch (e) {
      state.tasks = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function parseTags(str) {
    return str
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function addTask(data) {
    state.tasks.unshift({
      id: uid(),
      title: data.title,
      due: data.due || "",
      priority: data.priority || "medium",
      category: data.category || "",
      tags: data.tags || [],
      done: false,
      createdAt: Date.now(),
    });
    save();
    render();
  }

  function updateTask(id, patch) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    Object.assign(task, patch);
    save();
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    save();
    render();
  }

  function clearDone() {
    const count = state.tasks.filter((t) => t.done).length;
    if (count === 0) return;
    if (!confirm(`完了済みのタスク ${count} 件を削除しますか？`)) return;
    state.tasks = state.tasks.filter((t) => !t.done);
    save();
    render();
  }

  function editTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    const newTitle = prompt("タスクのタイトルを編集:", task.title);
    if (newTitle === null) return;
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    updateTask(id, { title: trimmed });
  }

  function getFilteredTasks() {
    let list = state.tasks.slice();

    if (state.filter === "active") list = list.filter((t) => !t.done);
    else if (state.filter === "done") list = list.filter((t) => t.done);

    if (state.category) list = list.filter((t) => t.category === state.category);

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (state.sortBy === "due") {
      list.sort((a, b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due.localeCompare(b.due);
      });
    } else if (state.sortBy === "priority") {
      list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }

  function formatDue(dateStr) {
    if (!dateStr) return { text: "", overdue: false };
    const due = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    let text = "📅 " + dateStr;
    if (diffDays === 0) text = "📅 今日まで";
    else if (diffDays === 1) text = "📅 明日まで";
    else if (diffDays === -1) text = "📅 昨日まで";
    else if (diffDays < -1) text = `📅 ${-diffDays}日超過`;
    else if (diffDays > 1 && diffDays <= 7) text = `📅 ${diffDays}日後`;
    return { text, overdue: diffDays < 0 };
  }

  const PRIORITY_LABEL = { high: "高", medium: "中", low: "低" };

  function renderCategorySelect() {
    const categories = [
      ...new Set(state.tasks.map((t) => t.category).filter(Boolean)),
    ].sort();
    const current = state.category;
    el.filterCategory.innerHTML =
      '<option value="">全カテゴリ</option>' +
      categories
        .map(
          (c) =>
            `<option value="${escapeHtml(c)}"${
              c === current ? " selected" : ""
            }>${escapeHtml(c)}</option>`
        )
        .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    if (total === 0) {
      el.stats.textContent = "";
    } else {
      el.stats.textContent = `全 ${total} 件 / 完了 ${done} 件 / 残り ${
        total - done
      } 件`;
    }
  }

  function render() {
    renderCategorySelect();
    renderStats();

    const tasks = getFilteredTasks();
    el.list.innerHTML = "";

    if (tasks.length === 0) {
      el.empty.hidden = false;
      el.empty.textContent =
        state.tasks.length === 0
          ? "タスクはまだありません。上のフォームから追加してください。"
          : "条件に一致するタスクがありません。";
    } else {
      el.empty.hidden = true;
      const frag = document.createDocumentFragment();
      tasks.forEach((task) => frag.appendChild(buildTaskNode(task)));
      el.list.appendChild(frag);
    }
  }

  function buildTaskNode(task) {
    const node = el.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    if (task.done) node.classList.add("done");

    const checkbox = node.querySelector(".task-checkbox");
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      updateTask(task.id, { done: checkbox.checked });
    });

    node.querySelector(".task-title").textContent = task.title;

    const badge = node.querySelector(".task-priority-badge");
    badge.textContent = PRIORITY_LABEL[task.priority];
    badge.classList.add(task.priority);

    const dueEl = node.querySelector(".task-due");
    const due = formatDue(task.due);
    dueEl.textContent = due.text;
    if (due.overdue && !task.done) dueEl.classList.add("overdue");

    const categoryEl = node.querySelector(".task-category");
    categoryEl.textContent = task.category;

    const tagsEl = node.querySelector(".task-tags");
    tagsEl.textContent = task.tags.length
      ? task.tags.map((t) => "#" + t).join(" ")
      : "";

    node.querySelector(".edit-btn").addEventListener("click", () => {
      editTask(task.id);
    });
    node.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("このタスクを削除しますか？")) deleteTask(task.id);
    });

    return node;
  }

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = el.title.value.trim();
    if (!title) return;
    addTask({
      title,
      due: el.due.value,
      priority: el.priority.value,
      category: el.category.value.trim(),
      tags: parseTags(el.tags.value),
    });
    el.form.reset();
    el.priority.value = "medium";
    el.title.focus();
  });

  el.filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      el.filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      render();
    });
  });

  el.filterCategory.addEventListener("change", () => {
    state.category = el.filterCategory.value;
    render();
  });

  el.sortBy.addEventListener("change", () => {
    state.sortBy = el.sortBy.value;
    render();
  });

  el.clearDone.addEventListener("click", clearDone);

  load();
  render();
})();
