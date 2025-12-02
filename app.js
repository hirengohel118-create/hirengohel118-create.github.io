
// Simple follow-up reminder (Option A exact time)
document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('saveLeadBtn');
  if(btn){
    btn.addEventListener('click', ()=>{
      const t = document.getElementById('lead_follow').value;
      if(!t){ alert('Lead saved (no follow-up set)'); return; }
      const when = new Date(t).getTime();
      const now = Date.now();
      const delta = when - now;
      if(delta <= 0){
        notifyNow();
        return;
      }
      setTimeout(()=>{ notifyNow(); }, delta);
      alert('Lead saved. Follow-up reminder scheduled.');
    });
  }
});

function notifyNow(){
  if(Notification.permission === 'granted'){
    new Notification('🔔 Follow-up Reminder', { body: 'It is time to follow-up this lead.' });
  }
}

window.enablePushNow = function(){
  Notification.requestPermission().then(p=>{
    if(p==='granted') alert('Notifications enabled.');
    else alert('Permission not granted.');
  });
};
