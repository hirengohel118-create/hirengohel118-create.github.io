
const $ = id => document.getElementById(id);

let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let projects = JSON.parse(localStorage.getItem('projects')||'[]');
let profile = JSON.parse(localStorage.getItem('profile')||JSON.stringify({business:'Vamika Estate CRM', owner:'Hiren Gohel', phone:'7046869462'}));
let accent = localStorage.getItem('accent') || '#3B82F6';

function saveAll(){ localStorage.setItem('leads',JSON.stringify(leads)); localStorage.setItem('projects',JSON.stringify(projects)); localStorage.setItem('profile',JSON.stringify(profile)); localStorage.setItem('accent',accent); updateCounters(); renderHeader(); }

function renderHeader(){
  $('brandTitle').textContent = profile.business || 'Vamika Estate CRM';
  $('brandSub').textContent = (profile.owner?profile.owner+' • ':'') + (profile.phone||'');
  if(localStorage.getItem('logo-data')) $('logoImg').src = localStorage.getItem('logo-data');
  document.documentElement.style.setProperty('--accent', accent);
}

function showTab(t){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));
  document.getElementById('tab-'+t).classList.add('active');
  document.getElementById('page-'+t).classList.remove('hidden');
  if(t==='leads') renderLeads();
  if(t==='projects') renderProjects();
  if(t==='followups') renderFollowups();
  if(t==='settings') renderSettings();
}

function updateCounters(){ $('leadCount').textContent = leads.length; $('projectCount').textContent = projects.length; }

function renderLeads(){
  const list = $('leadsList'); list.innerHTML='';
  if(leads.length===0){ list.innerHTML='<div class="card-small">No leads yet</div>'; return; }
  leads.forEach((l,i)=>{
    const div = document.createElement('div'); div.className='lead-card';
    div.innerHTML = `<div class="lead-left"><div class="lead-name">${escapeHtml(l.name)}</div><div class="lead-meta">${escapeHtml(l.phone)} • ${escapeHtml(l.req)} • ${escapeHtml(l.loc)}</div><div class="lead-meta" style="margin-top:10px">Follow: ${l.follow || '-'}</div></div><div class="lead-right"><button class="btn-wa" onclick="whatsappLead(${i})">WhatsApp</button><button class="btn-send" onclick="sendProject(${i})">Send Project</button><button class="btn-edit" onclick="editLead(${i})">Edit</button><button class="btn-delete" onclick="deleteLead(${i})">Delete</button></div>`;
    list.appendChild(div);
  });
}

function addLead(){ const name=$('input_name').value.trim(); const phone=$('input_phone').value.trim(); const follow=$('input_follow').value; if(!name||!phone||!follow){ alert('Enter name, phone and follow-up date/time'); return; } const lead={name,phone,req:$('input_req').value.trim(),loc:$('input_loc').value.trim(),budget:$('input_budget').value.trim(),notes:$('input_notes').value.trim(),follow,created:new Date().toISOString()}; leads.unshift(lead); saveAll(); renderLeads(); ['input_name','input_phone','input_req','input_loc','input_budget','input_notes','input_follow'].forEach(id=>$(id).value=''); }

function whatsappLead(i){ const l=leads[i]; if(!l.phone){ alert('No phone'); return; } const text = `Hello ${l.name},%0ARequirement: ${l.req}%0ALocation: ${l.loc}%0ABudget: ${l.budget}%0AWe will call you soon - ${profile.business} (${profile.phone})`; window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}?text=${text}`,'_blank'); }

function sendProject(i){ alert('Open Projects tab and press Share on the desired project to send.'); }

function editLead(i){ const l=leads[i]; $('input_name').value=l.name; $('input_phone').value=l.phone; $('input_req').value=l.req; $('input_loc').value=l.loc; $('input_budget').value=l.budget; $('input_notes').value=l.notes; $('input_follow').value=l.follow; leads.splice(i,1); saveAll(); renderLeads(); window.scrollTo({top:0,behavior:'smooth'}); }

function deleteLead(i){ if(confirm('Delete lead?')){ leads.splice(i,1); saveAll(); renderLeads(); } }

// Projects
function renderProjects(){ const el=$('projectsList'); el.innerHTML=''; if(projects.length===0){ el.innerHTML='<div class="card-small">No projects yet</div>'; return; } projects.forEach((p,idx)=>{ const d=document.createElement('div'); d.className='card-small'; d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="flex:1"><div style="font-weight:700">${escapeHtml(p.title)}</div><div class="small">${escapeHtml(p.loc)} • ${escapeHtml(p.config)} • ${escapeHtml(p.size)}</div><div style="margin-top:6px">Price: ${escapeHtml(p.price)}</div><div class="small" style="margin-top:6px">${escapeHtml(p.desc||'')}</div></div><div style="width:140px">${p.img?`<img src="${p.img}" class="preview">`:'<div class="small">No image</div>'}<div style="margin-top:8px;display:flex;gap:8px"><button class="btn-send" onclick="shareProject(${idx})">Share</button><button class="button-outline" onclick="copyProject(${idx})">Copy</button></div></div></div>`; el.appendChild(d); }); }

function addProject(){ const f=$('proj_img').files[0]; if(f){ const r=new FileReader(); r.onload=()=> saveProject(r.result); r.readAsDataURL(f); } else saveProject(''); }

function saveProject(img){ const p={title:$('proj_title').value.trim(),loc:$('proj_loc').value.trim(),config:$('proj_config').value,size:$('proj_size').value.trim(),price:$('proj_price').value.trim(),desc:$('proj_desc').value.trim(),img,created:new Date().toISOString()}; projects.unshift(p); saveAll(); renderProjects(); ['proj_title','proj_loc','proj_size','proj_price','proj_desc'].forEach(id=>$(id).value=''); $('proj_config').selectedIndex=0; $('proj_img').value=''; alert('Project saved'); }

function shareProject(i){ const p=projects[i]; const details=`Project: ${p.title}\nLocation: ${p.loc}\nConfig: ${p.config}\nSize: ${p.size}\nPrice: ${p.price}\nCall: ${profile.phone}`; if(navigator.share && p.img){ fetch(p.img).then(r=>r.blob()).then(b=>{ const f=new File([b],'project.jpg',{type:b.type}); navigator.share({text:details,files:[f]}).catch(()=>alert('Share canceled')); }); } else { window.open(`https://wa.me/?text=${encodeURIComponent(details)}`,'_blank'); } }

function copyProject(i){ const p=projects[i]; const txt=`Project: ${p.title}\nLocation: ${p.loc}\nPrice: ${p.price}\nCall: ${profile.phone}`; navigator.clipboard.writeText(txt).then(()=>alert('Copied')); }

// followups
function renderFollowups(){ const el=$('followupsList'); el.innerHTML=''; const due=leads.filter(l=>l.follow); if(due.length===0){ el.innerHTML='<div class="card-small">No follow-ups</div>'; return; } due.forEach((l,idx)=>{ const d=document.createElement('div'); d.className='card-small'; d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><b>${escapeHtml(l.name)}</b><div class="small">Follow: ${l.follow}</div></div><div style="display:flex;gap:8px"><button class="btn" onclick="callLead(${idx})">Call</button><button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button><button class="button-outline" onclick="completeFollow(${idx})">Complete</button></div></div>`; el.appendChild(d); }); }

function completeFollow(i){ if(confirm('Mark follow-up complete?')){ leads[i].follow=''; saveAll(); renderFollowups(); renderLeads(); } }

// settings in tab
function renderSettings(){ /* settings tab will scroll to bottom of projects page in v2.7; here we keep a separate settings tab as well */ }

// settings features
function exportBackup(){ const data={leads,projects,profile,accent}; const blob=new Blob([JSON.stringify(data)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='vamika_backup.json'; a.click(); URL.revokeObjectURL(url); }
function importBackup(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=function(ev){ try{ const obj=JSON.parse(ev.target.result); if(obj.leads) leads=obj.leads; if(obj.projects) projects=obj.projects; if(obj.profile) profile=obj.profile; if(obj.accent) accent=obj.accent; saveAll(); renderLeads(); renderProjects(); renderFollowups(); renderHeader(); alert('Backup restored'); }catch(err){ alert('Invalid file'); } }; r.readAsText(f); }
function uploadLogo(e){ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=function(ev){ localStorage.setItem('logo-data',ev.target.result); $('logoImg').src=ev.target.result; alert('Logo updated'); }; r.readAsDataURL(f); }
function saveProfile(){ profile.business=$('prof_business').value.trim(); profile.owner=$('prof_owner').value.trim(); profile.phone=$('prof_phone').value.trim(); profile.email=$('prof_email').value.trim(); profile.address=$('prof_address').value.trim(); saveAll(); renderHeader(); alert('Profile saved'); }
function changeAccent(){ accent=$('accentInput').value.trim()||'#3B82F6'; document.documentElement.style.setProperty('--accent',accent); saveAll(); alert('Accent updated'); }

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('DOMContentLoaded', ()=>{ renderHeader(); updateCounters(); showTab('leads'); document.getElementById('saveLeadBtn')?.addEventListener('click', addLead); document.getElementById('saveProjectBtn')?.addEventListener('click', addProject); document.getElementById('importBackup')?.addEventListener('change', importBackup); document.getElementById('logoUpload')?.addEventListener('change', uploadLogo); document.getElementById('exportBtn')?.addEventListener('click', exportBackup); document.getElementById('accentInput')?.addEventListener('change', changeAccent); if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); } });
