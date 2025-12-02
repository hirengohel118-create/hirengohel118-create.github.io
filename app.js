
(() => {
  const $ = id => document.getElementById(id);
  const qsa = sel => document.querySelectorAll(sel);
  let leads = JSON.parse(localStorage.getItem('leads')||'[]');
  let projects = JSON.parse(localStorage.getItem('projects')||'[]');
  let settings = JSON.parse(localStorage.getItem('vem_settings')||'{}');
  if(!settings.accent) settings.accent='#3B82F6';
  function applySettings(){ document.body.style.setProperty('--accent',settings.accent); $('totalLeads') && ($('totalLeads').innerText = leads.length); $('totalProjects') && ($('totalProjects').innerText = projects.length); }
  function renderLeads(){
    const list = $('leadList'); list.innerHTML=''; if(!leads.length) {$('leadsEmpty').style.display='block';} else {$('leadsEmpty').style.display='none';}
    leads.forEach((l,i)=>{
      const card=document.createElement('div'); card.className='lead-card';
      const row=document.createElement('div'); row.className='lead-row';
      const left=document.createElement('div'); left.className='lead-left';
      const title=document.createElement('div'); title.textContent=l.name;
      const meta=document.createElement('div'); meta.className='lead-meta'; meta.textContent=`${l.ptype} • ${l.config} • ${l.location || ''} • ${l.budget || ''}`;
      left.appendChild(title); left.appendChild(meta);
      const actions=document.createElement('div'); actions.className='card-actions';
      const call=document.createElement('button'); call.className='small-btn call'; call.textContent='Call'; call.onclick=()=> location.href=`tel:${l.phone}`;
      const wa=document.createElement('button'); wa.className='small-btn wa'; wa.textContent='WhatsApp'; wa.onclick=()=> window.open(`https://wa.me/${(l.phone||'').replace(/\s+/g,'')}`);
      const edit=document.createElement('button'); edit.className='small-btn edit'; edit.textContent='Edit'; edit.onclick=()=> openForm(i);
      const del=document.createElement('button'); del.className='small-btn delete'; del.textContent='Delete'; del.onclick=()=>{ if(confirm('Delete?')){ leads.splice(i,1); save(); renderLeads(); } };
      actions.append(call,wa,edit,del);
      row.appendChild(left); row.appendChild(actions);
      card.appendChild(row);
      // hidden details
      const details=document.createElement('div'); details.className='lead-meta'; details.style.display='none'; details.innerHTML = `<br>Follow: ${l.fdate||'N/A'}<br>Status: ${l.status||''}<br>Notes: ${l.notes||''}`;
      card.appendChild(details);
      card.addEventListener('click',(e)=>{ if(e.target.tagName==='BUTTON') return; details.style.display = details.style.display==='none'?'block':'none'; });
      list.appendChild(card);
    });
    applySettings();
    // update badge
    const today = new Date().toISOString().slice(0,10);
    const count = leads.filter(x=>x.fdate && x.fdate.slice(0,10)===today).length;
    $('badge').innerText = count?count:'';
  }
  function save(){ localStorage.setItem('leads',JSON.stringify(leads)); }
  function openForm(idx=null){
    $('leadForm').style.display='flex';
    if(idx===null){ $('name').value=''; $('phone').value=''; $('ptype').value='Residential'; $('config').value='2 BHK'; $('location').value=''; $('budget').value=''; $('status').value='New Lead'; $('fdate').value=''; $('notes').value=''; window._editing=null; }
    else { const l=leads[idx]; $('name').value=l.name; $('phone').value=l.phone; $('ptype').value=l.ptype; $('config').value=l.config; $('location').value=l.location; $('budget').value=l.budget; $('status').value=l.status; $('fdate').value=l.fdate; $('notes').value=l.notes; window._editing=idx; }
  }
  $('addLeadBtn') && $('addLeadBtn').addEventListener('click',()=>openForm(null));
  $('cancelLead') && $('cancelLead').addEventListener('click',()=>$('leadForm').style.display='none');
  $('saveLead') && $('saveLead').addEventListener('click',()=>{
    const name=$('name').value.trim(), phone=$('phone').value.trim(); if(!name||!phone){alert('Name and phone required');return;}
    const obj={name,phone,ptype:$('ptype').value,config:$('config').value,location:$('location').value,budget:$('budget').value,status:$('status').value,fdate:$('fdate').value,notes:$('notes').value,createdAt:new Date().toISOString()};
    if(window._editing===null) leads.unshift(obj); else leads[window._editing]=obj;
    save(); $('leadForm').style.display='none'; renderLeads();
  });
  // tabs
  qsa('.tab').forEach(t=>t.addEventListener('click',()=>{
    qsa('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    qsa('.tab-content').forEach(c=>c.classList.remove('active')); const target=t.getAttribute('data-tab'); document.getElementById(target).classList.add('active');
  }));
  // init
  renderLeads();
})();
