// Vamika Estate CRM — PWA local-only app (custom bundle)
(() => {
  const KEY = 'vamika_crm_v1';
  const defaults = { appName: 'Vamika Estate CRM', waSignature: '- Hiren, Vamika Estate', leads: [], props: [] };

  const tabs = [...document.querySelectorAll('.tab')];
  const views = [...document.querySelectorAll('.view')];
  const leadList = document.getElementById('leadList');
  const propList = document.getElementById('propList');
  const todayList = document.getElementById('todayList');
  const newLeadBtn = document.getElementById('newLeadBtn');
  const modal = document.getElementById('modal');
  const propModal = document.getElementById('propModal');
  const leadForm = document.getElementById('leadForm');
  const propForm = document.getElementById('propForm');
  const leadTemplate = document.getElementById('leadTemplate').content;
  const propTemplate = document.getElementById('propTemplate').content;
  const leadSearch = document.getElementById('leadSearch');
  const propSearch = document.getElementById('propSearch');
  const themeToggle = document.getElementById('themeToggle');
  const askNotif = document.getElementById('askNotif');

  let state = loadState();
  document.getElementById('appName').value = state.appName || defaults.appName;
  document.getElementById('waSignature').value = state.waSignature || defaults.waSignature;

  // theme
  let theme = localStorage.getItem('crm_theme') || 'light';
  setTheme(theme);
  // expose a global setter so index can toggle theme from Settings
  window.setCrmTheme = function(t) {{ theme = t; localStorage.setItem('crm_theme', t); setTheme(t); }};
  themeToggle.addEventListener('click', () => { theme = (theme === 'light') ? 'dark' : 'light'; localStorage.setItem('crm_theme', theme); setTheme(theme); });

  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    views.forEach(v => v.classList.add('hidden'));
    document.getElementById(t.dataset.tab).classList.remove('hidden');
    if(t.dataset.tab === 'today') renderToday();
  }));

  newLeadBtn.addEventListener('click', () => openLeadModal());
  document.getElementById('cancelModal').addEventListener('click', closeLeadModal);
  document.getElementById('cancelProp').addEventListener('click', closePropModal);

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('leadId').value;
    const name = document.getElementById('leadName').value.trim();
    const phone = normalizePhone(document.getElementById('leadPhone').value.trim());
    const req = document.getElementById('leadReq').value.trim();
    const note = document.getElementById('leadNote').value.trim();
    const follow = document.getElementById('leadFollow').value ? new Date(document.getElementById('leadFollow').value).getTime() : null;
    if(!name || !phone) return alert('Name and phone required');
    if(id) { state.leads = state.leads.map(l => l.id === id ? {...l,name,phone,req,note,follow} : l); }
    else { state.leads.push({ id: 'l_'+Date.now(), name, phone, req, note, follow, status:'new', created:Date.now() }); }
    saveState(); closeLeadModal(); renderLeads(); scheduleChecks();
  });

  propForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('propId').value;
    const name = document.getElementById('propName').value.trim();
    const msg = document.getElementById('propMsg').value.trim();
    const images = (propImages || []).slice();
    if(!name) return alert('Project name required');
    if(id) { state.props = state.props.map(p => p.id === id ? {...p,name,msg,images} : p); }
    else { state.props.push({ id:'p_'+Date.now(), name, msg, images, created:Date.now() }); }
    saveState(); closePropModal(); renderProps();
  });

  // images
  let propImages = [];
  document.getElementById('addImageUrl').addEventListener('click', () => {
    const url = document.getElementById('propImageUrl').value.trim();
    if(url) { propImages.push({ type:'url', src:url }); document.getElementById('propImageUrl').value=''; renderPropImages(); }
  });
  document.getElementById('propFile').addEventListener('change', (e) => {
    const files = [...e.target.files];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => { propImages.push({ type:'data', src: reader.result }); renderPropImages(); };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  function renderPropImages() {
    const div = document.getElementById('propImagesPreview');
    div.innerHTML = '';
    propImages.forEach((im, idx) => {
      const img = document.createElement('img'); img.src = im.src;
      const wrap = document.createElement('div'); wrap.style.position='relative';
      const del = document.createElement('button'); del.textContent='×'; del.title='Remove'; del.className='btn small';
      del.style.position='absolute';del.style.right='4px';del.style.top='4px';
      del.addEventListener('click', ()=>{ propImages.splice(idx,1); renderPropImages(); });
      wrap.appendChild(img); wrap.appendChild(del); div.appendChild(wrap);
    });
  }

  function renderLeads() {
    leadList.innerHTML = '';
    const q = (leadSearch.value||'').toLowerCase();
    const list = state.leads.slice().sort((a,b)=>b.created-a.created).filter(l => (l.name+ ' '+ (l.phone||'')+ ' '+ (l.req||'')+ ' '+ (l.note||'')).toLowerCase().includes(q));
    if(list.length===0) leadList.innerHTML = '<li class="item"><div>No leads</div></li>';
    list.forEach(l => {
      const node = document.importNode(leadTemplate, true);
      node.querySelector('.name').textContent = l.name;
      node.querySelector('.meta').textContent = (l.phone||'') + (l.req ? ' • '+l.req: '') + (l.follow ? ' • Follow: '+ new Date(l.follow).toLocaleString() : '');
      node.querySelector('.whatsapp').addEventListener('click', ()=> openWhatsAppForLead(l));
      node.querySelector('.send-template').addEventListener('click', ()=> choosePropToSend(l));
      node.querySelector('.edit').addEventListener('click', ()=> openLeadModal(l));
      node.querySelector('.del').addEventListener('click', ()=> { if(confirm('Delete lead?')) { state.leads = state.leads.filter(x=>x.id!==l.id); saveState(); renderLeads(); }});
      leadList.appendChild(node);
    });
  }

  function renderProps() {
    propList.innerHTML = '';
    const q = (propSearch.value||'').toLowerCase();
    const list = state.props.slice().sort((a,b)=>b.created-a.created).filter(p => (p.name+' '+(p.msg||'')).toLowerCase().includes(q));
    if(list.length===0) propList.innerHTML = '<li class="item"><div>No projects</div></li>';
    list.forEach(p => {
      const node = document.importNode(propTemplate, true);
      node.querySelector('.name').textContent = p.name;
      node.querySelector('.meta').textContent = (p.msg||'').slice(0,80);
      node.querySelector('.preview').addEventListener('click', ()=> previewProperty(p));
      node.querySelector('.share').addEventListener('click', ()=> sharePropertyDirect(p));
      node.querySelector('.edit').addEventListener('click', ()=> openPropModal(p));
      node.querySelector('.del').addEventListener('click', ()=> { if(confirm('Delete project?')) { state.props = state.props.filter(x=>x.id!==p.id); saveState(); renderProps(); }});
      propList.appendChild(node);
    });
  }

  function renderToday() {
    todayList.innerHTML = '';
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const list = state.leads.filter(l => l.follow && l.follow >= today.getTime() && l.follow < tomorrow.getTime()).sort((a,b)=>a.follow-b.follow);
    if(list.length===0) todayList.innerHTML = '<li class="item"><div>No follow-ups today</div></li>';
    list.forEach(l => {
      const li = document.createElement('li'); li.className='item';
      const left = document.createElement('div'); left.innerHTML = `<strong>${l.name}</strong><div class="meta">${l.phone} • ${new Date(l.follow).toLocaleTimeString()}</div>`;
      const right = document.createElement('div'); right.className='item-actions';
      const w = document.createElement('button'); w.className='btn small whatsapp'; w.textContent='WhatsApp'; w.onclick=()=>openWhatsAppForLead(l);
      right.appendChild(w);
      li.appendChild(left); li.appendChild(right);
      todayList.appendChild(li);
    });
  }

  async function openWhatsAppForLead(lead) {
    const text = `${lead.name} — ${lead.req || ''}\n${lead.note || ''}\n${state.waSignature || ''}`;
    await openWhatsApp(lead.phone, text);
  }

  function choosePropToSend(lead) {
    if(state.props.length===0) return alert('No projects saved. Add one first.');
    const names = state.props.map((p,i)=>`${i+1}. ${p.name}`).join('\n');
    const idx = prompt(`Choose project to send:\n${names}\nEnter number (1-${state.props.length})`);
    const n = Number(idx) - 1;
    if(isNaN(n) || n < 0 || n >= state.props.length) return;
    const prop = state.props[n];
    sharePropertyToLead(prop, lead);
  }

  async function sharePropertyToLead(prop, lead) {
    const text = `${prop.name}\n\n${prop.msg || ''}\n\n${state.waSignature || ''}`;
    const files = [];
    for(const im of (prop.images || [])) {
      if(im.type === 'data') files.push(dataURLtoFile(im.src, `${prop.id || 'img'}.jpg`));
      else if(im.type === 'url') {
        try { const resp = await fetch(im.src); const blob = await resp.blob(); const fname = im.src.split('/').pop().split('?')[0] || 'img.jpg'; files.push(new File([blob], fname, { type: blob.type })); }
        catch(e){ console.warn('image fetch failed', e); }
      }
    }
    if(files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
      try { await navigator.share({ files, text }); return; } catch(e){ console.warn('share failed', e); }
    }
    await openWhatsApp(lead.phone, text);
  }

  async function sharePropertyDirect(prop) {
    const text = `${prop.name}\n\n${prop.msg || ''}\n\n${state.waSignature || ''}`;
    const files = [];
    for(const im of (prop.images || [])) if(im.type === 'data') files.push(dataURLtoFile(im.src, `${prop.id||'img'}.jpg`));
    if(files.length>0 && navigator.canShare && navigator.canShare({ files })) {
      try { await navigator.share({ files, text }); return; } catch(e){console.warn(e)}
    }
    try { await navigator.share({ text }); } catch(e){ alert('Sharing not supported. Copy the message and paste into WhatsApp.'); copyToClipboard(text); }
  }

  async function openWhatsApp(number, text) {
    const num = normalizePhone(number);
    const encoded = encodeURIComponent(text || '');
    const waUrl = `https://wa.me/${num}?text=${encoded}`;
    const waApp = `whatsapp://send?phone=${num}&text=${encoded}`;
    try {
      const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      if(isiOS || isAndroid) { window.location.href = waApp; setTimeout(()=> window.open(waUrl, '_blank'), 800); }
      else window.open(waUrl, '_blank');
    } catch(e) { window.open(waUrl, '_blank'); }
  }

  function previewProperty(p) {
    let html = `${p.name}\n\n${p.msg || ''}\n\n`;
    if(p.images && p.images.length) p.images.forEach(im => html += `${im.src}\n`);
    alert(html);
  }

  function openLeadModal(lead) {
    document.getElementById('modal').setAttribute('aria-hidden','false');
    document.getElementById('modalTitle').textContent = lead ? 'Edit Lead' : 'New Lead';
    document.getElementById('leadId').value = lead ? lead.id : '';
    document.getElementById('leadName').value = lead ? lead.name : '';
    document.getElementById('leadPhone').value = lead ? lead.phone : '';
    document.getElementById('leadReq').value = lead ? lead.req : '';
    document.getElementById('leadNote').value = lead ? lead.note : '';
    document.getElementById('leadFollow').value = lead && lead.follow ? new Date(lead.follow).toISOString().slice(0,16) : '';
  }
  function closeLeadModal() { document.getElementById('modal').setAttribute('aria-hidden','true'); leadForm.reset(); }

  function openPropModal(p) {
    document.getElementById('propModal').setAttribute('aria-hidden','false');
    document.getElementById('propModalTitle').textContent = p ? 'Edit Project' : 'New Project';
    document.getElementById('propId').value = p ? p.id : '';
    document.getElementById('propName').value = p ? p.name : '';
    document.getElementById('propMsg').value = p ? p.msg : '';
    propImages = p ? (p.images || []).slice() : [];
    renderPropImages();
  }
  function closePropModal() { document.getElementById('propModal').setAttribute('aria-hidden','true'); propForm.reset(); propImages = []; renderPropImages(); }

  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='vamika_crm_backup.json'; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('importBtn').addEventListener('click', async () => {
    const txt = prompt('Paste JSON exported data here');
    if(!txt) return;
    try { const obj = JSON.parse(txt); state = {...defaults, ...obj}; saveState(); renderAll(); alert('Imported'); } catch(e){ alert('Invalid JSON') }
  });
  document.getElementById('clearBtn').addEventListener('click', ()=> {
    if(confirm('Clear ALL local data? This cannot be undone.')) { localStorage.removeItem(KEY); state = loadState(); renderAll(); }
  });

  leadSearch.addEventListener('input', renderLeads);
  propSearch.addEventListener('input', renderProps);
  document.getElementById('appName').addEventListener('input', (e)=> { state.appName = e.target.value; saveState(); });
  document.getElementById('waSignature').addEventListener('input', (e)=> { state.waSignature = e.target.value; saveState(); });

  askNotif.addEventListener('click', async () => {
    if(!('Notification' in window)) return alert('Notifications not supported on this device/browser.');
    const res = await Notification.requestPermission();
    if(res === 'granted') alert('Notifications enabled. App will remind at follow-up times (while app runs or if PWA installed and supported).');
    else alert('Notifications blocked. You can enable from browser settings.');
  });

  function loadState(){ try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); return {...defaults, ...(s||{})}; }catch(e){ return {...defaults}; } }
  function saveState(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  function normalizePhone(p) {
    if(!p) return '';
    let s = p.replace(/[^\d]/g,'');
    if(s.length === 10) s = '91'+s;
    return s;
  }
  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }
  function copyToClipboard(text){ navigator.clipboard?.writeText(text).then(()=>alert('Text copied')) }

  function renderAll(){ renderLeads(); renderProps(); renderToday(); }
  renderAll();

  function scheduleChecks(){ checkDue(); if(window._crmInterval) clearInterval(window._crmInterval); window._crmInterval = setInterval(checkDue, 20000); }
  scheduleChecks();

  function checkDue(){
    const now = Date.now();
    state.leads.forEach(l => {
      if(l.follow && l.follow <= now && !l.lastNotified) {
        notify(`Follow-up: ${l.name}`, `Call ${l.name} • ${l.phone}`);
        l.lastNotified = Date.now();
        saveState();
      }
    });
    renderToday();
  }

  function notify(title, body){
    try {
      if(Notification.permission === 'granted') {
        const n = new Notification(title, { body });
        n.onclick = () => window.focus();
      } else {
        alert(title + '\n' + body);
      }
    } catch(e) { console.warn(e); alert(title + '\n' + body); }
  }

  window.addEventListener('focus', () => { state = loadState(); renderAll(); scheduleChecks(); });

  if(state.leads.length===0 && state.props.length===0) {
    state.props.push({ id:'p_sample', name:'2&3 BHK Shela (Sample)', msg:'2&3 BHK near WAPA. Price start ₹53L (all-inclusive). 25+ amenities. Call 7046869462', images:[], created:Date.now() });
    saveState();
    renderAll();
  }

  function setTheme(t){ document.body.classList.remove('light','dark'); document.body.classList.add(t); }
})();
