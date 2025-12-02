
(() => {
  const $ = id => document.getElementById(id);
  const qsa = sel => document.querySelectorAll(sel);

  let leads = JSON.parse(localStorage.getItem('leads') || '[]');
  let projects = JSON.parse(localStorage.getItem('projects') || '[]');
  let settings = JSON.parse(localStorage.getItem('vem_settings') || '{}');

  if(!settings.mode) settings.mode = 'dark';
  if(!settings.accent) settings.accent = '#3B82F6';
  if(!settings.bizName) settings.bizName = 'Vamika Estate';
  if(!settings.ownerPhone) settings.ownerPhone = '7046869462';

  function applySettings(){
    document.body.style.setProperty('--accent', settings.accent);
    document.getElementById('bizName') && (document.getElementById('bizName').value = settings.bizName || '');
    document.getElementById('ownerName') && (document.getElementById('ownerName').value = settings.owner || '');
    document.getElementById('ownerPhoneInput') && (document.getElementById('ownerPhoneInput').value = settings.ownerPhone || '');
    document.getElementById('ownerPhone') && (document.getElementById('ownerPhone').innerText = settings.ownerPhone || '');
    // icon toggle UI
    document.querySelectorAll('.icon-mode').forEach(btn => btn.classList.remove('active'));
    if(settings.mode === 'dark') document.getElementById('iconDark').classList.add('active');
    else document.getElementById('iconLight').classList.add('active');
    // theme application (light adjustments)
    if(settings.mode === 'light'){
      document.documentElement.style.setProperty('--bg','#f7fbff');
      document.documentElement.style.setProperty('--card','#ffffff');
      document.documentElement.style.setProperty('--text','#0b1220');
      document.documentElement.style.setProperty('--muted','#6b7280');
    } else {
      document.documentElement.style.setProperty('--bg','#071127');
      document.documentElement.style.setProperty('--card','#0f1b2b');
      document.documentElement.style.setProperty('--text','#E6EEF8');
      document.documentElement.style.setProperty('--muted','#9fb0c8');
    }
  }

  function saveSettings(){ localStorage.setItem('vem_settings', JSON.stringify(settings)); }

  // Tab switching
  qsa('.tab').forEach(tab => tab.addEventListener('click', ()=>{
    qsa('.tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
    qsa('.tab-content').forEach(c=>c.classList.remove('active')); const target = tab.getAttribute('data-tab'); document.getElementById(target).classList.add('active');
  }));

  // render leads compact
  function renderLeads(){
    const list = $('leadList'); list.innerHTML = '';
    if(!leads.length) $('leadsEmpty').style.display='block'; else $('leadsEmpty').style.display='none';
    leads.forEach((l, idx) => {
      const card = document.createElement('div'); card.className = 'lead-card';
      const row = document.createElement('div'); row.className='lead-row';
      const left = document.createElement('div'); left.className='lead-left';
      const title = document.createElement('div'); title.className='lead-title'; title.textContent = l.name || '—';
      const meta = document.createElement('div'); meta.className='lead-meta'; meta.textContent = `${l.ptype} • ${l.config} • ${l.location || ''} • ${l.budget || ''}`;
      left.appendChild(title); left.appendChild(meta);

      const actions = document.createElement('div'); actions.className='card-actions';
      const call = document.createElement('button'); call.className='small-btn call'; call.textContent='Call';
      call.addEventListener('click', (e)=>{ e.stopPropagation(); if(l.phone) location.href = `tel:${l.phone}`; });
      const wa = document.createElement('button'); wa.className='small-btn wa'; wa.textContent='WhatsApp';
      wa.addEventListener('click', (e)=>{ e.stopPropagation(); const ph=(l.phone||'').replace(/\s+/g,''); window.open(`https://wa.me/${ph}`); });
      const edit = document.createElement('button'); edit.className='small-btn edit'; edit.textContent='Edit';
      edit.addEventListener('click', (e)=>{ e.stopPropagation(); openLeadForm(idx); });
      const del = document.createElement('button'); del.className='small-btn delete'; del.textContent='Delete';
      del.addEventListener('click', (e)=>{ e.stopPropagation(); if(confirm('Delete this lead?')){ leads.splice(idx,1); saveLeads(); renderLeads(); } });

      actions.appendChild(call); actions.appendChild(wa); actions.appendChild(edit); actions.appendChild(del);

      row.appendChild(left); row.appendChild(actions);
      card.appendChild(row);

      const details = document.createElement('div'); details.className='lead-details';
      details.innerHTML = `<div>Follow: ${l.fdate || 'N/A'}</div><div>Status: ${l.status || ''}</div><div>Notes: ${l.notes || ''}</div>`;
      card.appendChild(details);

      card.addEventListener('click', ()=>{ details.style.display = details.style.display === 'block' ? 'none' : 'block'; });

      list.appendChild(card);
    });
    updateBadge();
    $('totalLeads') && ($('totalLeads').innerText = leads.length);
  }

  function saveLeads(){ localStorage.setItem('leads', JSON.stringify(leads)); }

  // followups render
  function updateBadge(){
    const today = new Date().toISOString().slice(0,10);
    const count = leads.filter(l => l.fdate && l.fdate.slice(0,10) <= today).length;
    $('badge').innerText = count ? count : '';
  }

  function renderFollowups(){
    const list = $('followList'); list.innerHTML = '';
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const items = leads.filter(l => l.fdate).map(l => ({...l, ftime: new Date(l.fdate)}))
      .filter(l => l.ftime <= new Date(todayStart.getTime() + 24*60*60*1000 - 1))
      .sort((a,b)=> a.ftime - b.ftime);
    if(!items.length) $('followEmpty').style.display='block'; else $('followEmpty').style.display='none';
    items.forEach(l => {
      const c = document.createElement('div'); c.className='lead-card';
      c.innerHTML = `<div class="lead-row"><div class="lead-left"><div class="lead-title">${l.name}</div><div class="lead-meta">${l.ptype} • ${l.config} • ${l.location || ''} • ${l.budget || ''}</div></div><div class="card-actions"><button class="small-btn call">Call</button><button class="small-btn wa">WhatsApp</button></div></div><div class="lead-details">Follow: ${l.fdate}</div>`;
      list.appendChild(c);
    });
  }

  // projects
  function renderProjects(){
    const list = $('projectList'); list.innerHTML = '';
    if(!projects.length) $('projectsEmpty').style.display='block'; else $('projectsEmpty').style.display='none';
    projects.forEach((p, idx) => {
      const c = document.createElement('div'); c.className='lead-card';
      c.innerHTML = `<div class="lead-row"><div class="lead-left"><div class="lead-title">${p.name}</div><div class="lead-meta">${p.config} • ${p.location || ''}</div></div><div class="card-actions"><button class="small-btn edit">Delete</button></div></div>`;
      list.appendChild(c);
    });
    $('totalProjects') && ($('totalProjects').innerText = projects.length);
  }

  // forms
  let editing = null;
  function openLeadForm(idx=null){
    editing = idx;
    $('leadForm').style.display = 'flex';
    if(idx === null){
      $('name').value=''; $('phone').value=''; $('ptype').value='Residential'; $('config').value='2 BHK'; $('location').value=''; $('budget').value=''; $('status').value='New Lead'; $('fdate').value=''; $('notes').value='';
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

  $('addLeadBtn') && $('addLeadBtn').addEventListener('click', ()=>openLeadForm(null));
  $('cancelLead') && $('cancelLead').addEventListener('click', ()=>$('leadForm').style.display='none');

  $('saveLead') && $('saveLead').addEventListener('click', ()=>{
    const name = $('name').value.trim(), phone = $('phone').value.trim();
    if(!name || !phone){ alert('Name and Phone required'); return; }
    const obj = { name, phone, ptype: $('ptype').value, config: $('config').value, location: $('location').value, budget: $('budget').value, status: $('status').value, fdate: $('fdate').value, notes: $('notes').value, createdAt: new Date().toISOString() };
    if(editing === null) leads.unshift(obj); else leads[editing] = obj;
    saveLeads(); $('leadForm').style.display='none'; renderLeads();
  });

  // save project
  $('saveProject') && $('saveProject').addEventListener('click', ()=>{
    const p = { name: $('projectName').value || 'Untitled', location: $('projectLocation').value, config: $('projectConfig').value, size: $('projectSize').value, price: $('projectPrice').value, desc: $('projectDesc').value };
    projects.unshift(p); localStorage.setItem('projects', JSON.stringify(projects)); renderProjects();
    $('projectForm').style.display='none';
  });

  // search
  $('searchLeads') && $('searchLeads').addEventListener('input', (e)=>{ renderLeads(); });

  // settings save & logo
  $('saveProfile') && $('saveProfile').addEventListener('click', ()=>{
    settings.bizName = $('bizName').value; settings.owner = $('ownerName').value; settings.ownerPhone = $('ownerPhoneInput').value; settings.accent = $('accentColor').value || '#3B82F6';
    localStorage.setItem('vem_settings', JSON.stringify(settings)); applySettings(); alert('Saved');
  });

  $('uploadLogo') && $('uploadLogo').addEventListener('change', (e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ settings.logoData = ev.target.result; localStorage.setItem('vem_settings', JSON.stringify(settings)); applySettings(); }; r.readAsDataURL(f); });

  // exports and backups
  function toCSV(rows){ const keys=['name','phone','ptype','config','location','budget','status','fdate','notes','createdAt']; const header=keys.join(','); const lines=rows.map(r=>keys.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(',')); return [header].concat(lines).join('\n'); }

  $('exportCSV') && $('exportCSV').addEventListener('click', ()=>{ if(!leads.length){ alert('No leads'); return; } const csv=toCSV(leads); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='vamika_leads.csv'; a.click(); URL.revokeObjectURL(url); });

  $('downloadBackup') && $('downloadBackup').addEventListener('click', ()=>{ const data={leads,projects,settings}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='vamika_backup.json'; a.click(); URL.revokeObjectURL(url); });

  $('restoreFile') && $('restoreFile').addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ try{ const data=JSON.parse(ev.target.result); if(Array.isArray(data.leads)) leads=data.leads; if(Array.isArray(data.projects)) projects=data.projects; if(typeof data.settings==='object') settings=Object.assign(settings||{}, data.settings); localStorage.setItem('leads', JSON.stringify(leads)); localStorage.setItem('projects', JSON.stringify(projects)); localStorage.setItem('vem_settings', JSON.stringify(settings)); applySettings(); renderLeads(); renderProjects(); alert('Restored'); }catch(e){ alert('Invalid JSON'); } }; r.readAsText(f); });

  // icon toggle
  document.getElementById('iconLight') && document.getElementById('iconLight').addEventListener('click', ()=>{ settings.mode='light'; saveSettings(); applySettings(); });
  document.getElementById('iconDark') && document.getElementById('iconDark').addEventListener('click', ()=>{ settings.mode='dark'; saveSettings(); applySettings(); });

  // install button hide/show
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); window.deferredPrompt = e; document.getElementById('installBtn').style.display='inline-block'; });

  document.getElementById('installBtn') && document.getElementById('installBtn').addEventListener('click', async ()=>{ if(window.deferredPrompt){ window.deferredPrompt.prompt(); const choice = await window.deferredPrompt.userChoice; window.deferredPrompt = null; document.getElementById('installBtn').style.display='none'; } });

  // click outside modal close
  ['leadForm','projectForm'].forEach(id => { const el = document.getElementById(id); window.addEventListener('click', (ev)=>{ if(ev.target === el) el.style.display='none'; }); });

  // init
  applySettings();
  renderLeads();
  renderProjects();
  renderFollowups();
})();
