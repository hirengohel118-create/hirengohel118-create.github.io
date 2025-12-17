
// UPDATED APP.JS – Project Card Edit Details Added (RE-UPLOAD)
(() => {
  const $ = id => document.getElementById(id);

  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  let editingProjectIndex = null;

  function saveProjects(){
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  function renderProjects(){
    const list = $('projectsList');
    if(!list) return;
    list.innerHTML = '';

    if(!projects.length){
      $('emptyProjects') && ($('emptyProjects').style.display='block');
      return;
    }
    $('emptyProjects') && ($('emptyProjects').style.display='none');

    projects.forEach((p, idx)=>{
      const card = document.createElement('div');
      card.className = 'item-card';

      const header = document.createElement('div');
      header.className = 'item-header-row';
      header.innerHTML = `
        <div class="item-title">${p.name || 'Untitled Project'}</div>
        <div class="item-actions">
          <button class="mini-btn share">Share</button>
          <button class="mini-btn delete">Delete</button>
        </div>
      `;

      const editWrap = document.createElement('div');
      editWrap.style.display = 'none';
      editWrap.innerHTML = `<button class="mini-btn edit">✏️ Edit Details</button>`;

      card.appendChild(header);
      card.appendChild(editWrap);

      card.addEventListener('click', (e)=>{
        if(e.target.closest('.mini-btn')) return;
        editWrap.style.display = editWrap.style.display === 'none' ? 'block' : 'none';
      });

      header.querySelector('.share').onclick = (e)=>{
        e.stopPropagation();
        const msg = `🏢 ${p.name}\n📍 ${p.location || ''}\n🛏 ${p.config || ''}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
      };

      header.querySelector('.delete').onclick = (e)=>{
        e.stopPropagation();
        if(confirm('Delete this project?')){
          projects.splice(idx,1);
          saveProjects();
          renderProjects();
        }
      };

      editWrap.querySelector('.edit').onclick = (e)=>{
        e.stopPropagation();
        editingProjectIndex = idx;
        openProjectModal(p);
      };

      list.appendChild(card);
    });
  }

  function openProjectModal(p){
    const modal = document.getElementById('projectModal');
    modal.classList.remove('hidden');
    document.getElementById('projectName').value = p.name || '';
    document.getElementById('projectLocation').value = p.location || '';
    document.getElementById('projectConfig').value = p.config || '';
  }

  document.getElementById('btnSaveProject')?.addEventListener('click', ()=>{
    const obj = {
      name: document.getElementById('projectName').value,
      location: document.getElementById('projectLocation').value,
      config: document.getElementById('projectConfig').value
    };
    if(editingProjectIndex !== null){
      projects[editingProjectIndex] = obj;
      editingProjectIndex = null;
    } else {
      projects.unshift(obj);
    }
    saveProjects();
    renderProjects();
    document.getElementById('projectModal').classList.add('hidden');
  });

  renderProjects();
})();
