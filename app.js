
const $ = id => document.getElementById(id);

let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let projects = JSON.parse(localStorage.getItem('projects')||'[]');
let profile = JSON.parse(localStorage.getItem('profile')||JSON.stringify({business:'Vamika Estate', owner:'Hiren Gohel', phone:'7046869462'}));
let accent = localStorage.getItem('accent') || '#3B82F6';

function saveAll(){
  localStorage.setItem('leads', JSON.stringify(leads));
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('profile', JSON.stringify(profile));
  localStorage.setItem('accent', accent);
  renderHeader();
}

function renderHeader(){
  if($('brandTitle')) $('brandTitle').textContent = profile.business || 'Vamika Estate';
  if($('brandSub')) $('brandSub').textContent = (profile.owner?profile.owner+' • ':'') + (profile.phone||'');
  if(localStorage.getItem('logo-data')) $('logoImg').src = localStorage.getItem('logo-data');
  document.documentElement.style.setProperty('--accent', accent);
}

function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.getElementById('section-'+tab).classList.add('active');
  if(tab==='leads') renderLeads();
  if(tab==='projects') renderProjects();
  if(tab==='followups') renderFollowups();
  if(tab==='settings') renderSettings();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* --- LEADS --- */
function renderLeads(){
  const el = $('leadsList'); el.innerHTML='';
  if(leads.length===0){ el.innerHTML='<div class="card">No leads yet</div>'; return; }
  leads.forEach((l,i)=>{
    const div = document.createElement('div'); div.className='lead-card';
    div.innerHTML = '<div class="lead-left"><div class="lead-name">'+escapeHtml(l.name)+'</div><div class="lead-meta">'+escapeHtml(l.phone)+' • '+escapeHtml(l.propertyType)+' • '+escapeHtml(l.bhk)+'</div><div class="lead-meta" style="margin-top:8px">Location: '+escapeHtml(l.location)+' • Budget: '+escapeHtml(l.budget)+'</div><div class="lead-meta" style="margin-top:8px">'+escapeHtml(l.notes||'')+'</div></div><div class="lead-actions"><button class="btn-wa btn" onclick="openWhatsApp('+i+')">WhatsApp</button><button class="btn-call btn" onclick="callLead('+i+')">Call</button><button class="btn-edit btn" onclick="editLead('+i+')">Edit</button><button class="btn-del btn" onclick="deleteLead('+i+')">Delete</button></div>';
    el.appendChild(div);
  });
}

function addLead(){
  const name = $('lead_name').value.trim();
  const phone = $('lead_phone').value.trim();
  const propertyType = $('lead_propertyType').value;
  const bhk = $('lead_bhk').value;
  const location = $('lead_location').value.trim();
  const budget = $('lead_budget').value.trim();
  const follow = $('lead_follow').value;
  const notes = $('lead_notes').value.trim();
  if(!name || !phone){ alert('Name and phone required'); return; }
  const lead = {name, phone, propertyType, bhk, location, budget, follow, notes, created: new Date().toISOString()};
  leads.unshift(lead); saveAll(); clearLeadForm(); renderLeads(); alert('Lead saved');
}

function clearLeadForm(){ ['lead_name','lead_phone','lead_propertyType','lead_bhk','lead_location','lead_budget','lead_follow','lead_notes'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); }

function openWhatsApp(i){ const l = leads[i]; const text = 'Hello '+l.name+'%0ARequirement: '+l.propertyType+' '+l.bhk+'%0ALocation: '+l.location+'%0ABudget: '+l.budget+'%0AWe will call you soon - '+profile.business+' ('+profile.phone+')'; window.open('https://wa.me/'+(l.phone.replace(/\D/g,''))+'?text='+encodeURIComponent(text),'_blank'); }

function callLead(i){ const l=leads[i]; if(!l.phone){ alert('No phone'); return; } window.location.href='tel:'+l.phone; }

function editLead(i){ const l = leads.splice(i,1)[0]; saveAll(); // populate form
  $('lead_name').value = l.name; $('lead_phone').value = l.phone; $('lead_propertyType').value = l.propertyType; $('lead_bhk').value = l.bhk; $('lead_location').value = l.location; $('lead_budget').value = l.budget; $('lead_follow').value = l.follow; $('lead_notes').value = l.notes; switchTab('leads'); window.scrollTo({top:0,behavior:'smooth'});
}

function deleteLead(i){ if(confirm('Delete lead?')){ leads.splice(i,1); saveAll(); renderLeads(); } }

/* --- PROJECTS --- */
function renderProjects(){ const el = $('projectsList'); el.innerHTML=''; if(projects.length===0){ el.innerHTML='<div class="card">No projects yet</div>'; return; } projects.forEach((p,i)=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div style="flex:1"><div style="font-weight:700">'+escapeHtml(p.title)+'</div><div class="small">'+escapeHtml(p.loc)+' • '+escapeHtml(p.config)+' • '+escapeHtml(p.size)+'</div><div style="margin-top:6px">Price: '+escapeHtml(p.price)+'</div><div class="small" style="margin-top:6px">'+escapeHtml(p.desc||'')+'</div></div><div style="width:140px">'+(p.img?'<img src="'+p.img+'" class="preview">':'<div class="small">No image</div>')+'<div style="margin-top:8px;display:flex;gap:8px"><button class="btn-send btn" onclick="shareProject('+i+')">Share</button><button class="button-outline btn" onclick="copyProject('+i+')">Copy</button></div></div></div>'; el.appendChild(div); }); }

function addProject(){ const title = $('proj_title').value.trim(); if(!title){ alert('Enter project title'); return; } const file = $('proj_img').files[0]; if(file){ const r = new FileReader(); r.onload = function(e){ saveProject(e.target.result); } ; r.readAsDataURL(file); } else saveProject(''); }

function saveProject(dataUrl){ const p = { title:$('proj_title').value.trim(), loc:$('proj_loc').value.trim(), config:$('proj_config').value, size:$('proj_size').value.trim(), price:$('proj_price').value.trim(), desc:$('proj_desc').value.trim(), img:dataUrl, created:new Date().toISOString() }; projects.unshift(p); saveAll(); renderProjects(); ['proj_title','proj_loc','proj_size','proj_price','proj_desc'].forEach(id=>{if($(id)) $(id).value='';}); $('proj_config').selectedIndex=0; $('proj_img').value=''; alert('Project saved'); }

function shareProject(i){ const p = projects[i]; const details = 'Project: '+p.title+'\\nLocation: '+p.loc+'\\nConfig: '+p.config+'\\nSize: '+p.size+'\\nPrice: '+p.price+'\\nCall: '+profile.phone; if(navigator.share && p.img){ fetch(p.img).then(r=>r.blob()).then(b=>{ const f = new File([b],'project.jpg',{type:b.type}); navigator.share({text:details,files:[f]}).catch(()=>alert('Share canceled')); }); } else { window.open('https://wa.me/?text='+encodeURIComponent(details),'_blank'); } }

function copyProject(i){ const p = projects[i]; const txt = 'Project: '+p.title+'\\nLocation: '+p.loc+'\\nPrice: '+p.price+'\\nCall: '+profile.phone; navigator.clipboard.writeText(txt).then(()=>alert('Copied')); }

/* --- FOLLOWUPS --- */
function renderFollowups(){ const el = $('followupsList'); el.innerHTML=''; const due = leads.filter(l=>l.follow); if(due.length===0){ el.innerHTML='<div class="card">No follow-ups today</div>'; return; } due.forEach((l,i)=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div><b>'+escapeHtml(l.name)+'</b><div class="small">Follow: '+l.follow+'</div><div class="small">'+escapeHtml(l.propertyType)+' • '+escapeHtml(l.bhk)+' • '+escapeHtml(l.location)+'</div></div><div style="display:flex;gap:8px;flex-direction:column"><button class="btn btn-call" onclick="callLead('+i+')">Call</button><button class="btn btn-wa" onclick="openWhatsApp('+i+')">WhatsApp</button><button class="button-outline btn" onclick="extendFollow('+i+')">Extend</button></div></div>'; el.appendChild(div); }); }

function extendFollow(i){ const d = prompt('Enter new follow-up (YYYY-MM-DDThh:mm)', leads[i].follow||''); if(d){ leads[i].follow = d; saveAll(); renderFollowups(); alert('Extended'); } }

/* --- SETTINGS --- */
function renderSettings(){
  if($('s_business')){
    $('s_business').value = profile.business || '';
    $('s_owner').value = profile.owner || '';
    $('s_phone').value = profile.phone || '';
    $('s_email').value = profile.email || '';
    $('s_address').value = profile.address || '';
    $('accent_input').value = localStorage.getItem('accent') || '#3B82F6';
    updateCounters();
  }
}
function saveProfile(){ profile.business = $('s_business').value.trim(); profile.owner = $('s_owner').value.trim(); profile.phone = $('s_phone').value.trim(); profile.email = $('s_email').value.trim(); profile.address = $('s_address').value.trim(); saveAll(); alert('Profile saved'); }
function uploadLogo(e){ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = function(ev){ localStorage.setItem('logo-data', ev.target.result); $('logoImg').src = ev.target.result; alert('Logo updated'); }; r.readAsDataURL(f); }
function changeAccent(){ accent = $('accent_input').value.trim() || '#3B82F6'; document.documentElement.style.setProperty('--accent', accent); localStorage.setItem('accent', accent); alert('Accent saved'); }
function updateCounters(){ $('lead_count').textContent = leads.length; $('project_count').textContent = projects.length; }

/* --- EXPORTS --- */
function exportLeadsCSV(){
  if(!leads.length){ alert('No leads'); return; }
  const rows = [['Name','Phone','PropertyType','BHK','Location','Budget','FollowUp','Notes','Created']];
  leads.forEach(l=> rows.push([l.name,l.phone,l.propertyType,l.bhk,l.location,l.budget,l.follow,l.notes,l.created]));
  const csv = rows.map(r=> r.map(c=> '"'+String(c||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='vamika_leads.csv'; a.click(); URL.revokeObjectURL(url);
}

function exportLeadsXLS(){
  if(!leads.length){ alert('No leads'); return; }
  // Basic XML Spreadsheet 2003 format which Excel can open
  let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Leads"><Table>';
  // headers
  const headers = ['Name','Phone','PropertyType','BHK','Location','Budget','FollowUp','Notes','Created'];
  xml += '<Row>'; headers.forEach(h=> xml += '<Cell><Data ss:Type="String">'+h+'</Data></Cell>'); xml += '</Row>';
  leads.forEach(l=>{
    xml += '<Row>';
    [l.name,l.phone,l.propertyType,l.bhk,l.location,l.budget,l.follow,l.notes,l.created].forEach(v=> xml += '<Cell><Data ss:Type="String">'+(v?String(v).replace(/&/g,'&amp;'):'')+'</Data></Cell>');
    xml += '</Row>';
  });
  xml += '</Table></Worksheet></Workbook>';
  const blob = new Blob([xml], {type:'application/vnd.ms-excel'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'vamika_leads.xls'; a.click(); URL.revokeObjectURL(url);
}

/* --- util --- */
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* init */
document.addEventListener('DOMContentLoaded', ()=>{ renderHeader(); switchTab('leads'); document.getElementById('saveLeadBtn').addEventListener('click', addLead); document.getElementById('saveProjectBtn').addEventListener('click', addProject); document.getElementById('logoUpload').addEventListener('change', uploadLogo); document.getElementById('exportCSV').addEventListener('click', exportLeadsCSV); document.getElementById('exportXLS').addEventListener('click', exportLeadsXLS); document.getElementById('accent_input')?.addEventListener('change', changeAccent); if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{}); });
