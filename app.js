/* Vamika Estate CRM - client side app
  - LocalStorage based
  - Leads (add/edit/delete)
  - Follow-ups badge (today & overdue)
  - Call / WhatsApp quick actions
  - Projects (basic)
  - Settings: theme, accent, logo, export & backup
*/

(() => {
  // helpers
  const $ = id => document.getElementById(id);
  const qs = sel => document.querySelector(sel);
  const qsa = sel => document.querySelectorAll(sel);

  // data
  let leads = JSON.parse(localStorage.getItem('leads') || '[]');
  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  let settings = JSON.parse(localStorage.getItem('vem_settings') || '{}');

  // elements
  const leadList = $('leadList');
  const followList = $('followList');
  const badge = $('badge');
  const totalLeads = $('totalLeads');
  const totalProjects = $('totalProjects');

  // initial settings defaults
  if (!settings.accent) settings.accent = '#3B82F6';
  if (!settings.bizName) settings.bizName = 'Vamika Estate';
  if (!settings.owner) settings.owner = 'Hiren Gohel';
  if (!settings.ownerPhone) settings.ownerPhone = '7046869462';
  if (!('mode' in settings)) settings.mode = 'light';

  // apply settings UI
  function applySettingsToUI(){
    document.body.style.setProperty('--accent', settings.accent);
    $('bizName').value = settings.bizName || '';
    $('ownerName').value = settings.owner || '';
    $('ownerPhoneInput').value = settings.ownerPhone || '';
    $('ownerPhone').innerText = settings.ownerPhone || '';
    $('accentColor').value = settings.accent || '#3B82F6';
    const logoData = settings.logoData || '';
    if(logoData){
      $('logoImg').src = logoData;
      $('logoImg').style.display = 'block';
      $('logoPlaceholder').style.display = 'none';
    } else {
      $('logoImg').style.display = 'none';
      $('logoPlaceholder').style.display = 'block';
    }
    document.body.classList.toggle('dark', settings.mode === 'dark');
    $('modeToggle').checked = settings.mode === 'dark';
  }

  // save settings
  function saveSettings(){
    settings.bizName = $('bizName').value;
    settings.owner = $('ownerName').value;
    settings.ownerPhone = $('ownerPhoneInput').value;
    settings.accent = $('accentColor').value || '#3B82F6';
    localStorage.setItem('vem_settings', JSON.stringify(settings));
    $('ownerPhone').innerText = settings.ownerPhone || '';
    applySettingsToUI();
    alert('Profile saved');
  }

  // tabs
  qsa('.tab').forEach(t=>{
    t.addEventListener('click', ()=> {
      qsa('.tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      qsa('.tab-content').forEach(c=>c.classList.remove('active'));
      const tab = t.dataset.tab;
      $(tab).classList.add('active');
    })
  });

  // render leads
  function renderLeads(filterText=''){
    leadList.innerHTML = '';
    const visible = leads.filter(l => {
      if(!filterText) return true;
      const s = (l.name+' '+l.phone+' '+l.location+' '+l.ptype+' '+l.config).toLowerCase();
      return s.includes(filterText.toLowerCase());
    });
    if(!visible.length) $('leadsEmpty').style.display='block'; else $('leadsEmpty').style.display='none';
    visible.forEach((l, idx) => {
      const card = document.createElement('div'); card.className='lead-card';
      const left = document.createElement('div'); left.className='lead-left';
      const title = document.createElement('div'); title.textContent = l.name || '—';
      const meta = document.createElement('div'); meta.className='lead-meta';
      meta.innerHTML = `${l.ptype} • ${l.config} • ${l.location || ''} <br> ${l.status} ${l.budget? ' • '+l.budget : ''}`;
      if(l.fdate){
        try{
          meta.innerHTML += `<br> Follow: ${new Date(l.fdate).toLocaleString()}`;
        }catch(e){}
      }
      left.appendChild(title); left.appendChild(meta);

      const actions = document.createElement('div'); actions.className='card-actions';
      const callBtn = document.createElement('button'); callBtn.className='small-btn call'; callBtn.textContent='Call';
      callBtn.onclick = ()=> { if(l.phone) location.href = `tel:${l.phone}`; };
      const waBtn = document.createElement('button'); waBtn.className='small-btn wa'; waBtn.textContent='WhatsApp';
      waBtn.onclick = ()=> {
        const msg = `Hello ${l.name || ''}%0ARegarding: ${l.ptype} ${l.config}%0ABudget: ${l.budget || ''}%0AFrom: ${settings.bizName || ''}`;
        const ph = (l.phone||'').replace(/\s+/g,'');
        window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, '_blank');
      };
      const extendBtn = document.createElement('button'); extendBtn.className='small-btn extend'; extendBtn.textContent='Extend';
      extendBtn.onclick = ()=> {
        // extend follow-up by 1 day (simple)
        if(!l.fdate){ alert('No follow-up set'); return; }
        const d = new Date(l.fdate);
        d.setDate(d.getDate()+1);
        l.fdate = d.toISOString().slice(0,16);
        saveLeads();
        renderAll();
      };
      const editBtn = document.createElement('button'); editBtn.className='small-btn'; editBtn.textContent='Edit';
      editBtn.onclick = ()=> openLeadForm(idx);
      const delBtn = document.createElement('button'); delBtn.className='small-btn'; delBtn.textContent='Delete';
      delBtn.onclick = ()=> {
        if(confirm('Delete this lead?')){ leads.splice(idx,1); saveLeads(); renderAll(); }
      };

      actions.appendChild(callBtn); actions.appendChild(waBtn); actions.appendChild(extendBtn);
      actions.appendChild(editBtn); actions.appendChild(delBtn);

      card.appendChild(left); card.appendChild(actions);
      leadList.appendChild(card);
    });
    totalLeads.innerText = leads.length;
  }

  // render followups (today & overdue)
  function renderFollowups(){
    followList.innerHTML = '';
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const items = leads.filter(l => l.fdate).map(l => {
      return {...l, ftime: new Date(l.fdate)};
    }).filter(l => l.ftime <= new Date(todayStart.getTime() + 24*60*60*1000 - 1) ) // today or earlier
      .sort((a,b)=> a.ftime - b.ftime);

    if(!items.length) $('followEmpty').style.display='block'; else $('followEmpty').style.display='none';
    items.forEach((l, idx) => {
      const card = document.createElement('div'); card.className='follow-card';
      const left = document.createElement('div'); left.className='lead-left';
      const title = document.createElement('div'); title.textContent = l.name;
      const meta = document.createElement('div'); meta.className='lead-meta';
      meta.innerHTML = `Follow: ${l.ftime.toLocaleString()} <br> ${l.ptype} • ${l.config} • ${l.location || ''}`;
      left.appendChild(title); left.appendChild(meta);

      const actions = document.createElement('div'); actions.className='card-actions';
      const callBtn = document.createElement('button'); callBtn.className='small-btn call'; callBtn.textContent='Call';
      callBtn.onclick = ()=> { if(l.phone) location.href = `tel:${l.phone}`; };
      const waBtn = document.createElement('button'); waBtn.className='small-btn wa'; waBtn.textContent='WhatsApp';
      waBtn.onclick = ()=> {
        const ph = (l.phone||'').replace(/\s+/g,'');
        const msg = `Hello ${l.name || ''}%0ARegarding: ${l.ptype} ${l.config}%0AFrom: ${settings.bizName || ''}`;
        window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, '_blank');
      };
      const extendBtn = document.createElement('button'); extendBtn.className='small-btn extend'; extendBtn.textContent='Extend';
      extendBtn.onclick = ()=> {
        // postpone one day
        const target = leads.find(x => x.phone === l.phone && x.name === l.name && x.fdate);
        if(target){
          const d = new Date(target.fdate);
          d.setDate(d.getDate()+1);
          target.fdate = d.toISOString().slice(0,16);
          saveLeads();
          renderAll();
        }
      };
      actions.appendChild(callBtn); actions.appendChild(waBtn); actions.appendChild(extendBtn);

      card.appendChild(left); card.appendChild(actions);
      followList.appendChild(card);
    });

    // badge count = number of followups for today or overdue
    const badgeCount = items.length;
    badge.innerText = badgeCount>0 ? badgeCount : '';
  }

  // projects render (basic)
  function renderProjects(){
    const list = $('projectList');
    list.innerHTML = '';
    if(!projects.length) $('projectsEmpty').style.display='block'; else $('projectsEmpty').style.display='none';
    projects.forEach((p, idx) => {
      const c = document.createElement('div'); c.className='project-card';
      const left = document.createElement('div');
      left.innerHTML = `<strong>${p.name}</strong><div class="lead-meta">${p.config} • ${p.location || ''} • ${p.price || ''}</div>`;
      const actions = document.createElement('div'); actions.className='card-actions';
      const del = document.createElement('button'); del.className='small-btn'; del.textContent='Delete';
      del.onclick = ()=> { if(confirm('Delete project?')){ projects.splice(idx,1); saveProjects(); renderAll(); } };
      actions.appendChild(del);
      c.appendChild(left); c.appendChild(actions);
      list.appendChild(c);
    });
    totalProjects.innerText = projects.length;
  }

  // save functions
  function saveLeads(){ localStorage.setItem('leads', JSON.stringify(leads)); }
  function saveProjects(){ localStorage.setItem('projects', JSON.stringify(projects)); }

  function renderAll(filter=''){
    renderLeads(filter);
    renderFollowups();
    renderProjects();
  }

  // lead form open
  let editingIndex = null;
  function openLeadForm(idx=null){
    editingIndex = idx;
    $('leadForm').style.display = 'flex';
    $('formTitle').innerText = idx === null ? 'Add Lead' : 'Edit Lead';
    if(idx === null){
      $('name').value = '';
      $('phone').value = '';
      $('ptype').value = 'Residential';
      $('config').value = '2 BHK';
      $('location').value = '';
      $('budget').value = '';
      $('status').value = 'New Lead';
      $('fdate').value = '';
      $('notes').value = '';
    } else {
      const l = leads[idx];
      $('name').value = l.name || '';
      $('phone').value = l.phone || '';
      $('ptype').value = l.ptype || 'Residential';
      $('config').value = l.config || '2 BHK';
      $('location').value = l.location || '';
      $('budget').value = l.budget || '';
      $('status').value = l.status || 'New Lead';
      $('fdate').value = l.fdate || '';
      $('notes').value = l.notes || '';
    }
  }

  // event bindings
  $('addLeadBtn').addEventListener('click', () => openLeadForm(null));
  $('cancelLead').addEventListener('click', ()=> $('leadForm').style.display='none');
  $('addProjectBtn').addEventListener('click', ()=> $('projectForm').style.display='flex');
  $('cancelProject').addEventListener('click', ()=> $('projectForm').style.display='none');

  // save lead
  $('saveLead').addEventListener('click', ()=>{
    const name = $('name').value.trim();
    const phone = $('phone').value.trim();
    if(!name || !phone){ alert('Name and Phone are required'); return; }
    const leadObj = {
      name, phone,
      ptype: $('ptype').value,
      config: $('config').value,
      location: $('location').value,
      budget: $('budget').value,
      status: $('status').value,
      fdate: $('fdate').value ? $('fdate').value : '',
      notes: $('notes').value,
      createdAt: new Date().toISOString()
    };
    if(editingIndex === null){
      leads.unshift(leadObj); // newest first
    } else {
      leads[editingIndex] = leadObj;
    }
    saveLeads();
    $('leadForm').style.display='none';
    renderAll();
  });

  // save project simple
  $('saveProject').addEventListener('click', ()=>{
    const p = {
      name: $('projectName').value || 'Untitled',
      location: $('projectLocation').value,
      config: $('projectConfig').value,
      size: $('projectSize').value,
      price: $('projectPrice').value,
      desc: $('projectDesc').value
    };
    projects.unshift(p);
    saveProjects();
    $('projectForm').style.display='none';
    renderAll();
  });

  // search
  $('searchLeads').addEventListener('input', (e)=> {
    renderAll(e.target.value);
  });

  // settings save
  $('saveProfile').addEventListener('click', saveSettings);

  // theme toggle
  $('modeToggle').addEventListener('change', (e)=>{
    settings.mode = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('vem_settings', JSON.stringify(settings));
    applySettingsToUI();
  });

  // accent color change live
  $('accentColor').addEventListener('input', (e)=>{
    settings.accent = e.target.value;
    document.body.style.setProperty('--accent', settings.accent);
  });

  // logo upload
  $('uploadLogo').addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      settings.logoData = ev.target.result;
      localStorage.setItem('vem_settings', JSON.stringify(settings));
      applySettingsToUI();
    };
    reader.readAsDataURL(f);
  });

  // export CSV
  function toCSV(rows){
    const keys = ['name','phone','ptype','config','location','budget','status','fdate','notes','createdAt'];
    const header = keys.join(',');
    const lines = rows.map(r => keys.map(k=>{
      const v = r[k] ? String(r[k]).replace(/"/g,'""') : '';
      return `"${v}"`;
    }).join(','));
    return [header].concat(lines).join('\n');
  }
  $('exportCSV').addEventListener('click', ()=>{
    if(!leads.length){ alert('No leads to export'); return; }
    const csv = toCSV(leads);
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vamika_leads.csv'; a.click(); URL.revokeObjectURL(url);
  });

  // export Excel (simple CSV wrapper with excel mime)
  $('exportExcel').addEventListener('click', ()=>{
    if(!leads.length){ alert('No leads to export'); return; }
    const csv = toCSV(leads);
    const blob = new Blob([csv], {type:'application/vnd.ms-excel'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vamika_leads.xls'; a.click(); URL.revokeObjectURL(url);
  });

  // backup JSON
  $('downloadBackup').addEventListener('click', ()=>{
    const data = {leads, projects, settings};
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vamika_backup.json'; a.click(); URL.revokeObjectURL(url);
  });

  // restore JSON
  $('restoreFile').addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      try{
        const data = JSON.parse(ev.target.result);
        if(Array.isArray(data.leads)) leads = data.leads;
        if(Array.isArray(data.projects)) projects = data.projects;
        if(typeof data.settings === 'object') settings = Object.assign(settings || {}, data.settings);
        saveLeads(); saveProjects(); localStorage.setItem('vem_settings', JSON.stringify(settings));
        applySettingsToUI(); renderAll();
        alert('Restore complete');
      }catch(err){ alert('Invalid JSON'); }
    };
    reader.readAsText(f);
  });

  // restore from file input (alternate)
  $('restoreFile').addEventListener('click', ()=> $('restoreFile').value = '');

  // delete old files note: not necessary here

  // open/close modals when clicking outside
  ['leadForm','projectForm'].forEach(id=>{
    const el = $(id);
    window.addEventListener('click', (ev)=>{
      if(ev.target === el) el.style.display = 'none';
    });
  });

  // init UI
  applySettingsToUI();
  renderAll();

  // small UI helpers: edit by search phone+name
  window.openLeadForm = openLeadForm;

})();
