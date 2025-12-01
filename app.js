const $ = id => document.getElementById(id);
let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let props = JSON.parse(localStorage.getItem('props')||'[]');

function el(html){ const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

/* Tab Navigation */
function showTab(tab){
  ['tab-leads','tab-projects','tab-followups','tab-settings'].forEach(id=>$(id).classList.remove('active'));
  ['page-leads','page-projects','page-followups','page-settings'].forEach(id=>$(id).classList.add('hidden'));
  $(`tab-${tab}`).classList.add('active');
  $(`page-${tab}`).classList.remove('hidden');
  // focus actions
  if(tab==='leads') renderLeads();
  if(tab==='projects') renderProps();
  if(tab==='followups') renderReminders();
}

/* Renders */
function renderLeads(){
  const elc = $('leadsList'); elc.innerHTML='';
  if(leads.length===0){ elc.innerHTML='<div class="small">No leads yet</div>'; return; }
  leads.forEach((l,idx)=>{
    const node = el(`
      <div class="lead-row">
        <div>
          <div style="font-weight:700;color:var(--muted);">${l.name}</div>
          <div class="small">${l.phone || ''} • ${l.requirement || ''} • ${l.status || ''}</div>
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

function renderProps(){
  const elc = $('propList'); elc.innerHTML='';
  if(props.length===0){ elc.innerHTML='<div class="small">No properties yet</div>'; return; }
  props.forEach((p,idx)=>{
    const node = el(`<div class="lead-row"><div><strong>${p.title}</strong><div class="small">${p.price}</div></div><div><button class="btn" onclick="copyProp(${idx})">Copy Msg</button></div></div>`);
    elc.appendChild(node);
  });
}

function renderReminders(){
  const elc = $('remindersList'); elc.innerHTML='';
  const now = new Date();
  const today = leads.filter(l=>l.follow && (new Date(l.follow) - now) < (1000*60*60*24*7)); // next 7 days
  if(today.length===0){ elc.innerHTML='<div class="small">No reminders</div>'; return; }
  today.forEach((l,idx)=>{
    const node = el(`<div class="lead-row"><div><strong>${l.name}</strong><div class="small">Follow: ${new Date(l.follow).toLocaleString()}</div></div><div><button class="btn" onclick="callLead(${idx})">Call</button><button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button></div></div>`);
    elc.appendChild(node);
  });
}

/* Save/load */
function saveAll(){ localStorage.setItem('leads', JSON.stringify(leads)); localStorage.setItem('props', JSON.stringify(props)); renderLeads(); renderProps(); renderReminders(); }

/* Lead actions */
function addLeadFromForm(){
  const l = { name: $('leadName').value||'Unnamed', phone: $('leadPhone').value||'', requirement: $('leadReq').value||'', location: $('leadLoc').value||'', budget: $('leadBudget').value||'', status: $('leadStatus').value||'New', follow: $('leadFollow').value||'', notes: $('leadNotes').value||'', created:new Date().toISOString() };
  leads.unshift(l); saveAll(); $('leadForm').classList.add('hidden'); ['leadName','leadPhone','leadReq','leadLoc','leadBudget','leadNotes','leadFollow'].forEach(id=>$(id).value='');
}

function callLead(i){ const l = leads[i]; if(!l || !l.phone){ alert('No phone'); return; } window.location.href = `tel:${l.phone}`; }

function whatsappLead(i){
  const l = leads[i]; if(!l || !l.phone){ alert('No phone'); return; }
  const text = `Namaste ${l.name} 🙏%0AWe have details as per your requirement:%0A${l.requirement} • ${l.location} • Budget: ${l.budget}%0ACall: 7046869462`;
  window.open(`https://wa.me/${l.phone.replace(/\D/g,'')}?text=${text}`,'_blank');
}

function editLead(i){
  const l = leads[i]; $('leadName').value=l.name; $('leadPhone').value=l.phone; $('leadReq').value=l.requirement; $('leadLoc').value=l.location; $('leadBudget').value=l.budget; $('leadNotes').value=l.notes; $('leadFollow').value=l.follow; leads.splice(i,1); saveAll(); $('leadForm').classList.remove('hidden');
}

function deleteLead(i){ if(confirm('Delete this lead?')){ leads.splice(i,1); saveAll(); } }

/* properties */
function saveProp(){ const p = { title: $('propTitle').value||'Untitled', price: $('propPrice').value||'' }; props.unshift(p); saveAll(); $('propTitle').value=''; $('propPrice').value=''; }

/* copy property */
function copyProp(i){ const p = props[i]; navigator.clipboard.writeText(`Property: ${p.title}\nPrice: ${p.price}\nCall: 7046869462`).then(()=>alert('Copied!')); }

/* theme toggle */
const themeBtn = $('themeBtn');
function setTheme(d){ if(d){ document.body.classList.add('dark'); localStorage.setItem('dark','1'); themeBtn.textContent='☀️'; } else { document.body.classList.remove('dark'); localStorage.removeItem('dark'); themeBtn.textContent='🌙'; } }
themeBtn && themeBtn.addEventListener && themeBtn.addEventListener('click', ()=> setTheme(!document.body.classList.contains('dark')));
if(localStorage.getItem('dark')==='1' || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(true);

/* init */
document.addEventListener('DOMContentLoaded', ()=>{
  saveAll();
  showTab('leads');
  $('addLeadBtn').addEventListener('click', ()=> $('leadForm').classList.toggle('hidden'));
  $('saveLead').addEventListener('click', addLeadFromForm);
  $('cancelLead').addEventListener('click', ()=> $('leadForm').classList.add('hidden'));
  $('saveProp').addEventListener('click', saveProp);
});