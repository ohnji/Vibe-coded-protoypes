const form = document.getElementById('prompt-form');
const input = document.getElementById('prompt-input');
const hint = document.getElementById('prompt-hint');

function goToWorkflow(query) {
  sessionStorage.setItem('danube_query', query);
  sessionStorage.removeItem('danube_resume_step');
  window.location.href = 'workflow.html';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) {
    hint.textContent = 'Type something to get started.';
    return;
  }
  goToWorkflow(value);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll('.template-card').forEach((card) => {
  card.addEventListener('click', () => {
    goToWorkflow(card.dataset.query);
  });
});

document.querySelectorAll('.progress-card').forEach((card) => {
  card.addEventListener('click', () => {
    sessionStorage.setItem('danube_workflow_title', card.dataset.title);
    sessionStorage.setItem('danube_resume_step', card.dataset.resume || '0');
    sessionStorage.setItem(
      'danube_query',
      'I need help resolving a customer escalation about a delayed shipment.'
    );
    window.location.href = 'workspace.html';
  });
});
