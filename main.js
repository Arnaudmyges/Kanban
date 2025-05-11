document.addEventListener("DOMContentLoaded", () => {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentEditId = null;
  let statusFilter = "all";
  let priorityFilter = "all";
  const bsEditModal = new bootstrap.Modal(document.getElementById('editModal'));

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':   return 'danger';
      case 'medium': return 'warning';
      case 'low':    return 'success';
      default:       return 'secondary';
    }
  };

  const addTask = () => {
    const name = document.getElementById('taskName').value.trim();
    if (!name) return alert("Veuillez entrer un nom de tâche.");

    const newTask = {
      id: Date.now(),
      name,
      priority: "medium",
      content: "",
      status: "TO_DO",
      deleted: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    document.getElementById('taskName').value = '';
  };
  window.addTask = addTask;

  const renderTasks = () => {
    document.querySelectorAll('.column').forEach(col => {
      const status = col.getAttribute('data-status');
      col.innerHTML = `<h3>${status.replace('_', ' ')}</h3>`;
    });

    tasks
      .filter(t => !t.deleted)
      .filter(t => statusFilter === "all"   || t.status   === statusFilter)
      .filter(t => priorityFilter === "all" || t.priority === priorityFilter)
      .forEach(task => {
        const div = document.createElement('div');
        div.className = `task p-2 mb-2 border rounded bg-light`;
        div.draggable = true;
        const priorityLabel = {
          low:    '✅ LOW',
          medium: '⚠️ MEDIUM',
          high:   '🔥 HIGH'
        };
        div.innerHTML = `
          <strong>${task.name}</strong><br>
          <span class="badge bg-${getPriorityColor(task.priority)}">${priorityLabel[task.priority]}</span>
        `;

        const delBtn = document.createElement('button');
        delBtn.innerText = '🗑️';
        delBtn.className = 'btn btn-sm btn-danger float-end';
        delBtn.onclick = e => {
          e.stopPropagation();
          task.deleted = true;
          saveTasks();
          renderTasks();
        };
        div.appendChild(delBtn);

        div.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', task.id);
        });

        div.addEventListener('dblclick', () => openEditModal(task));

        document
          .querySelector(`.column[data-status="${task.status}"]`)
          .appendChild(div);
      });

    renderTrash();
  };

  const renderTrash = () => {
    const trash = document.getElementById('trash');
    trash.innerHTML = '';
    const deletedTasks = tasks.filter(t => t.deleted);
    if (deletedTasks.length === 0) {
      trash.innerText = "La corbeille est vide.";
      return;
    }
    deletedTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = `task p-2 mb-2 border rounded bg-secondary text-white`;
      div.textContent = task.name;

      const restoreBtn = document.createElement('button');
      restoreBtn.innerText = '↩️ Restaurer';
      restoreBtn.className = 'btn btn-sm btn-light ms-2';
      restoreBtn.onclick = () => {
        task.deleted = false;
        saveTasks();
        renderTasks();
      };

      div.appendChild(restoreBtn);
      trash.appendChild(div);
    });
  };

  const openEditModal = (task) => {
    currentEditId = task.id;
    document.getElementById('editName').value     = task.name;
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editContent').value  = task.content || "";
    bsEditModal.show();
  };

  document.getElementById('saveEdit').addEventListener('click', () => {
    const task = tasks.find(t => t.id === currentEditId);
    if (!task) return;
    task.name     = document.getElementById('editName').value.trim()     || task.name;
    task.priority = document.getElementById('editPriority').value       || task.priority;
    task.content  = document.getElementById('editContent').value.trim() || task.content;
    saveTasks();
    renderTasks();
    bsEditModal.hide();
  });

  document.querySelectorAll('.column').forEach(col => {
    col.addEventListener('dragover', e => e.preventDefault());
    col.addEventListener('drop',    e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const task = tasks.find(t => t.id == id);
      if (task) {
        task.status = col.getAttribute('data-status');
        saveTasks();
        renderTasks();
      }
    });
  });

  window.emptyTrash = () => {
    if (confirm("Supprimer définitivement toutes les tâches de la corbeille ?")) {
      tasks = tasks.filter(t => !t.deleted);
      saveTasks();
      renderTasks();
    }
  };

  document.getElementById('statusFilter').addEventListener('change', e => {
    statusFilter = e.target.value;
    renderTasks();
  });
  document.getElementById('priorityFilter').addEventListener('change', e => {
    priorityFilter = e.target.value;
    renderTasks();
  });

  renderTasks();
});
