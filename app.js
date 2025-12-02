
// app.js - Vamika Estate CRM (Android-optimized)
// Features: theme toggle, leads/projects, Option A exact-datetime follow-up reminders, auto-request permission on Android

(function(){
  const qs=id=>document.getElementById(id);
  // Theme
  const savedTheme = localStorage.getItem('vemika_theme') || 'light';
  if(savedTheme==='dark') document.documentElement.setAttribute('data-theme','dark');
  function setTheme(t){ localStorage.setItem('vemika_theme',t); document.documentElement.setAttribute('data-theme', t); qs('themeSwitch').checked = (t==='dark'); }
  window.addEventListener('DOMContentLoaded', ()=>{ qs('themeSwitch').checked = (savedTheme==='dark'); qs('themeSwitch').addEventListener('change', ()=> setTheme(qs('themeSwitch').checked?'dark':'light')); });

  // Data
  let leads = JSON.parse(localStorage.getItem('vemika_leads_v1')||'[]');
  let projects = JSON.parse(localStorage.getItem('vemika_projects_v1')||'[]');

  function saveAll(){ localStorage.setItem('vemika_leads_v1', JSON.stringify(leads)); localStorage.setItem('vemika_projects_v1', JSON.stringify(projects)); renderAll(); }

  // Render leads
  function renderLeads(){
    const container = qs('leadsList'); container.innerHTML = '';
    if(!leads.length) { container.innerHTML = '<div class="card">No leads yet.</div>'; return; }
    leads.forEach((l,i)=>{
      const div = document.createElement('div'); div.className='lead card';
      const follow = l.follow? new Date(l.follow).toLocaleString() : 'No follow-up';
      div.innerHTML = '<div style="display:flex;justify-content:space-between"><div><strong>'+escapeHtml(l.name||'—')+'</strong><div style="font-size:12px;color:#666">'+escapeHtml(l.phone||'')+'</div></div><div style="text-align:right"><div style="font-size:13px">'+follow+'</div><div style="margin-top:6px"><button data-i="'+i+'" class="btn small edit">Edit</button> <button data-i="'+i+'" class="btn small del">Delete</button></div></div></div><div style="margin-top:8px">'+escapeHtml(l.notes||'')+'</div>';
      container.appendChild(div);
    });
    Array.from(container.querySelectorAll('button.del')).forEach(b=>b.addEventListener('click', function(){ const i=parseInt(this.getAttribute('data-i')); if(confirm('Delete this lead?')){ leads.splice(i,1); saveAll(); } }));
    Array.from(container.querySelectorAll('button.edit')).forEach(b=>b.addEventListener('click', function(){ const i=parseInt(this.getAttribute('data-i')); const L=leads[i]; qs('lead_name').value=L.name||''; qs('lead_phone').value=L.phone||''; qs('lead_propertyType').value=L.property||'Flat'; qs('lead_bhk').value=L.bhk||'2 BHK'; qs('lead_location').value=L.location||''; qs('lead_budget').value=L.budget||''; qs('lead_follow').value=L.follow?new Date(L.follow).toISOString().slice(0,16):''; qs('lead_notes').value=L.notes||''; leads.splice(i,1); saveAll(); }));
  }

  // Render projects
  function renderProjects(){ const c=qs('projectsList'); c.innerHTML=''; if(!projects.length){ c.innerHTML='<div class="card">No projects yet.</div>'; return;} projects.forEach((p,i)=>{ const d=document.createElement('div'); d.className='card'; d.innerHTML='<strong>'+escapeHtml(p.title)+'</strong><div style="font-size:13px;color:#666">'+escapeHtml(p.loc)+'</div><div style="margin-top:6px">'+escapeHtml(p.desc||'')+'</div>'; c.appendChild(d); }); }

  function renderAll(){ renderLeads(); renderProjects(); renderFollowups(); }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }

  // Save lead
  function saveLeadFromForm(){
    const name = qs('lead_name').value.trim(); const phone = qs('lead_phone').value.trim();
    if(!name && !phone){ alert('Enter at least name or phone'); return; }
    const lead = { id:'L'+Date.now(), name, phone, property:qs('lead_propertyType').value, bhk:qs('lead_bhk').value, location:qs('lead_location').value, budget:qs('lead_budget').value, follow: qs('lead_follow').value? new Date(qs('lead_follow').value).toISOString():null, notes:qs('lead_notes').value.trim(), created:new Date().toISOString(), notified:false };
    leads.push(lead); saveAll(); scheduleNotification(lead); qs('lead_name').value=''; qs('lead_phone').value=''; qs('lead_notes').value=''; qs('lead_follow').value=''; alert('Lead saved. Follow-up scheduled (if permission granted).');
  }

  // Save project
  function saveProject(){ const title=qs('proj_title').value.trim(); if(!title){ alert('Enter project title'); return;} const p={id:'P'+Date.now(), title, loc:qs('proj_loc').value, price:qs('proj_price').value, desc:qs('proj_desc').value}; projects.push(p); saveAll(); qs('proj_title').value=''; qs('proj_loc').value=''; qs('proj_price').value=''; qs('proj_desc').value=''; alert('Project saved'); }

  // Followups list
  function renderFollowups(){ const c=qs('followupsList'); c.innerHTML=''; const upcoming = leads.filter(l=>l.follow && !l.notified).sort((a,b)=> new Date(a.follow)- new Date(b.follow)); if(!upcoming.length){ c.innerHTML='<div class="card">No upcoming follow-ups.</div>'; return;} upcoming.forEach(l=>{ const d=document.createElement('div'); d.className='card'; d.innerHTML='<strong>'+escapeHtml(l.name||'—')+'</strong><div style="font-size:13px;color:#666">'+(l.follow?new Date(l.follow).toLocaleString():'')+'</div>'; c.appendChild(d); }); }

  // Schedule notification (Option A)
  function scheduleNotification(lead){
    if(!lead.follow) return;
    const t = new Date(lead.follow).getTime(); const delta = t - Date.now();
    if(delta <= 0){ if(!lead.notified){ showNotificationForLead(lead); lead.notified=true; saveAll(); } return; }
    // schedule timeout while page is open
    setTimeout(function(){ showNotificationForLead(lead); lead.notified=true; saveAll(); }, delta);
  }

  async function showNotificationForLead(lead){
    const title = '🔔 Follow-up: '+(lead.name||'Lead'); const body = (lead.phone?lead.phone+' • ':'') + (lead.property||'') + ' ' + (lead.bhk||'');
    const options = { body, tag: 'followup-'+(lead.id||Date.now()), data:{lead} };
    try{
      const reg = await navigator.serviceWorker.getRegistration();
      if(reg && reg.showNotification) reg.showNotification(title, options);
      else if(window.Notification && Notification.permission==='granted') new Notification(title, options);
    }catch(e){ console.error(e); }
  }

  // Init
  document.addEventListener('DOMContentLoaded', function(){
    // Tab switching
    Array.from(document.querySelectorAll('.tab')).forEach(btn=> btn.addEventListener('click', function(){ document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); this.classList.add('active'); document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active')); document.getElementById(this.getAttribute('data-tab')).classList.add('active'); }));
    // Attach save handlers
    const sb = qs('saveLeadBtn'); if(sb) sb.addEventListener('click', saveLeadFromForm);
    const sp = qs('saveProjectBtn'); if(sp) sp.addEventListener('click', saveProject);
    // restore data & render
    renderAll();
    // schedule pending
    leads.forEach(function(l){ if(l.follow && !l.notified) scheduleNotification(l); });
    // auto-request permission for Android
    setTimeout(function(){ if(window.Notification && Notification.requestPermission) Notification.requestPermission(); }, 900);
  });

  // Expose for console if needed
  window._vemika = { leads, projects, saveAll };

})();
