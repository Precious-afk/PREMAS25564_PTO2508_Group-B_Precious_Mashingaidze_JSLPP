/**
 * Kanban App - Main JavaScript File
 * 
 * This file contains all the JavaScript functionality for the Kanban application.
 * It handles task management, local storage persistence, API fetching,
 * theme toggling, and UI interactions.
 * 
 * @author JSL Portfolio
 * @version 1.0.0
 */

// ==========================================================================
// Constants
// ==========================================================================

/**
 * API URL for fetching initial tasks
 * @constant {string}
 */
const API_URL = 'https://jsl-kanban-api.vercel.app/';

/**
 * Local storage key for persisting tasks
 * @constant {string}
 */
const STORAGE_KEY = 'kanban-tasks';

/**
 * Local storage key for theme preference
 * @constant {string}
 */
const THEME_STORAGE_KEY = 'kanban-theme';

// ==========================================================================
// State Management
// ==========================================================================

/**
 * Application state object
 * @type {Object}
 * @property {Array} tasks - Array of task objects
 * @property {boolean} isLoading - Loading state flag
 * @property {string|null} error - Error message if any
 * @property {string} theme - Current theme ('light' or 'dark')
 */
const state = {
  tasks: [],
  isLoading: true,
  error: null,
  theme: 'light'
};

// ==========================================================================
// DOM Elements
// ==========================================================================

/**
 * Cache of DOM element references for performance
 * @type {Object}
 */
const elements = {
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  hideSidebarBtn: document.getElementById('hide-sidebar-btn'),
  showSidebarBtn: document.getElementById('show-sidebar-btn'),
  
  // Header
  headerLogo: document.getElementById('header-logo'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  addTaskBtn: document.getElementById('add-task-btn'),
  
  // Theme toggles
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  mobileThemeToggleBtn: document.getElementById('mobile-theme-toggle-btn'),
  
  // Board
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  errorDetails: document.getElementById('error-details'),
  retryBtn: document.getElementById('retry-btn'),
  columnsContainer: document.getElementById('columns-container'),
  
  // Mobile menu
  mobileMenuOverlay: document.getElementById('mobile-menu-overlay'),
  
  // Task modal
  taskModal: document.getElementById('task-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  taskForm: document.getElementById('task-form'),
  taskIdInput: document.getElementById('task-id'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskDescriptionInput: document.getElementById('task-description-input'),
  taskStatusSelect: document.getElementById('task-status-select'),
  taskPrioritySelect: document.getElementById('task-priority-select'),
  taskSubmitBtn: document.getElementById('task-submit-btn'),
  taskDeleteBtn: document.getElementById('task-delete-btn'),
  
  // Delete modal
  deleteModal: document.getElementById('delete-modal'),
  deleteTaskName: document.getElementById('delete-task-name'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
  cancelDeleteBtn: document.getElementById('cancel-delete-btn')
};

// ==========================================================================
// Local Storage Functions
// ==========================================================================

/**
 * Saves tasks to local storage
 * @param {Array} tasks - Array of task objects to save
 * @returns {void}
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

/**
 * Loads tasks from local storage
 * @returns {Array|null} Array of tasks or null if not found
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return null;
  }
}

/**
 * Checks if tasks exist in local storage
 * @returns {boolean} True if tasks exist
 */
function hasStoredTasks() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Saves theme preference to local storage
 * @param {string} theme - Theme name ('light' or 'dark')
 * @returns {void}
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

/**
 * Loads theme preference from local storage
 * @returns {string} Theme name, defaults to 'light'
 */
function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
    return 'light';
  }
}

// ==========================================================================
// API Functions
// ==========================================================================

/**
 * Fetches tasks from the API
 * @returns {Promise<Array>} Promise resolving to array of tasks
 * @throws {Error} If fetch fails
 */
async function fetchTasks() {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// ==========================================================================
// Task Management Functions
// ==========================================================================

/**
 * Generates a unique ID for new tasks
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Priority weight for sorting (higher number = higher priority)
 * @constant {Object}
 */
const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1
};

/**
 * Gets tasks filtered by status and sorted by priority (high to low)
 * @param {string} status - Task status ('todo', 'doing', 'done')
 * @returns {Array} Filtered and sorted array of tasks
 */
function getTasksByStatus(status) {
  return state.tasks
    .filter(task => task.status === status)
    .sort((a, b) => {
      const priorityA = PRIORITY_WEIGHT[a.priority] || PRIORITY_WEIGHT.medium;
      const priorityB = PRIORITY_WEIGHT[b.priority] || PRIORITY_WEIGHT.medium;
      return priorityB - priorityA; // High priority first
    });
}

/**
 * Finds a task by its ID
 * @param {string} id - Task ID
 * @returns {Object|undefined} Task object or undefined
 */
function findTaskById(id) {
  return state.tasks.find(task => task.id === id);
}

/**
 * Adds a new task to the state and storage
 * @param {Object} taskData - Task data (title, description, status, priority)
 * @returns {Object} The created task
 */
function addTask(taskData) {
  const newTask = {
    id: generateId(),
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium'
  };
  
  state.tasks.push(newTask);
  saveTasks(state.tasks);
  return newTask;
}

/**
 * Updates an existing task
 * @param {string} id - Task ID
 * @param {Object} updates - Object with properties to update
 * @returns {Object|null} Updated task or null if not found
 */
function updateTask(id, updates) {
  const index = state.tasks.findIndex(task => task.id === id);
  
  if (index === -1) return null;
  
  state.tasks[index] = { ...state.tasks[index], ...updates };
  saveTasks(state.tasks);
  return state.tasks[index];
}

/**
 * Deletes a task by ID
 * @param {string} id - Task ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteTask(id) {
  const index = state.tasks.findIndex(task => task.id === id);
  
  if (index === -1) return false;
  
  state.tasks.splice(index, 1);
  saveTasks(state.tasks);
  return true;
}

// ==========================================================================
// UI Rendering Functions
// ==========================================================================

/**
 * Shows the loading state UI
 * @returns {void}
 */
function showLoading() {
  elements.loadingState.classList.remove('hidden');
  elements.errorState.classList.add('hidden');
  elements.columnsContainer.classList.add('hidden');
}

/**
 * Shows the error state UI
 * @param {string} message - Error message to display
 * @returns {void}
 */
function showError(message) {
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.remove('hidden');
  elements.columnsContainer.classList.add('hidden');
  elements.errorDetails.textContent = message;
}

/**
 * Shows the board columns UI
 * @returns {void}
 */
function showBoard() {
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.columnsContainer.classList.remove('hidden');
}

/**
 * Gets the priority class name for styling
 * @param {string} priority - Priority level ('high', 'medium', 'low')
 * @returns {string} CSS class name
 */
function getPriorityClass(priority) {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'priority-medium';
  }
}

/**
 * Creates a task card DOM element
 * @param {Object} task - Task object
 * @returns {HTMLElement} Task card element
 */
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.taskId = task.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Edit task: ${task.title}`);
  
  const priority = task.priority || 'medium';
  const priorityClass = getPriorityClass(priority);
  
  card.innerHTML = `
    <div class="task-content">
      <h3 class="task-title">${escapeHtml(task.title)}</h3>
      <p class="task-subtasks">0 of 0 subtasks</p>
    </div>
    <div class="priority-indicator ${priorityClass}" title="${priority.charAt(0).toUpperCase() + priority.slice(1)} priority"></div>
  `;
  
  // Click handler
  card.addEventListener('click', () => openEditTaskModal(task.id));
  
  // Keyboard handler for accessibility
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEditTaskModal(task.id);
    }
  });
  
  return card;
}

/**
 * Escapes HTML characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders all task cards in their respective columns
 * @returns {void}
 */
function renderTasks() {
  const statuses = ['todo', 'doing', 'done'];
  
  statuses.forEach(status => {
    const tasksList = document.querySelector(`.tasks-list[data-status="${status}"]`);
    const taskCount = document.querySelector(`.column[data-status="${status}"] .task-count`);
    
    if (!tasksList || !taskCount) return;
    
    // Clear existing tasks
    tasksList.innerHTML = '';
    
    // Get and render tasks for this status
    const tasks = getTasksByStatus(status);
    taskCount.textContent = tasks.length;
    
    tasks.forEach(task => {
      const card = createTaskCard(task);
      tasksList.appendChild(card);
    });
  });
}

// ==========================================================================
// Theme Functions
// ==========================================================================

/**
 * Applies the specified theme to the document
 * @param {string} theme - Theme name ('light' or 'dark')
 * @returns {void}
 */
function applyTheme(theme) {
  state.theme = theme;
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  
  // Update toggle buttons
  const isDark = theme === 'dark';
  elements.themeToggleBtn.setAttribute('aria-checked', isDark.toString());
  elements.mobileThemeToggleBtn.setAttribute('aria-checked', isDark.toString());
  
  saveTheme(theme);
}

/**
 * Toggles between light and dark themes
 * @returns {void}
 */
function toggleTheme() {
  const newTheme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// ==========================================================================
// Sidebar Functions
// ==========================================================================

/**
 * Hides the sidebar
 * @returns {void}
 */
function hideSidebar() {
  elements.sidebar.classList.add('hidden');
  elements.showSidebarBtn.classList.remove('hidden');
  elements.headerLogo.classList.remove('hidden');
}

/**
 * Shows the sidebar
 * @returns {void}
 */
function showSidebar() {
  elements.sidebar.classList.remove('hidden');
  elements.showSidebarBtn.classList.add('hidden');
  elements.headerLogo.classList.add('hidden');
}

// ==========================================================================
// Mobile Menu Functions
// ==========================================================================

/**
 * Opens the mobile menu
 * @returns {void}
 */
function openMobileMenu() {
  elements.mobileMenuOverlay.classList.remove('hidden');
  elements.mobileMenuBtn.classList.add('active');
}

/**
 * Closes the mobile menu
 * @returns {void}
 */
function closeMobileMenu() {
  elements.mobileMenuOverlay.classList.add('hidden');
  elements.mobileMenuBtn.classList.remove('active');
}

/**
 * Toggles the mobile menu
 * @returns {void}
 */
function toggleMobileMenu() {
  if (elements.mobileMenuOverlay.classList.contains('hidden')) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
}

// ==========================================================================
// Modal Functions
// ==========================================================================

/**
 * Opens the task modal for adding a new task
 * @returns {void}
 */
function openAddTaskModal() {
  elements.modalTitle.textContent = 'Add New Task';
  elements.taskSubmitBtn.textContent = 'Create Task';
  elements.taskDeleteBtn.classList.add('hidden');
  
  // Reset form
  elements.taskIdInput.value = '';
  elements.taskTitleInput.value = '';
  elements.taskDescriptionInput.value = '';
  elements.taskStatusSelect.value = 'todo';
  elements.taskPrioritySelect.value = 'medium';
  
  elements.taskModal.classList.remove('hidden');
  elements.taskTitleInput.focus();
}

/**
 * Opens the task modal for editing an existing task
 * @param {string} taskId - ID of task to edit
 * @returns {void}
 */
function openEditTaskModal(taskId) {
  const task = findTaskById(taskId);
  
  if (!task) return;
  
  elements.modalTitle.textContent = 'Task';
  elements.taskSubmitBtn.textContent = 'Save Changes';
  elements.taskDeleteBtn.classList.remove('hidden');
  
  // Populate form
  elements.taskIdInput.value = task.id;
  elements.taskTitleInput.value = task.title;
  elements.taskDescriptionInput.value = task.description || '';
  elements.taskStatusSelect.value = task.status;
  elements.taskPrioritySelect.value = task.priority || 'medium';
  
  elements.taskModal.classList.remove('hidden');
  elements.taskTitleInput.focus();
}

/**
 * Closes the task modal
 * @returns {void}
 */
function closeTaskModal() {
  elements.taskModal.classList.add('hidden');
}

/**
 * Opens the delete confirmation modal
 * @param {string} taskId - ID of task to delete
 * @returns {void}
 */
function openDeleteModal(taskId) {
  const task = findTaskById(taskId);
  
  if (!task) return;
  
  elements.deleteTaskName.textContent = task.title;
  elements.deleteModal.dataset.taskId = taskId;
  elements.deleteModal.classList.remove('hidden');
}

/**
 * Closes the delete confirmation modal
 * @returns {void}
 */
function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  delete elements.deleteModal.dataset.taskId;
}

// ==========================================================================
// Form Handlers
// ==========================================================================

/**
 * Handles task form submission
 * @param {Event} e - Submit event
 * @returns {void}
 */
function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  const taskId = elements.taskIdInput.value;
  const title = elements.taskTitleInput.value.trim();
  const description = elements.taskDescriptionInput.value.trim();
  const status = elements.taskStatusSelect.value;
  const priority = elements.taskPrioritySelect.value;
  
  if (!title) return;
  
  if (taskId) {
    // Update existing task
    updateTask(taskId, { title, description, status, priority });
  } else {
    // Create new task
    addTask({ title, description, status, priority });
  }
  
  renderTasks();
  closeTaskModal();
}

/**
 * Handles delete button click in task modal
 * @returns {void}
 */
function handleDeleteClick() {
  const taskId = elements.taskIdInput.value;
  if (taskId) {
    closeTaskModal();
    openDeleteModal(taskId);
  }
}

/**
 * Handles confirm delete button click
 * @returns {void}
 */
function handleConfirmDelete() {
  const taskId = elements.deleteModal.dataset.taskId;
  
  if (taskId) {
    deleteTask(taskId);
    renderTasks();
  }
  
  closeDeleteModal();
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

/**
 * Sets up all event listeners for the application
 * @returns {void}
 */
function setupEventListeners() {
  // Sidebar toggle
  elements.hideSidebarBtn.addEventListener('click', hideSidebar);
  elements.showSidebarBtn.addEventListener('click', showSidebar);
  
  // Mobile menu
  elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  elements.mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === elements.mobileMenuOverlay) {
      closeMobileMenu();
    }
  });
  
  // Theme toggles
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  
  // Add task button
  elements.addTaskBtn.addEventListener('click', openAddTaskModal);
  
  // Task modal
  elements.modalCloseBtn.addEventListener('click', closeTaskModal);
  elements.taskForm.addEventListener('submit', handleTaskFormSubmit);
  elements.taskDeleteBtn.addEventListener('click', handleDeleteClick);
  
  // Close modal on overlay click
  elements.taskModal.querySelector('.modal-overlay').addEventListener('click', closeTaskModal);
  
  // Delete modal
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);
  
  // Retry button
  elements.retryBtn.addEventListener('click', initializeApp);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!elements.deleteModal.classList.contains('hidden')) {
        closeDeleteModal();
      } else if (!elements.taskModal.classList.contains('hidden')) {
        closeTaskModal();
      } else if (!elements.mobileMenuOverlay.classList.contains('hidden')) {
        closeMobileMenu();
      }
    }
  });
}

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initializes the application
 * Loads theme, fetches/loads tasks, and renders the UI
 * @returns {Promise<void>}
 */
async function initializeApp() {
  // Load and apply theme
  const savedTheme = loadTheme();
  applyTheme(savedTheme);
  
  // Show loading state
  showLoading();
  state.isLoading = true;
  state.error = null;
  
  try {
    // Check for stored tasks first
    if (hasStoredTasks()) {
      const storedTasks = loadTasks();
      if (storedTasks && storedTasks.length > 0) {
        state.tasks = storedTasks;
        state.isLoading = false;
        showBoard();
        renderTasks();
        return;
      }
    }
    
    // Fetch from API if no stored tasks
    const apiTasks = await fetchTasks();
    state.tasks = apiTasks;
    saveTasks(apiTasks);
    state.isLoading = false;
    showBoard();
    renderTasks();
    
  } catch (error) {
    state.isLoading = false;
    state.error = error.message;
    showError(error.message);
  }
}

// ==========================================================================
// App Entry Point
// ==========================================================================

/**
 * Main entry point - runs when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initializeApp();
});
