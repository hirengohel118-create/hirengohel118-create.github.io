
const $ = (id)=>document.getElementById(id);
let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let props = JSON.parse(localStorage.getItem('props')||'[]');

/* RENDER LEADS */
function renderLeads(){
  const el = $('leadsList');
  el.innerHTML='';
  if(leads.length===0){ el.innerHTML='<div class="small">No leads yet</div>'; return; }

  leads.forEach((l, idx)=>{
    let div = document.createElement('div');
    div.className='lead-row';
    div.innerHTML = `
      <div>
        <strong>${l.name}</strong>
        <div class="small">${l.requirement} • ${l.location} • ${l.status}</div>
      </div>
      <div class="lead-actions">
        <button class="btn" onclick="callLead(${idx})">📞</button>
        <button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button>
        <button class="btn" onclick="editLead(${idx})">✏️</button>
      </div>
    `;
    el.appendChild(div);
  });
}

/* RENDER PROPERTIES */
function renderProps(){
  const el = $('propList'); 
  el.innerHTML='';
  if(props.length===0){ el.innerHTML='<div class="small">No properties yet</div>'; return; }
  props.forEach((p, idx)=>{
    let d = document.createElement('div');
    d.className='lead-row';
    d.innerHTML = `
      <div><strong>${p.title}</strong><div class="small">${p.price}</div></div>
      <div><button class="btn" onclick="copyProp(${idx})">Copy Msg</button></div>
    `;
    el.appendChild(d);
  });
}

/* RENDER REMINDERS */
function renderReminders(){
  const el = $('remindersList');
  el.innerHTML='';
  const now = new Date();
  const pending = leads.filter(l=>l.follow);

  if(pending.length===0){ el.innerHTML='<div class="small">No reminders</div>'; return; }

  pending.forEach((l,idx)=>{
    let d = document.createElement('div');
    d.className='lead-row';
    const when = l.follow ? new Date(l.follow).toLocaleString() : '-';
    d.innerHTML = `
      <div><strong>${l.name}</strong>
      <div class="small">Follow-up: ${when}</div></div>
      <div>
        <button class="btn" onclick="callLead(${idx})">Call</button>
        <button class="wa-btn" onclick="whatsappLead(${idx})">WhatsApp</button>
      </div>`;
    el.appendChild(d);
  });
}

/* SAVE ALL */
function saveAll(){
  localStorage.setItem('leads', JSON.stringify(leads));
  localStorage.setItem('props', JSON.stringify(props));
  renderLeads(); renderProps(); renderReminders();
}

/* ADD LEAD */
$('saveLead').addEventListener('click', ()=>{
  let l = {
    name: $('leadName').value||'Unnamed',
    phone: $('leadPhone').value||'',
    requirement: $('leadReq').value||'',
    location: $('leadLoc').value||'',
    budget: $('leadBudget').value||'',
    status: $('leadStatus').value||'New',
    follow: $('leadFollow').value||'',
    notes: $('leadNotes').value||'',
    created: new Date().toISOString()
  };

  leads.unshift(l);
  saveAll();
  $('leadForm').classList.add('hidden');

  ['leadName','leadPhone','leadReq','leadLoc','leadBudget','leadNotes','leadFollow']
  .forEach(id=>$(id).value='');
});

$('cancelLead').addEventListener('click', ()=> $('leadForm').classList.add('hidden') );
$('addLeadBtn').addEventListener('click', ()=> $('leadForm').classList.toggle('hidden') );

/* PROPERTIES */
$('saveProp').addEventListener('click', ()=>{
  const p = {
    title: $('propTitle').value||'Untitled',
    price: $('propPrice').value||''
  };
  props.unshift(p);
  saveAll();
  $('propTitle').value='';
  $('propPrice').value='';
});

/* CALL */
function callLead(index){
  const l = leads[index];
  if(!l.phone){ alert('No phone number'); return; }
  window.location.href = `tel:${l.phone}`;
}

/* WHATSAPP */
function whatsappLead(index){
  const l = leads[index];
  if(!l.phone){ alert('No phone number'); return; }

  const text = `Namaste ${l.name} 🙏%0AProperty details as per your requirement:%0A${l.requirement} • ${l.location} • Budget: ${l.budget}%0ACall: 7046869462`;

  const url = `https://wa.me/${l.phone.replace(/\D/g,'')}?text=${text}`;
  window.open(url, '_blank');
}

/* EDIT LEAD */
function editLead(index){
  const l = leads[index];
  $('leadName').value = l.name;
  $('leadPhone').value = l.phone;
  $('leadReq').value = l.requirement;
  $('leadLoc').value = l.location;
  $('leadBudget').value = l.budget;
  $('leadNotes').value = l.notes;
  $('leadFollow').value = l.follow;

  leads.splice(index,1);
  saveAll();

  $('leadForm').classList.remove('hidden');
}

/* COPY PROPERTY */
function copyProp(idx){
  const p = props[idx];
  const msg = `Property: ${p.title}\nPrice: ${p.price}\nCall: 7046869462`;
  navigator.clipboard.writeText(msg).then(()=>alert('Project details copied!'));
}

/* THEME */
const themeBtn = $('themeBtn');
function setTheme(dark){
  if(dark){
    document.body.classList.add('dark');
    themeBtn.textContent='☀️';
    localStorage.setItem('dark','1');
  }else{
    document.body.classList.remove('dark');
    themeBtn.textContent='🌙';
    localStorage.removeItem('dark');
  }
}
themeBtn.addEventListener('click', ()=> setTheme(!document.body.classList.contains('dark')) );
if(localStorage.getItem('dark')==='1') setTheme(true);

/* INITIAL RENDER */
saveAll();
