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

btn.addEventListener('click', () => {
    if (input.value === "") return; // Don't add empty tasks
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
    <div class="d-flex align-items-center">
        <input class="form-check-input me-3 task-checkbox" type="checkbox">
        <span class="task-text text-break">${input.value}</span>
    </div>
    <button class="btn btn-danger btn-sm delete-btn">
        <i class="bi bi-trash-fill"></i>
    </button>
    `;

    const checkbox = li.querySelector('.task-checkbox');
    const taskText = li.querySelector('.task-text');
    checkbox.addEventListener('change', () => {
        if(checkbox.checked) {
            taskText.classList.add('completed');
        } else {
            taskText.classList.remove('completed');
        }
    });

    li.addEventListener('click', () => {
        li.classList.toggle('completed');
    });
    list.appendChild(li);

    input.value = "";
    const delBtn = li.querySelector('.delete-btn');
    delBtn.addEventListener('click', () => {
        li.remove(); // Removes the entire LI
        updateCounter();
    });
    updateCounter();
});

async function loadTasks() {
    const allTasks = [];

    try {
        // 1. Cargar desde API Local
        const localResponse = await fetch("/api/tasks");
        const localTasks = await localResponse.json();

        localTasks.forEach(item => {
            allTasks.push({
                ...item,
                source: "Local"
            });
        });

        // 2. Cargar desde Fuente Externa (si está configurada)
        const external = getExternalSource();
        if (external.url && external.name) {
            try {
                const externalResponse = await fetch(`${external.url}/api/tasks`);
                const externalTasks = await externalResponse.json();

                externalTasks.forEach(item => {
                    allTasks.push({
                        ...item,
                        source: external.name
                    });
                });
            } catch (error) {
                showToast();
            }
        }
    } catch (err) {
        console.error("Error loading local tasks:", err);
    }

    renderCards(allTasks);
}

/**
 * Borra una recomendación local por ID
 */
async function deleteLocalRecommendation(id) {
    await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

// --- Listeners de Eventos ---

// Formulario para añadir nueva recomendación local
tasksForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
        title: document.getElementById("title").value,
        type: document.getElementById("type").value,
        genre: document.getElementById("genre").value,
        year: document.getElementById("year").value || null,
        comment: document.getElementById("comment").value,
        rating: parseInt(document.getElementById("rating").value, 10),
        image_url: document.getElementById("image_url").value || null
    };

    await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    recommendationForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("addRecommendationModal")).hide();
    loadTasks();
});