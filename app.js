
const $ = id => document.getElementById(id);

// storage
let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let projects = JSON.parse(localStorage.getItem('projects')||'[]');
let profile = JSON.parse(localStorage.getItem('profile')||JSON.stringify({business:'Vamika Estate',owner:'Hiren Gohel',phone:'7046869462',email:'',address:''}));
let accent = localStorage.getItem('accent') || '#4A90E2';

function saveAll(){
  localStorage.setItem('leads', JSON.stringify(leads));
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('profile', JSON.stringify(profile));
  localStorage.setItem('accent', accent);
  updateCounters();
}

// header
function renderHeader(){
  $('brandName').textContent = profile.business || 'Vamika Estate';
  $('brandPhone').textContent = profile.phone || '';
  if(localStorage.getItem('logo-data')){
    $('logoImg').src = localStorage.getItem('logo-data');
  }
  document.documentElement.style.setProperty('--accent', accent);
}

// tabs
function showTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  $('tab-'+tab).classList.add('active');
  $('page-'+tab).classList.remove('hidden');
  if(tab==='leads') renderLeads();
  if(tab==='projects') renderProjects();
  if(tab==='followups') renderFollowups();
}

// counters
function updateCounters(){
  $('leadCount').textContent = leads.length;
  $('projectCount').textContent = projects.length;
}

// leads
function renderLeads(){
  const el = $('leadsList'); el.innerHTML='';
  if(leads.length===0){ el.innerHTML = '<div class="small">No leads yet</div>'; return; }
  leads.forEach((l,idx)=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div style="flex:1">
        <div style="font-weight:700;font-size:16px">${escape(l.name)}</div>
        <div class="small">${escape(l.req)} • ${escape(l.loc)}</div>
        <div style="margin-top:6px"><span class="small">Budget:</span> ${escape(l.budget)}</div>
        <div class="small" style="margin-top:6px">Follow: ${l.follow || '-'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn" onclick="callLead(${idx})">📞</button>
        <button class="wa-btn" onclick="whatsappLead(${idx})">💬</button>
        <button style="background:#f97373;border:none;padding:8px;border-radius:8px;color:white" onclick="deleteLead(${idx})">Delete</button>
      </div>
    </div>`;
    el.appendChild(div);
  });
}

// add lead
function addLead(){
  const name = $('l_name').value.trim();
  const phone = $('l_phone').value.trim();
  const follow = $('l_follow').value;
  if(!name || !phone || !follow){ alert('Please enter name, phone and follow-up date & time'); return; }
  const lead = { name, phone, req:$('l_req').value.trim(), loc:$('l_loc').value.trim(), budget:$('l_budget').value.trim(), notes:$('l_notes').value.trim(), follow, created:new Date().toISOString() };
  leads.unshift(lead);
  saveAll();
  renderLeads();
  // clear
  ['l_name','l_phone','l_req','l_loc','l_budget','l_notes','l_follow'].forEach(id=>$(id).value='');
  alert('Lead saved');
}

// lead actions
function callLead(i){ const l=leads[i]; if(!l.phone){ alert('No phone'); return; } window.location.href=`tel:${l.phone}`; }
function whatsappLead(i){ const l=leads[i]; if(!l.phone){ alert('No phone'); return; } const text = `Hello ${l.name},%0ARequirement: ${l.req}%0ALocation: ${l.loc}%0ABudget: ${l.budget}%0AWe will call you soon - ${profile.business} (${profile.phone})`; window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}?text=${text}`,'_blank'); }
function deleteLead(i){ if(confirm('Delete lead?')){ leads.splice(i,1); saveAll(); renderLeads(); } }

// projects
function renderProjects(){
  const el = $('projectsList'); el.innerHTML='';
  if(projects.length===0){ el.innerHTML='<div class="small">No projects yet</div>'; return; }
  projects.forEach((p,idx)=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div style="display:flex;gap:12px;align-items:flex-start">
      <div style="flex:1">
        <div style="font-weight:700">${escape(p.title)}</div>
        <div class="small">${escape(p.loc)} • ${escape(p.config)} • ${escape(p.size)}</div>
        <div style="margin-top:6px">Price: ${escape(p.price)}</div>
        <div class="small" style="margin-top:6px">${escape(p.desc||'')}</div>
      </div>
      <div style="width:140px">
        ${p.img?`<img src="${p.img}" class="preview">`:'<div class="small">No image</div>'}
        <div style="margin-top:8px;display:flex;gap:8px">
          <button class="btn" onclick="shareProject(${idx})">Share</button>
          <button class="btn" onclick="copyProject(${idx})">Copy</button>
        </div>
      </div>
    </div>`;
    el.appendChild(div);
  });
}

function addProject(){
  const file = $('p_img').files[0];
  if(file){
    const r = new FileReader();
    r.onload = function(e){ saveProject(e.target.result); }
    r.readAsDataURL(file);
  } else {
    saveProject('');
  }
}

function saveProject(dataUrl){
  const p = { title:$('p_title').value.trim(), loc:$('p_loc').value.trim(), config:$('p_config').value, size:$('p_size').value.trim(), price:$('p_price').value.trim(), desc:$('p_desc').value.trim(), img:dataUrl, created:new Date().toISOString() };
  projects.unshift(p);
  saveAll();
  renderProjects();
  ['p_title','p_loc','p_size','p_price','p_desc'].forEach(id=>$(id).value='');
  $('p_config').selectedIndex=0;
  $('p_img').value='';
  alert('Project saved');
}

function shareProject(i){
  const p = projects[i];
  const details = `Project: ${p.title}\nLocation: ${p.loc}\nConfig: ${p.config}\nSize: ${p.size}\nPrice: ${p.price}\nCall: ${profile.phone}`;
  if(navigator.share && p.img){
    fetch(p.img).then(r=>r.blob()).then(b=>{ const f = new File([b],'project.jpg',{type:b.type}); navigator.share({text:details,files:[f]}).catch(()=>alert('Share canceled')); });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(details)}`,'_blank');
  }
}

function copyProject(i){ const p = projects[i]; const txt = `Project: ${p.title}\nLocation: ${p.loc}\nPrice: ${p.price}\nCall: ${profile.phone}`; navigator.clipboard.writeText(txt).then(()=>alert('Copied')); }

// followups
function renderFollowups(){
  const el=$('followupsList'); el.innerHTML='';
  const now = new Date();
  const due = leads.filter(l=>l.follow);
  if(due.length===0){ el.innerHTML='<div class="small">No follow-ups</div>'; return; }
  due.forEach((l,idx)=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = `<div style="display:flex;justify-content:space-between"><div><b>${escape(l.name)}</b><div class="small">Follow: ${l.follow}</div></div><div style="display:flex;flex-direction:column;gap:8px"><button class="btn" onclick="callLead(${idx})">Call</button><button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button><button style="background:#f97373" onclick="completeFollow(${idx})">Complete</button></div></div>`; el.appendChild(div); });
}

function completeFollow(i){ if(confirm('Mark follow-up complete?')){ leads[i].follow=''; saveAll(); renderFollowups(); renderLeads(); } }

// settings features
function exportData(){
  const data = { leads, projects, profile, accent };
  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='vamika_backup.json'; a.click(); URL.revokeObjectURL(url);
}

function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try{
      const obj = JSON.parse(evt.target.result);
      if(obj.leads) leads = obj.leads;
      if(obj.projects) projects = obj.projects;
      if(obj.profile) profile = obj.profile;
      if(obj.accent) accent = obj.accent;
      saveAll(); renderLeads(); renderProjects(); renderFollowups(); renderHeader();
      alert('Data restored');
    }catch(err){ alert('Invalid file'); }
  };
  reader.readAsText(file);
}

function uploadLogo(e){
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = function(ev){
    localStorage.setItem('logo-data', ev.target.result);
    $('logoImg').src = ev.target.result;
    alert('Logo updated');
  }
  r.readAsDataURL(f);
}

function saveProfile(){
  profile.business = $('s_business').value.trim();
  profile.owner = $('s_owner').value.trim();
  profile.phone = $('s_phone').value.trim();
  profile.email = $('s_email').value.trim();
  profile.address = $('s_address').value.trim();
  saveAll();
  renderHeader();
  alert('Profile saved');
}

function changeAccent(){
  accent = $('s_accent').value.trim() || '#4A90E2';
  document.documentElement.style.setProperty('--accent', accent);
  saveAll();
  alert('Theme color changed');
}

// util
function escape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('DOMContentLoaded', function(){
  renderHeader();
  updateCounters();
  showTab('leads');
  // wire inputs
  $('saveLeadBtn').addEventListener('click', addLead);
  $('saveProjectBtn').addEventListener('click', addProject);
  $('importBackup').addEventListener('change', importData);
  $('logoUpload').addEventListener('change', uploadLogo);
  $('saveProfileBtn').addEventListener('click', saveProfile);
  $('exportBtn').addEventListener('click', exportData);
  $('accentInput').addEventListener('change', changeAccent);
  // service worker register
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
});
