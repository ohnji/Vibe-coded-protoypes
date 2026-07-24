// Toast
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
let toastTimer = null;

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

document.querySelectorAll('[data-toast]').forEach((el) => {
  el.addEventListener('click', () => showToast(el.dataset.toast));
});

// Sidebar collapse
const sidebar = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapse-btn');
collapseBtn.addEventListener('click', () => {
  const collapsed = sidebar.classList.toggle('collapsed');
  collapseBtn.setAttribute('aria-pressed', String(collapsed));
});

// Nav items
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    if (item.dataset.nav !== 'home') {
      showToast(`${item.querySelector('.nav-label').textContent} is not available in this prototype`);
    }
  });
});

// Conversation selection
document.querySelectorAll('.conversation-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.conversation-item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');
    showToast(`Opening "${item.querySelector('.conversation-title').textContent}"`);
  });
});

// Prompt input autosize
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');

function autosize() {
  promptInput.style.height = 'auto';
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 160)}px`;
}
promptInput.addEventListener('input', autosize);

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    promptForm.requestSubmit();
  }
});

promptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = promptInput.value.trim();
  if (!value) {
    promptInput.focus();
    return;
  }
  showToast(`Asking ${document.getElementById('model-select-label').textContent}…`);
  promptInput.value = '';
  autosize();
});

// New button clears + focuses prompt
document.getElementById('new-btn').addEventListener('click', () => {
  document.querySelectorAll('.conversation-item').forEach((el) => el.classList.remove('active'));
  promptInput.value = '';
  autosize();
  promptInput.focus();
  showToast('Started a new conversation');
});

// Tool toggle buttons
document.querySelectorAll('.tool-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const active = btn.classList.toggle('active');
    btn.setAttribute('aria-pressed', String(active));
  });
});

// Model selector dropdown
const modelSelect = document.getElementById('model-select');
const modelMenu = document.getElementById('model-menu');
const modelLabel = document.getElementById('model-select-label');

function closeModelMenu() {
  modelMenu.hidden = true;
  modelSelect.setAttribute('aria-expanded', 'false');
}

modelSelect.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !modelMenu.hidden;
  if (isOpen) {
    closeModelMenu();
  } else {
    modelMenu.hidden = false;
    modelSelect.setAttribute('aria-expanded', 'true');
  }
});

modelMenu.querySelectorAll('li').forEach((li) => {
  li.addEventListener('click', () => {
    modelMenu.querySelectorAll('li').forEach((el) => el.removeAttribute('aria-selected'));
    li.setAttribute('aria-selected', 'true');
    modelLabel.textContent = li.dataset.model;
    closeModelMenu();
  });
});

document.addEventListener('click', (e) => {
  if (!modelMenu.hidden && !modelMenu.contains(e.target)) closeModelMenu();
});

// Suggestion cards prefill the prompt
document.querySelectorAll('.suggestion-card').forEach((card) => {
  card.addEventListener('click', () => {
    promptInput.value = card.dataset.suggestion || card.querySelector('h3').textContent;
    autosize();
    promptInput.focus();
  });
});
