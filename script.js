document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskNameInput = document.getElementById('task-name');
  const dueDateInput = document.getElementById('due-date');
  const priorityLevelSelect = document.getElementById('priority-level');
  const taskCategoryInput = document.getElementById('category'); // Updated ID
  const taskList = document.getElementById('task-list');
  const filterPriority = document.getElementById('filter-priority');
  const filterCategory = document.getElementById('filter-category');
  const filterDueDate = document.getElementById('filter-due-date');
  const sortBy = document.getElementById('sort-by');

  let tasks = [];

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
  });

  filterPriority.addEventListener('change', displayTasks);
  filterCategory.addEventListener('change', displayTasks);
  filterDueDate.addEventListener('change', displayTasks);
  sortBy.addEventListener('change', displayTasks);

  function addTask() {
    const task = {
      name: taskNameInput.value.trim(),
      dueDate: new Date(dueDateInput.value),
      priority: priorityLevelSelect.value,
      category: taskCategoryInput.value.trim(), // Correct category input
      completed: false
    };

    tasks.push(task);
    taskForm.reset();
    updateCategoryFilter();
    displayTasks();
    updateStatistics();
  }

  function removeTask(index) {
    tasks.splice(index, 1);
    displayTasks();
    updateStatistics();
  }

  function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    displayTasks();
    updateStatistics();
  }

  function filterTasks() {
    let filteredTasks = tasks.slice();

    if (filterPriority.value !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority.value);
    }

    if (filterCategory.value !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === filterCategory.value);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterDueDate.value === 'today') {
      filteredTasks = filteredTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (filterDueDate.value === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filteredTasks = filteredTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === tomorrow.getTime();
      });
    } else if (filterDueDate.value === 'upcoming') {
      filteredTasks = filteredTasks.filter(task => new Date(task.dueDate) > today);
    }

    return filteredTasks;
  }

  function sortTasks(tasksToSort) {
    switch (sortBy.value) {
      case 'due-date-asc':
        return tasksToSort.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'due-date-desc':
        return tasksToSort.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      case 'priority-high-low':
        return tasksToSort.sort((a, b) => {
          const priorities = { high: 3, medium: 2, low: 1 };
          return priorities[b.priority] - priorities[a.priority];
        });
      case 'priority-low-high':
        return tasksToSort.sort((a, b) => {
          const priorities = { high: 3, medium: 2, low: 1 };
          return priorities[a.priority] - priorities[b.priority];
        });
      case 'category':
        return tasksToSort.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return tasksToSort;
    }
  }

  function displayTasks() {
    taskList.innerHTML = '';
    const filteredTasks = filterTasks();
    const sortedTasks = sortTasks(filteredTasks);

    sortedTasks.forEach((task, index) => {
      const taskItem = document.createElement('li');
      taskItem.className = task.completed ? 'completed' : '';

      taskItem.innerHTML = `
        <span>${task.name} - ${task.dueDate.toDateString()} - ${task.priority} - ${task.category}</span>
        <button onclick="toggleTaskCompletion(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
        <button onclick="removeTask(${index})">Remove</button>
      `;

      taskList.appendChild(taskItem);
    });
  }

  function updateCategoryFilter() {
    const categories = Array.from(new Set(tasks.map(task => task.category)));
    filterCategory.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterCategory.appendChild(option);
    });
  }

  function updateStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
    const workTasks = tasks.filter(task => task.category === 'work').length;
    const personalTasks = tasks.filter(task => task.category === 'personal').length;

    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('high-priority-tasks').textContent = highPriorityTasks;
    document.getElementById('medium-priority-tasks').textContent = mediumPriorityTasks;
    document.getElementById('low-priority-tasks').textContent = lowPriorityTasks;
    document.getElementById('work-tasks').textContent = workTasks;
    document.getElementById('personal-tasks').textContent = personalTasks;

    if (totalTasks > 0) {
      const averageDueDate = new Date(tasks.reduce((sum, task) => sum + new Date(task.dueDate).getTime(), 0) / totalTasks);
      document.getElementById('average-due-date').textContent = averageDueDate.toDateString();

      const taskNames = tasks.map(task => task.name);
      const longestTaskName = taskNames.reduce((longest, name) => name.length > longest.length ? name : longest, '');
      const shortestTaskName = taskNames.reduce((shortest, name) => name.length < shortest.length ? name : shortest, taskNames[0]);

      document.getElementById('longest-task-name').textContent = longestTaskName;
      document.getElementById('shortest-task-name').textContent = shortestTaskName;
    } else {
      document.getElementById('average-due-date').textContent = 'N/A';
      document.getElementById('longest-task-name').textContent = 'N/A';
      document.getElementById('shortest-task-name').textContent = 'N/A';
    }
  }

  window.toggleTaskCompletion = toggleTaskCompletion;
  window.removeTask = removeTask;

  updateStatistics();
});
