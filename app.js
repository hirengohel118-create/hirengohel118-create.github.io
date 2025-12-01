// Basic app.js: tab switching, modals, theme toggle
document.addEventListener('DOMContentLoaded', function(){
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const tabName = t.dataset.tab;
    views.forEach(v => v.classList.toggle('hidden', v.id !== tabName));
    // focus first input in that view for convenience
    const visibleInput = document.querySelector('#' + tabName + ' input');
    if(visibleInput) visibleInput.focus();
  }));

  // Modals
  const leadModal = document.getElementById('leadModal');
  const projectModal = document.getElementById('projectModal');
  document.getElementById('newLeadBtn').addEventListener('click', () => {
    leadModal.setAttribute('aria-hidden','false');
  });
  document.getElementById('newProjectBtn').addEventListener('click', () => {
    projectModal.setAttribute('aria-hidden','false');
  });
  document.getElementById('closeLeadModal').addEventListener('click', ()=>leadModal.setAttribute('aria-hidden','true'));
  document.getElementById('closeProjectModal').addEventListener('click', ()=>projectModal.setAttribute('aria-hidden','true'));
  document.getElementById('leadForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    leadModal.setAttribute('aria-hidden','true');
    alert('Lead saved (demo).');
  });
  document.getElementById('projectForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    projectModal.setAttribute('aria-hidden','true');
    alert('Project saved (demo).');
  });

  // Theme toggle (persist)
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('crm_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
  const saved = localStorage.getItem('crm_theme') || 'dark';
  if(saved === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
});
