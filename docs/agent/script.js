// ---------- Toast ----------
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
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    showToast(el.dataset.toast);
  });
});

// ---------- View switching: Home <-> Workspace ----------
const viewHome = document.getElementById('view-home');
const viewWorkspace = document.getElementById('view-workspace');

// URL of the standalone Ops Workspace (Blueprint) prototype. Clicking the
// "Watch Schedule - 82nd" workspace opens that app rather than the built-in
// mock workspace view. Relative so it resolves both locally and when the two
// prototypes are hosted as sibling folders on GitHub Pages
// (…/agent/ -> …/blueprint/).
const WATCH_SCHEDULE_URL = '../blueprint/';

function openWorkspace() {
  hidePopover();
  window.location.href = WATCH_SCHEDULE_URL;
}

function goHome() {
  viewWorkspace.hidden = true;
  viewHome.hidden = false;
  closeCtxMenu();
  hideAskPopup();
}

document.getElementById('ws-watch-schedule').addEventListener('click', openWorkspace);
document.getElementById('ws-back').addEventListener('click', goHome);

// ---------- Hover preview popover ----------
const wsItem = document.getElementById('ws-watch-schedule');
const popover = document.getElementById('ws-popover');
let popoverTimer = null;

function showPopover() {
  const rect = wsItem.getBoundingClientRect();
  popover.style.left = `${rect.right + 12}px`;
  popover.style.top = `${Math.max(12, rect.top - 20)}px`;
  popover.hidden = false;
  requestAnimationFrame(() => popover.classList.add('visible'));
}

function hidePopover() {
  popover.classList.remove('visible');
  setTimeout(() => { if (!popover.classList.contains('visible')) popover.hidden = true; }, 150);
}

wsItem.addEventListener('mouseenter', () => {
  clearTimeout(popoverTimer);
  popoverTimer = setTimeout(showPopover, 350);
});
wsItem.addEventListener('mouseleave', () => {
  clearTimeout(popoverTimer);
  hidePopover();
});
wsItem.addEventListener('click', () => {
  clearTimeout(popoverTimer);
  hidePopover();
});

// ---------- Prompt input autosize (home) ----------
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');

function autosize(el) {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
}
promptInput.addEventListener('input', () => autosize(promptInput));
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    promptForm.requestSubmit();
  }
});
promptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = promptInput.value.trim();
  if (!value) { promptInput.focus(); return; }
  showToast('Asking Claude 4.5 Sonnet…');
  promptInput.value = '';
  autosize(promptInput);
});

// Suggestion cards prefill the prompt
document.querySelectorAll('.suggestion-card').forEach((card) => {
  card.addEventListener('click', () => {
    promptInput.value = card.dataset.suggestion || card.querySelector('h3').textContent;
    autosize(promptInput);
    promptInput.focus();
  });
});

// Model selector dropdown (home)
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
  if (isOpen) { closeModelMenu(); }
  else { modelMenu.hidden = false; modelSelect.setAttribute('aria-expanded', 'true'); }
});
modelMenu.querySelectorAll('li').forEach((li) => {
  li.addEventListener('click', () => {
    modelMenu.querySelectorAll('li').forEach((el) => el.removeAttribute('aria-selected'));
    li.setAttribute('aria-selected', 'true');
    modelLabel.textContent = li.dataset.model;
    closeModelMenu();
  });
});

// ---------- Agent panel input (workspace) ----------
const agentForm = document.getElementById('agent-form');
const agentInput = document.getElementById('agent-input');
agentInput.addEventListener('input', () => autosize(agentInput));
agentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    agentForm.requestSubmit();
  }
});
agentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = agentInput.value.trim();
  if (!value) { agentInput.focus(); return; }
  showToast('Asking the workspace agent…');
  agentInput.value = '';
  autosize(agentInput);
});

// Tab switching (Watch Board active, others show toast via data-toast already)
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', (e) => {
    if (e.target.closest('.tab-close')) return;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// Rail buttons
document.querySelectorAll('.rail-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rail-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Agent pills
document.querySelectorAll('.pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// ---------- Right-click context menu on kanban cards ----------
const ctxMenu = document.getElementById('ctx-menu');
let ctxTargetCard = null;

function openCtxMenu(x, y, card) {
  ctxTargetCard = card;
  ctxMenu.hidden = false;
  const menuRect = ctxMenu.getBoundingClientRect();
  const left = Math.min(x, window.innerWidth - menuRect.width - 12);
  const top = Math.min(y, window.innerHeight - menuRect.height - 12);
  ctxMenu.style.left = `${left}px`;
  ctxMenu.style.top = `${top}px`;
}

function closeCtxMenu() {
  ctxMenu.hidden = true;
  ctxTargetCard = null;
}

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openCtxMenu(e.clientX, e.clientY, card);
  });
  // Left-click also opens the same menu anchored to the card, so the flow
  // is reachable without a real right-click (per "click anywhere to ask a question").
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = card.getBoundingClientRect();
    openCtxMenu(rect.right - 10, rect.top + 10, card);
  });
});

ctxMenu.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const action = btn.dataset.action;
    const card = ctxTargetCard;
    closeCtxMenu();
    if (action === 'ask' && card) {
      openAskPopup(card);
    } else if (card) {
      const ws = card.dataset.ws;
      const labels = { inspect: 'Inspecting', gaia: 'Opening in Gaia', copy: 'Link copied for', share: 'Sharing' };
      showToast(`${labels[action] || 'Opening'} ${ws}`);
    }
  });
});

document.addEventListener('click', (e) => {
  if (!ctxMenu.hidden && !ctxMenu.contains(e.target)) closeCtxMenu();
});
document.addEventListener('scroll', closeCtxMenu, true);

// ---------- Floating "ask workspace agent" popup ----------
const askPopup = document.getElementById('ask-popup');
const askPopupTitle = document.getElementById('ask-popup-title');
const askPopupForm = document.getElementById('ask-popup-form');
const askPopupInput = document.getElementById('ask-popup-input');

const sampleQuestions = {
  'RELIEF CHECKLIST': 'Can you find all events that are relevant to this one?',
  'EQUIPMENT CHECK': 'What flagged this equipment check, and is it still open?',
  'HANDOVER LOG': 'Summarize what changed in this handover log.',
  'COVERAGE CHECK': 'Why was this coverage check flagged?',
  'COVERAGE GAP': 'Who is responsible for closing this coverage gap?',
  'LOG REVIEW': 'What is outstanding before this log review can close?',
  'SIGN-OFF PENDING': 'Can you find all events that are relevant to this one?',
  'TURNOVER REVIEW': 'What changed since the last turnover review?',
};

function openAskPopup(card) {
  const kind = card.dataset.kind;
  const ws = card.dataset.ws;
  askPopupTitle.textContent = `${ws} Agent`;
  askPopupInput.value = sampleQuestions[kind] || 'Can you find all events that are relevant to this one?';
  askPopup.hidden = false;

  const cardRect = card.getBoundingClientRect();
  const popupWidth = 280;
  let left = cardRect.right + 14;
  if (left + popupWidth > window.innerWidth - 12) left = cardRect.left - popupWidth - 14;
  let top = cardRect.top;
  askPopup.style.left = `${Math.max(12, left)}px`;
  askPopup.style.top = `${Math.min(top, window.innerHeight - 140)}px`;

  requestAnimationFrame(() => {
    askPopupInput.focus();
    askPopupInput.select();
  });
}

function hideAskPopup() {
  askPopup.hidden = true;
}

askPopupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = askPopupInput.value.trim();
  if (!value) return;
  showToast(`Asked: "${value}"`);
  hideAskPopup();
});

document.addEventListener('click', (e) => {
  if (!askPopup.hidden && !askPopup.contains(e.target)) hideAskPopup();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hideAskPopup(); closeCtxMenu(); }
});
