const tabLabel = document.getElementById('tab-label');
const wsTitle = document.getElementById('ws-title');
const queryQuote = document.getElementById('query-quote');
const stepsEl = document.getElementById('ws-steps');
const wsStream = document.getElementById('ws-stream');
const composerForm = document.getElementById('composer-form');
const composerInput = document.getElementById('composer-input');
const countArtifacts = document.getElementById('count-artifacts');
const countAgents = document.getElementById('count-agents');
const countSources = document.getElementById('count-sources');
const listArtifacts = document.getElementById('list-artifacts');
const listSources = document.getElementById('list-sources');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');

const title = sessionStorage.getItem('danube_workflow_title') || 'Support request resolution';
tabLabel.textContent = title;
wsTitle.textContent = title;
queryQuote.textContent = sessionStorage.getItem('danube_query')
  || 'I need help resolving a customer escalation about a delayed shipment.';

const resumeFrom = parseInt(sessionStorage.getItem('danube_resume_step') || '0', 10);

const plan = [
  {
    id: 'triage',
    label: 'Triage request',
    icon: '🎫',
    agents: 1,
    sources: [],
    skeletonLines: 3,
    finalHTML: `
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
  },
  {
    id: 'research1',
    label: 'Research similar tickets',
    icon: '🔍',
    agents: 1,
    sources: ['Ticket #48070', 'Ticket #47922'],
    skeletonLines: 2,
    finalHTML: `
      <div class="app-card research-card">
        <div class="research-item">#48070 — Delayed shipment, resolved via expedited reshipment</div>
        <div class="research-item">#47922 — Late delivery, resolved via refund + goodwill credit</div>
      </div>
    `,
  },
  {
    id: 'research2',
    label: 'Research knowledge base',
    icon: '📚',
    agents: 1,
    sources: ['KB: Shipping delay playbook', 'KB: Reshipment cost & courier policy', 'KB: Goodwill credit guidelines'],
    skeletonLines: 2,
    finalHTML: `
      <div class="app-card research-card">
        <div class="research-item">Article: Shipping delay resolution playbook</div>
        <div class="research-item">Article: Reshipment cost &amp; courier policy</div>
        <div class="research-item">Article: Goodwill credit guidelines</div>
      </div>
    `,
  },
  {
    id: 'draft',
    label: 'Draft resolution options',
    icon: '✎',
    agents: 2,
    sources: [],
    skeletonLines: 2,
    needsConfirm: true,
    finalHTML: `
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
  },
  {
    id: 'plan',
    label: 'Prepare execution plan',
    icon: '✓',
    agents: 1,
    sources: [],
    skeletonLines: 3,
    finalHTML: `
      <div class="checklist-card">
        <div class="checklist-item"><span class="check-circle">✓</span>Notify customer of resolution</div>
        <div class="checklist-item"><span class="check-circle">✓</span>Trigger reshipment workflow</div>
        <div class="checklist-item"><span class="check-circle">✓</span>Log resolution in CRM</div>
      </div>
    `,
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderSteps() {
  stepsEl.innerHTML = plan.map((s) => `
    <div class="ws-step pending" id="step-${s.id}">
      <span class="step-spinner"></span>
      <span>${s.label}</span>
    </div>
  `).join('');
}

function incrementCount(el, n) {
  if (!n) return;
  el.textContent = String(parseInt(el.textContent, 10) + n);
}

function addArtifact(label) {
  const item = document.createElement('div');
  item.className = 'ws-list-item';
  item.textContent = label;
  listArtifacts.appendChild(item);
}

function addSources(sources) {
  sources.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'ws-list-item';
    item.textContent = s;
    listSources.appendChild(item);
  });
}

function cardShell(step, innerHTML) {
  return `
    <div class="stream-card-header">
      <span class="stream-icon">${step.icon}</span>
      <h5>${step.label}</h5>
      <button class="expand-btn" type="button" aria-label="Expand">↗</button>
    </div>
    ${innerHTML}
  `;
}

function loadingInner(step) {
  const lines = Array.from({ length: step.skeletonLines }).map(() => '<div class="content-skel"></div>').join('');
  return `<div>${lines}</div>`;
}

function finalInner(step, instant) {
  let actionsHTML = '';
  if (step.needsConfirm) {
    actionsHTML = instant
      ? '<div class="card-actions"><span class="confirmed-tag">✓ Confirmed</span></div>'
      : '<div class="card-actions"><button class="btn-reject" type="button">Reject</button><button class="btn-confirm" type="button">Confirm</button></div>';
  }
  return `<div>${step.finalHTML}${actionsHTML}</div>`;
}

const confirmResolvers = {};

function waitForConfirm(id) {
  return new Promise((resolve) => { confirmResolvers[id] = resolve; });
}

function resolveConfirm(id) {
  if (confirmResolvers[id]) {
    confirmResolvers[id]();
    delete confirmResolvers[id];
  }
}

function wireConfirm(card, step) {
  const confirmBtn = card.querySelector('.btn-confirm');
  const rejectBtn = card.querySelector('.btn-reject');
  confirmBtn.addEventListener('click', () => {
    confirmBtn.disabled = true;
    rejectBtn.disabled = true;
    confirmBtn.textContent = 'Confirmed ✓';
    resolveConfirm(step.id);
  });
  rejectBtn.addEventListener('click', () => {
    confirmBtn.disabled = true;
    rejectBtn.disabled = true;
    rejectBtn.textContent = 'Noted';
    showToast('Feedback noted — proceeding with the alternate option.');
    resolveConfirm(step.id);
  });
}

async function runStep(step, instant) {
  const stepEl = document.getElementById(`step-${step.id}`);
  stepEl.classList.remove('pending');
  stepEl.classList.add('active');

  const card = document.createElement('div');
  card.className = 'stream-card';
  card.id = `card-${step.id}`;
  card.innerHTML = cardShell(step, loadingInner(step));
  wsStream.appendChild(card);
  card.scrollIntoView({ behavior: 'smooth', block: 'end' });

  if (!instant) {
    await delay(800 + Math.random() * 500);
  }

  card.innerHTML = cardShell(step, finalInner(step, instant));

  addArtifact(step.label);
  addSources(step.sources);
  incrementCount(countArtifacts, 1);
  incrementCount(countAgents, step.agents);
  incrementCount(countSources, step.sources.length);

  if (step.needsConfirm && !instant) {
    wireConfirm(card, step);
    await waitForConfirm(step.id);
  }

  stepEl.classList.remove('active');
  stepEl.classList.add('done');
}

function showToast(text) {
  toastText.textContent = text;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 4000);
}

async function run() {
  renderSteps();
  for (let i = 0; i < plan.length; i += 1) {
    await runStep(plan[i], i < resumeFrom);
  }
  showToast('Workflow complete — all tasks finished.');
}

run();

document.getElementById('toast-close').addEventListener('click', () => {
  toast.classList.remove('visible');
});

document.querySelectorAll('.ws-side-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ws-side-tab').forEach((t) => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.ws-panel').forEach((p) => {
      p.classList.toggle('active', p.id === `panel-${tab.dataset.tab}`);
    });
  });
});

composerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = composerInput.value.trim();
  if (!value) return;
  const block = document.createElement('div');
  block.className = 'quoted-msg quoted-msg-user';
  block.textContent = value;
  wsStream.appendChild(block);
  composerInput.value = '';
  block.scrollIntoView({ behavior: 'smooth', block: 'end' });
});

composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});
