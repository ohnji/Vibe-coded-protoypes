const queryText = document.getElementById('query-text');
const chatThread = document.getElementById('chat-thread');
const composerForm = document.getElementById('composer-form');
const composerInput = document.getElementById('composer-input');
const agentTpl = document.getElementById('agent-recommendation-tpl');

const query = sessionStorage.getItem('danube_query') || 'I need help resolving a customer escalation about a delayed shipment.';
queryText.textContent = query;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addMessage(role, contentHTML) {
  const row = document.createElement('div');
  row.className = `msg msg-${role}`;
  row.innerHTML = `
    <div class="avatar avatar-${role}">${role === 'user' ? 'JD' : '&#9678;'}</div>
    <div class="msg-body">${contentHTML}</div>
  `;
  chatThread.appendChild(row);
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return row;
}

function addTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'msg msg-agent';
  row.innerHTML = `
    <div class="avatar avatar-agent">&#9678;</div>
    <div class="msg-body">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  chatThread.appendChild(row);
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return row;
}

function respondAfterTyping(contentHTML, delayMs) {
  const typingRow = addTypingIndicator();
  setTimeout(() => {
    typingRow.remove();
    addMessage('agent', contentHTML);
  }, delayMs);
}

// Reveal the initial workflow recommendation as a "live" response instead of
// having it pre-rendered on page load.
respondAfterTyping(agentTpl.innerHTML, 1200);

composerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = composerInput.value.trim();
  if (!value) return;
  addMessage('user', `<p class="msg-text">${escapeHtml(value)}</p>`);
  composerInput.value = '';

  respondAfterTyping(
    `<p class="msg-text">Got it — let me know if you'd like me to suggest a different workflow for that.</p>`,
    1000 + Math.random() * 600
  );
});

composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

// The start button lives inside dynamically-inserted content, so bind via
// event delegation rather than looking it up once at load time.
chatThread.addEventListener('click', (e) => {
  const btn = e.target.closest('#start-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Creating workspace...';
  sessionStorage.setItem('danube_board_title', 'Patient discharge — John Doe');
  setTimeout(() => {
    window.location.href = 'board.html';
  }, 700);
});
