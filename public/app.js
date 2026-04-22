const input = document.getElementById('task-input');
const btn = document.getElementById('add-btn');
const list = document.getElementById('task-list');
const title = document.querySelector('.app h1');
const counter = document.createElement('p');

counter.innerText = "Total Tasks: 0";

title.after(counter);

function updateCounter() {
    const total = list.children.length;
    counter.innerText = `Total Tasks: ${total}`;
}

async function loadTasks() {
    const allTasks = [];

    try {
        // 1. Cargar desde API Local
        const localResponse = await fetch("/api/tasks");
        const localTasks = await localResponse.json();

        list.innerHTML = ""

        localTasks.forEach(item => {
            renderTask(item);
        });
        updateCounter();

    } catch (err) {
        console.error("Error loading local tasks:", err);
    }
}

function renderTask(task) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    let checkedAttribute = "";
    let completedClass = "";

    if (task.completed) {
        checkedAttribute = "checked";
        completedClass = "completed";
    }

    li.innerHTML = `
    <div class="d-flex align-items-center">
        <input class="form-check-input me-3 task-checkbox" type="checkbox" ${checkedAttribute}>
        <span class="task-text text-break ${completedClass}">${task.title}</span>
    </div>
    <button class="btn btn-danger btn-sm delete-btn">
        <i class="bi bi-trash-fill"></i>
    </button>
    `;

    const checkbox = li.querySelector('.task-checkbox');
    const taskText = li.querySelector('.task-text');

    checkbox.addEventListener('change', async () => {
        await fetch(`/api/tasks/${task.id}/toggle`, { method: "PUT" });
        taskText.classList.toggle('completed', checkbox.checked);
    });

    const delBtn = li.querySelector('.delete-btn');
    delBtn.addEventListener('click', async () => {
        await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
        li.remove(); // Removes the entire LI
        updateCounter();
    });
    list.appendChild(li);
}

btn.addEventListener('click', async () => {
    const title = input.value.trim();
    if (title) {
        await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        })
        input.value = "";
        loadTasks();
    }
});

loadTasks();