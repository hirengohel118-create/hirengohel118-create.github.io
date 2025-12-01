const $ = id => document.getElementById(id);
let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let props = JSON.parse(localStorage.getItem('props')||'[]');
let oneSignalAppId = localStorage.getItem('onesignal_app_id') || '';

function el(html){ const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

/* TAB NAV */
function showTab(tab){
  ['tab-leads','tab-projects','tab-followups','tab-settings'].forEach(id=>document.getElementById(id).classList.remove('active'));
  ['page-leads','page-projects','page-followups','page-settings'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.getElementById('page-'+tab).classList.remove('hidden');
  if(tab==='leads') renderLeads();
  if(tab==='projects') renderProps();
  if(tab==='followups') renderReminders();
}

/* RENDER LEADS */
function renderLeads(){
  const elc = $('leadsList'); elc.innerHTML='';
  if(leads.length===0){ elc.innerHTML='<div class="small">No leads yet</div>'; return; }
  leads.forEach((l,idx)=>{
    const node = el(`
      <div class="lead-row">
        <div>
          <div style="font-weight:700;color:var(--text-light);">${escapeHtml(l.name)}</div>
          <div class="small">${escapeHtml(l.phone||'')} • ${escapeHtml(l.requirement||'')} • ${escapeHtml(l.status||'')}</div>
          <div class="small">Follow: ${l.follow? new Date(l.follow).toLocaleString(): '-'}</div>
        </div>
        <div class="lead-actions">
          <button class="btn" onclick="callLead(${idx})">📞</button>
          <button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button>
          <button class="btn" onclick="editLead(${idx})">Edit</button>
          <button class="btn" style="background:#d9534f;color:#fff;" onclick="deleteLead(${idx})">Delete</button>
        </div>
      </div>
    `);
    elc.appendChild(node);
  });
}

/* RENDER PROPS */
function renderProps(){
  const elc = $('propList'); elc.innerHTML='';
  if(props.length===0){ elc.innerHTML='<div class="small">No projects yet</div>'; return; }
  props.forEach((p,idx)=>{
    const img = p.image ? `<img src="${p.image}" class="img-thumb">` : '';
    const node = el(`<div class="lead-row"><div><strong>${escapeHtml(p.title)}</strong><div class="small">${escapeHtml(p.location||'')} • ${escapeHtml(p.config||'')}</div><div class="small">${escapeHtml(p.size||'')} • ${escapeHtml(p.price||'')}</div>${img}<div class="small">${escapeHtml(p.description||'')}</div></div><div><button class="btn" onclick="copyProject(${idx})">Copy Msg</button><button class="wa-btn" onclick="sendProjectWhatsApp(${idx})" style="margin-top:6px;">Send on WhatsApp</button></div></div>`);
    elc.appendChild(node);
  });
}

/* RENDER REMINDERS (Today Follow-ups) */
function renderReminders(){
  const elc = $('remindersList'); elc.innerHTML='';
  const now = new Date();
  // show upcoming and due reminders (all)
  const pending = leads.filter(l=>l.follow);
  if(pending.length===0){ elc.innerHTML='<div class="small">No reminders</div>'; return; }
  pending.forEach((l,idx)=>{
    const node = el(`<div class="lead-row"><div><strong>${escapeHtml(l.name)}</strong><div class="small">Follow: ${l.follow? new Date(l.follow).toLocaleString():'-'}</div></div><div><button class="btn" onclick="extendReminder(${idx})">Extend</button><button class="btn" onclick="completeReminder(${idx})" style="background:#28a745;color:#fff;margin-left:6px;">Complete</button><button class="btn" style="margin-left:6px;" onclick="callLead(${idx})">Call</button><button class="wa-btn" style="margin-left:6px;" onclick="whatsappLead(${idx})">WhatsApp</button></div></div>` );
    elc.appendChild(node);
  });
}

/* SAVE ALL */
function saveAll(){ localStorage.setItem('leads', JSON.stringify(leads)); localStorage.setItem('props', JSON.stringify(props)); renderLeads(); renderProps(); renderReminders(); }

/* ADD LEAD */
function addLeadFromForm(){
  const name = $('leadName').value.trim();
  const phone = $('leadPhone').value.trim();
  const follow = $('leadFollow').value;
  if(!name){ alert('Enter name'); return; }
  if(!phone){ alert('Enter phone'); return; }
  if(!follow){ alert('Please choose follow-up date & time'); return; }
  const l = {
    name, phone, requirement: $('leadReq').value.trim(), location: $('leadLoc').value.trim(), budget: $('leadBudget').value.trim(), status: $('leadStatus').value, notes: $('leadNotes').value.trim(), follow, created:new Date().toISOString()
  };
  leads.unshift(l); saveAll(); $('leadForm').classList.add('hidden');
  ['leadName','leadPhone','leadReq','leadLoc','leadBudget','leadNotes','leadFollow'].forEach(id=>$(id).value='');
}

/* CALL */
function callLead(i){ const l = leads[i]; if(!l || !l.phone){ alert('No phone'); return; } window.location.href = `tel:${l.phone}`; }

/* WHATSAPP */
function whatsappLead(i){
  const l = leads[i]; if(!l || !l.phone){ alert('No phone'); return; }
  // English clean template (option C)
  const text = `Hello ${l.name},%0AHere are the details:%0ARequirement: ${l.requirement || '-'}%0ALocation: ${l.location || '-'}%0ABudget: ${l.budget || '-'}%0AWe will call you soon - Vamika Estate (7046869462)`;
  window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}?text=${text}`,'_blank');
}

/* EDIT LEAD */
function editLead(i){
  const l = leads[i];
  $('leadName').value=l.name; $('leadPhone').value=l.phone; $('leadReq').value=l.requirement; $('leadLoc').value=l.location; $('leadBudget').value=l.budget; $('leadNotes').value=l.notes; $('leadFollow').value=l.follow;
  leads.splice(i,1); saveAll(); $('leadForm').classList.remove('hidden');
}

/* DELETE LEAD */
function deleteLead(i){ if(confirm('Delete this lead?')){ leads.splice(i,1); saveAll(); } }

/* EXTEND REMINDER */
function extendReminder(i){
  const newDate = prompt('Enter new follow-up (YYYY-MM-DDThh:mm) e.g. 2025-12-01T10:30', leads[i].follow || '');
  if(newDate){ leads[i].follow = newDate; saveAll(); alert('Reminder extended'); }
}

/* COMPLETE REMINDER */
function completeReminder(i){ if(confirm('Mark reminder completed?')){ leads[i].follow=''; saveAll(); } }

/* PROJECTS */
function saveProp(){
  const title = $('propTitle').value.trim();
  if(!title){ alert('Enter project title'); return; }
  const p = { title, location: $('propLocation').value.trim(), config: $('propConfig').value, size: $('propSize').value.trim(), price: $('propPrice').value.trim(), description: $('propDesc').value.trim(), image: $('propImagePreview').dataset.src || '' };
  props.unshift(p); saveAll();
  ['propTitle','propLocation','propSize','propPrice','propDesc'].forEach(id=>$(id).value='');
  $('propConfig').selectedIndex = 0;
  $('propImagePreview').src=''; $('propImagePreview').dataset.src='';
}

/* handle image upload */
function handlePropImage(file){
  const reader = new FileReader();
  reader.onload = function(e){
    $('propImagePreview').src = e.target.result;
    $('propImagePreview').dataset.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* copy project message to clipboard */
function copyProject(i){
  const p = props[i];
  const msg = `Project: ${p.title}\nLocation: ${p.location}\nConfig: ${p.config}\nSize: ${p.size}\nPrice: ${p.price}\nCall: 7046869462`;
  navigator.clipboard.writeText(msg).then(()=>alert('Message copied!'));
}

/* send project via WhatsApp (opens chat with text; image must be sent manually or via share) */
function sendProjectWhatsApp(i){
  const p = props[i];
  const text = `Hello, here are the project details:%0AProject: ${p.title}%0ALocation: ${p.location}%0AConfig: ${p.config}%0ASize: ${p.size}%0APrice: ${p.price}%0ADesc: ${p.description}%0ACall: 7046869462`;
  // try navigator.share first (mobile)
  if(navigator.share){
    // prepare data: share text and image if available (image may not be sharable in some browsers)
    const shareData = { title: p.title, text: p.title + "\\n" + p.location + "\\nPrice: " + p.price };
    if(p.image){
      // data URL cannot be shared as file easily without fetch; try share text first
      shareData.text += "\\nImage attached separately. Open chat and paste.";
    }
    navigator.share(shareData).catch(()=>{ window.open(`https://wa.me/?text=${text}`,'_blank'); });
  } else {
    window.open(`https://wa.me/?text=${text}`,'_blank');
    alert('WhatsApp will open. To include image, use the Share/Attach button and select the project image.');
  }
}

/* EXPORT LEADS as CSV */
function exportLeadsCSV(){
  if(leads.length===0){ alert('No leads to export'); return; }
  const header = ['Name','Phone','Requirement','Location','Budget','Status','Follow','Notes','Created'];
  const rows = leads.map(l=>[l.name,l.phone,l.requirement,l.location,l.budget,l.status,l.follow,l.notes,l.created]);
  let csv = header.join(',') + '\\n' + rows.map(r=>r.map(c=>'\"'+String(c||'').replace(/\"/g,'""')+'\"').join(',')).join('\\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'vamika_leads.csv'; a.click(); URL.revokeObjectURL(url);
}

/* SETTINGS: save OneSignal App ID */
function saveSettings(){
  const id = $('onesignalId').value.trim();
  localStorage.setItem('onesignal_app_id', id);
  oneSignalAppId = id;
  alert('Settings saved. For Push notifications, add OneSignal App ID and click Enable Notifications.');
}

/* ENABLE PUSH (OneSignal) - requires App ID */
function enablePush(){
  const id = localStorage.getItem('onesignal_app_id') || '';
  if(!id){ alert('Please enter OneSignal App ID in settings first'); return; }
  alert('OneSignal setup requires your App ID. This demo will only show instructions. To fully enable, add OneSignal snippet with your App ID in index.html.');
}

/* THEME */
function setTheme(d){
  if(d){ document.body.classList.add('dark'); localStorage.setItem('dark','1'); document.getElementById('knob').style.left='23px'; } else { document.body.classList.remove('dark'); localStorage.removeItem('dark'); document.getElementById('knob').style.left='3px'; }
}
document.addEventListener('DOMContentLoaded', ()=>{
  // wire up
  document.getElementById('addLeadBtn').addEventListener('click', ()=> $('leadForm').classList.toggle('hidden'));
  document.getElementById('saveLead').addEventListener('click', addLeadFromForm);
  document.getElementById('cancelLead').addEventListener('click', ()=> $('leadForm').classList.add('hidden'));
  document.getElementById('saveProp').addEventListener('click', saveProp);
  document.getElementById('propImage').addEventListener('change', (e)=> { if(e.target.files && e.target.files[0]) handlePropImage(e.target.files[0]); });
  document.getElementById('exportLeads').addEventListener('click', exportLeadsCSV);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('enablePush').addEventListener('click', enablePush);

  // preview image element
  if(!$('propImagePreview')){ const p = document.createElement('img'); p.id='propImagePreview'; p.className='img-thumb'; document.getElementById('page-projects').appendChild(p); }

  // initial render and theme
  saveAll();
  showTab('leads');
  if(localStorage.getItem('dark')==='1') setTheme(true);
});

/* util */
function escapeHtml(text){ return String(text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }