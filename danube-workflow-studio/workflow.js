const queryQuote = document.getElementById('query-quote');
const wfStream = document.getElementById('wf-stream');
const composerForm = document.getElementById('composer-form');
const composerInput = document.getElementById('composer-input');
const agentTpl = document.getElementById('agent-recommendation-tpl');

const query = sessionStorage.getItem('danube_query')
  || 'I need help resolving a customer escalation about a delayed shipment.';
queryQuote.textContent = query;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function appendBlock(html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  wfStream.appendChild(wrap);
  wrap.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return wrap;
}

function appendTyping() {
  return appendBlock('<p class="typing-line"><span class="typing-dots"><span></span><span></span><span></span></span></p>');
}

setTimeout(() => {
  const typing = appendTyping();
  setTimeout(() => {
    typing.remove();
    appendBlock(agentTpl.innerHTML);
  }, 1000);
}, 300);

composerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = composerInput.value.trim();
  if (!value) return;
  appendBlock(`<div class="quoted-msg quoted-msg-user">${escapeHtml(value)}</div>`);
  composerInput.value = '';

  const typing = appendTyping();
  setTimeout(() => {
    typing.remove();
    appendBlock('<p class="followup-text">Got it — let me know if you\'d like me to suggest a different workflow for that.</p>');
  }, 900 + Math.random() * 500);
});

composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composerForm.requestSubmit();
  }
});

wfStream.addEventListener('click', (e) => {
  const btn = e.target.closest('#start-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Creating workspace...';
  sessionStorage.setItem('danube_workflow_title', 'Support request resolution');
  sessionStorage.removeItem('danube_resume_step');
  setTimeout(() => {
    window.location.href = 'workspace.html';
  }, 700);
});
