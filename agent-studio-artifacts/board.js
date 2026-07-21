const boardTitle = document.getElementById('board-title');
const grid = document.getElementById('board-grid');
const filterPills = document.querySelectorAll('.filter-pill');
const agentSwitcher = document.getElementById('agent-switcher');
const composerForm = document.getElementById('composer-form');
const composerInput = document.getElementById('composer-input');
const composerTag = document.getElementById('composer-tag');
const composerTagDot = document.getElementById('composer-tag-dot');
const composerTagLabel = document.getElementById('composer-tag-label');
const composerTagRemove = document.getElementById('composer-tag-remove');
const toast = document.getElementById('board-toast');
const toastText = document.getElementById('board-toast-text');
const toastClose = document.getElementById('board-toast-close');

boardTitle.textContent = sessionStorage.getItem('danube_board_title') || 'Patient discharge — John Doe';

const agents = {
  scheduler: { label: '@Scheduler agent', dotClass: 'agent-dot-scheduler' },
  writer: { label: '@Writer agent', dotClass: 'agent-dot-writer' },
  logistic: { label: '@Logistic agents', dotClass: 'agent-dot-logistic' },
};

const cards = [
  { id: 'patient', title: 'John Doe', preview: 'blank', badge: 'scheduler', category: 'sources' },
  { id: 'similar', title: 'Similar patients', preview: 'blank', badge: 'scheduler', category: 'sources' },
  { id: 'summary', title: 'Discharge summary', preview: 'blue', badge: 'logistic', category: 'artifacts' },
  { id: 'schedule', title: 'Patient schedule', preview: 'blue', category: 'artifacts' },
  { id: 'sched-approval', type: 'action', variant: 'amber', text: 'Scheduler agent needs your approval', actions: [{ label: 'Open', kind: 'open' }], category: 'artifacts' },
  { id: 'log-approval', type: 'action', variant: 'dark', text: 'Logistic agent needs your approval, creating new resource', actions: [{ label: 'Reject', kind: 'reject' }, { label: 'Approve', kind: 'approve' }], category: 'artifacts' },
  { id: 'filler-1', preview: 'blank', category: 'sources' },
  { id: 'filler-2', preview: 'blank', category: 'artifacts' },
  { id: 'filler-3', preview: 'blank', category: 'sources' },
];

function cardHTML(card) {
  if (card.type === 'action') {
    const buttonsHTML = card.actions.map((a) => `
      <button class="action-btn ${a.kind === 'approve' ? 'primary' : ''} ${a.kind === 'reject' ? 'reject' : ''}" data-kind="${a.kind}" data-card="${card.id}">${a.label}</button>
    `).join('');
    return `
      <div class="art-card action-card action-${card.variant}" id="card-${card.id}">
        <div class="action-icon"></div>
        <p class="action-text">${card.text}</p>
        <div class="action-buttons">${buttonsHTML}</div>
      </div>
    `;
  }

  const badgeHTML = card.badge ? `
    <span class="art-badge badge-${card.badge}"></span>
  ` : '';

  const dotClass = card.preview === 'blue' ? 'dot-doc' : 'dot-blank';

  return `
    <div class="art-card" data-category="${card.category}">
      <div class="art-preview preview-${card.preview}">${badgeHTML}</div>
      <div class="art-footer"><span class="art-footer-dot ${dotClass}"></span>${card.title || ''}</div>
    </div>
  `;
}

function renderGrid(filter) {
  const visible = filter === 'all' ? cards : cards.filter((c) => c.category === filter);
  grid.innerHTML = visible.map(cardHTML).join('');
}

renderGrid('all');

filterPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    filterPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    renderGrid(pill.dataset.filter);
  });
});

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('visible'), 3500);
}

toastClose.addEventListener('click', () => toast.classList.remove('visible'));

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  const card = document.getElementById(`card-${btn.dataset.card}`);
  const kind = btn.dataset.kind;

  if (kind === 'open') {
    showToast('Opening scheduler details…');
    return;
  }

  if (card && !card.classList.contains('resolved')) {
    card.classList.add('resolved');
    const text = card.querySelector('.action-text');
    const buttons = card.querySelector('.action-buttons');
    if (kind === 'approve') {
      text.textContent = 'Approved — creating new resource.';
      showToast('Approved.');
    } else {
      text.textContent = 'Rejected.';
      showToast('Rejected.');
    }
    if (buttons) buttons.remove();
  }
});

function setActiveAgent(key) {
  const agent = agents[key];
  if (!agent) return;
  composerTagLabel.textContent = agent.label;
  composerTagDot.className = `composer-tag-dot ${agent.dotClass}`;
  composerTag.style.display = 'flex';

  document.querySelectorAll('.agent-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.agent === key);
  });
}

agentSwitcher.addEventListener('click', (e) => {
  const tab = e.target.closest('.agent-tab');
  if (!tab) return;
  setActiveAgent(tab.dataset.agent);
});

composerTagRemove.addEventListener('click', () => {
  composerTag.style.display = 'none';
});

composerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = composerInput.value.trim();
  if (!value) return;
  const activeTab = document.querySelector('.agent-tab.active');
  const agentLabel = activeTab ? activeTab.querySelector('span:nth-child(2)').textContent : 'the agent';
  showToast(`Sent to ${agentLabel}.`);
  composerInput.value = '';
});

composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

document.addEventListener('keydown', (e) => {
  if (!e.metaKey && !e.ctrlKey) return;
  const map = { '1': 'scheduler', '2': 'writer', '3': 'logistic' };
  const key = map[e.key];
  if (!key) return;
  e.preventDefault();
  setActiveAgent(key);
});
