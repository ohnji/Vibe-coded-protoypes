const wsTitle = document.getElementById('ws-title');
const activityLog = document.getElementById('activity-log');
const tabbar = document.getElementById('ws-tabbar');
const contentBlocks = document.getElementById('content-blocks');
const statusFloat = document.getElementById('status-float');
const completeToast = document.getElementById('complete-toast');
const toastClose = document.getElementById('toast-close');

toastClose.addEventListener('click', () => completeToast.classList.remove('visible'));

wsTitle.textContent = sessionStorage.getItem('danube_workflow_title') || 'Support request resolution';

const plan = [
  {
    id: 'triage',
    label: 'Triage request',
    tabLabel: 'Triage request',
  },
  {
    id: 'draft',
    label: 'Draft resolution options',
    tabLabel: 'Resolution options',
    children: [
      { id: 'research1', label: 'Research similar tickets' },
      { id: 'research2', label: 'Research knowledge base' },
      { id: 'draftA', label: 'Draft option A' },
      { id: 'draftB', label: 'Draft option B' },
    ],
  },
  {
    id: 'plan',
    label: 'Prepare execution plan',
    tabLabel: 'Execution plan',
  },
];

// Rich "finished app" views per task, keyed by task id.
const finalViews = {
  triage: `
    <div class="content-header"><h6>Triage request</h6></div>
    <div class="app-card ticket-card">
      <div class="app-card-header">
        <div>
          <div class="ticket-id">Ticket #48213</div>
          <div class="ticket-subject">Delayed shipment — order #10293</div>
        </div>
        <span class="pill pill-high">High priority</span>
      </div>
      <div class="ticket-fields">
        <div class="field"><span class="field-label">Category</span><span class="field-value">Shipping delay</span></div>
        <div class="field"><span class="field-label">Queue</span><span class="field-value">Fulfillment</span></div>
        <div class="field"><span class="field-label">Customer</span><span class="field-value">Alex Rivera</span></div>
        <div class="field"><span class="field-label">SLA</span><span class="field-value">4h remaining</span></div>
      </div>
    </div>
  `,
  draft: `
    <div class="content-header"><h6>Resolution options</h6></div>
    <div class="options-grid">
      <div class="option-card recommended">
        <div class="option-badge">Recommended</div>
        <h5>Expedited reshipment</h5>
        <p>Ship a replacement via overnight courier at no cost to the customer.</p>
        <div class="option-meta"><span>⏱ 1 business day</span><span>💲 $18 cost</span></div>
      </div>
      <div class="option-card">
        <h5>Refund with goodwill credit</h5>
        <p>Issue a full refund plus a $15 credit toward the customer's next order.</p>
        <div class="option-meta"><span>⏱ Immediate</span><span>💲 $65 cost</span></div>
      </div>
    </div>
  `,
  plan: `
    <div class="content-header"><h6>Execution plan</h6></div>
    <div class="checklist-card">
      <div class="checklist-item"><span class="check-circle">✓</span>Notify customer of resolution</div>
      <div class="checklist-item"><span class="check-circle">✓</span>Trigger reshipment workflow</div>
      <div class="checklist-item"><span class="check-circle">✓</span>Log resolution in CRM</div>
    </div>
  `,
};

const taskState = {}; // id -> 'running' | 'done'
let activeTaskId = null;

function renderActivityLog() {
  activityLog.innerHTML = plan.map((task) => `
    <div class="task-item" id="task-${task.id}">
      <span class="task-status" id="status-${task.id}"></span>
      <span>${task.label}</span>
    </div>
    ${task.children ? `<div class="task-children">
      ${task.children.map((c) => `
        <div class="task-item" id="task-${c.id}">
          <span class="task-status" id="status-${c.id}"></span>
          <span>${c.label}</span>
        </div>
      `).join('')}
    </div>` : ''}
  `).join('');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(id, state) {
  const el = document.getElementById(`status-${id}`);
  if (!el) return;
  el.classList.remove('running', 'done');
  if (state) el.classList.add(state);
}

function loadingView() {
  return `
    <div class="content-loading">
      <div class="content-skel w80"></div>
      <div class="content-skel w60"></div>
      <div class="content-skel w40"></div>
    </div>
  `;
}

function renderActiveContent() {
  if (!activeTaskId) return;
  contentBlocks.innerHTML = taskState[activeTaskId] === 'done'
    ? finalViews[activeTaskId]
    : loadingView();
}

function setActiveTab(id) {
  activeTaskId = id;
  document.querySelectorAll('.ws-filetab').forEach((t) => {
    t.classList.toggle('active', t.id === `tab-${id}`);
  });
  renderActiveContent();
}

function addTab(task) {
  taskState[task.id] = 'running';
  const tab = document.createElement('div');
  tab.className = 'ws-filetab';
  tab.id = `tab-${task.id}`;
  tab.innerHTML = `<span class="spinner-sm"></span><span>${task.tabLabel}</span>`;
  tab.addEventListener('click', () => setActiveTab(task.id));
  tabbar.appendChild(tab);
  setActiveTab(task.id);
}

function finishTab(task) {
  taskState[task.id] = 'done';
  const tab = document.getElementById(`tab-${task.id}`);
  if (tab) tab.querySelector('.spinner-sm').outerHTML = '<span class="check-sm">✓</span>';
  if (activeTaskId === task.id) renderActiveContent();
}

async function runStatusFloat() {
  statusFloat.classList.add('visible');
  const dots = statusFloat.querySelectorAll('.status-dot');
  dots.forEach((d) => d.classList.remove('active', 'done'));

  for (let i = 0; i < dots.length; i += 1) {
    dots[i].classList.add('active');
    await delay(450);
    dots[i].classList.remove('active');
    dots[i].classList.add('done');
  }
  statusFloat.classList.remove('visible');
}

async function runChildTask(child) {
  setStatus(child.id, 'running');
  await delay(650);
  setStatus(child.id, 'done');
}

async function runTopTask(task) {
  setStatus(task.id, 'running');
  addTab(task);
  const floatPromise = runStatusFloat();

  if (task.children) {
    for (const child of task.children) {
      await runChildTask(child);
    }
  }
  await floatPromise;

  setStatus(task.id, 'done');
  finishTab(task);
}

async function run() {
  renderActivityLog();
  for (const task of plan) {
    await runTopTask(task);
  }
  completeToast.classList.add('visible');
  setTimeout(() => completeToast.classList.remove('visible'), 5000);
}

run();
