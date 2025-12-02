
// app.js - Auto-permission + Option A follow-up scheduler
(function(){
  function qs(id){ return document.getElementById(id); }
  let leads = JSON.parse(localStorage.getItem('vemika_leads_v1') || '[]');

  function saveAll(){ localStorage.setItem('vemika_leads_v1', JSON.stringify(leads)); updateCounters(); }
  function updateCounters(){ qs('lead_count').textContent = (leads.length||0); 
    let projects = JSON.parse(localStorage.getItem('vemika_projects_v1')||'[]'); if(qs('project_count')) qs('project_count').textContent = projects.length||0;
  }

  function renderLeads(){
    const container = qs('leadsList');
    if(!container) return;
    container.innerHTML = '';
    if(!leads.length){ container.innerHTML = '<div class="card">No leads yet.</div>'; return; }
    leads.forEach((l,i)=>{
      const div = document.createElement('div'); div.className='card lead';
      const followText = l.follow ? new Date(l.follow).toLocaleString() : 'No follow-up';
      div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>'+escapeHtml(l.name||'—')+'</strong><div style="font-size:12px;color:#999">'+escapeHtml(l.phone||'')+'</div></div><div style="text-align:right"><div style="font-size:13px">'+followText+'</div><div style="margin-top:6px"><button data-i="'+i+'" class="btn btn-small edit">Edit</button> <button data-i="'+i+'" class="btn btn-small del">Delete</button></div></div></div><div style="margin-top:8px">'+escapeHtml(l.notes||'')+'</div>';
      container.appendChild(div);
    });
    Array.from(container.querySelectorAll('button.del')).forEach(b=>{
      b.addEventListener('click', function(){ const i=parseInt(this.getAttribute('data-i')); if(confirm('Delete this lead?')){ leads.splice(i,1); saveAll(); renderLeads(); }});
    });
    Array.from(container.querySelectorAll('button.edit')).forEach(b=>{
      b.addEventListener('click', function(){ const i=parseInt(this.getAttribute('data-i')); const l=leads[i]; qs('lead_name').value=l.name||''; qs('lead_phone').value=l.phone||''; qs('lead_propertyType').value=l.property||''; qs('lead_bhk').value=l.bhk||'2 BHK'; qs('lead_location').value=l.location||''; qs('lead_budget').value=l.budget||''; qs('lead_follow').value=l.follow?new Date(l.follow).toISOString().slice(0,16):''; qs('lead_notes').value=l.notes||''; leads.splice(i,1); saveAll(); renderLeads(); window.scrollTo({top:0,behavior:"smooth"}); });
    });
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }

  function scheduleNotification(lead){
    if(!lead.follow) return;
    const t = new Date(lead.follow).getTime();
    const delta = t - Date.now();
    if(delta <= 0){
      if(!lead.notified){ showNotificationForLead(lead); lead.notified=true; saveAll(); }
      return;
    }
    // schedule while page is open
    setTimeout(function(){ showNotificationForLead(lead); lead.notified=true; saveAll(); }, delta);
  }

  async function showNotificationForLead(lead){
    const title = '🔔 Follow-up: ' + (lead.name||'Lead');
    const body = (lead.phone?lead.phone+' • ':'') + (lead.property||'') + ' ' + (lead.bhk||'');
    const options = { body: body, tag: 'followup-'+(lead.id||Date.now()), data:{lead:lead}, renotify:true };
    try{
      const reg = await navigator.serviceWorker.getRegistration();
      if(reg && reg.showNotification){ reg.showNotification(title, options); }
      else if(window.Notification && Notification.permission==='granted'){ new Notification(title, options); }
    }catch(e){ console.error(e); }
  }

  function saveLeadFromForm(){
    const name = qs('lead_name').value.trim();
    const phone = qs('lead_phone').value.trim();
    if(!name && !phone){ alert('Enter at least name or phone'); return; }
    const lead = { id:'L'+Date.now(), name:name, phone:phone, property:qs('lead_propertyType').value, bhk:qs('lead_bhk').value, location:qs('lead_location').value, budget:qs('lead_budget').value, follow:qs('lead_follow').value?new Date(qs('lead_follow').value).toISOString():null, notes:qs('lead_notes').value.trim(), created:new Date().toISOString(), notified:false };
    leads.push(lead); saveAll(); renderLeads(); scheduleNotification(lead);
    qs('lead_name').value=''; qs('lead_phone').value=''; qs('lead_notes').value=''; qs('lead_follow').value='';
    alert('Lead saved. Follow-up scheduled (if permissions granted).');
  }

  document.addEventListener('DOMContentLoaded', function(){
    const sb = qs('saveLeadBtn'); if(sb) sb.addEventListener('click', saveLeadFromForm);
    renderLeads(); updateCounters();
    leads.forEach(function(l){ if(l.follow && !l.notified) scheduleNotification(l); });
  });

  // Expose enablePushNow and auto-permission
  window.enablePushNow = function(){
    // Try OneSignal first
    if(window.OneSignal){
      try{
        OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(function(OneSignal){
          if(OneSignal.Notifications && OneSignal.Notifications.requestPermission){
            OneSignal.Notifications.requestPermission().then(function(r){
              if(r==='granted' || Notification.permission==='granted'){ alert('Notifications enabled.'); }
            }).catch(function(){ if(Notification && Notification.requestPermission) Notification.requestPermission(); });
          } else {
            if(Notification && Notification.requestPermission) Notification.requestPermission();
          }
        });
      }catch(e){
        if(Notification && Notification.requestPermission) Notification.requestPermission();
      }
    } else {
      if(Notification && Notification.requestPermission) Notification.requestPermission();
    }
  };

})();
