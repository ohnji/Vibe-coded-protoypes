const form = document.getElementById('prompt-form');
const input = document.getElementById('prompt-input');
const hint = document.getElementById('prompt-hint');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) {
    hint.textContent = 'Type something to get started.';
    return;
  }
  sessionStorage.setItem('danube_query', value);
  window.location.href = 'workflow.html';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
