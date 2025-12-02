let leads = JSON.parse(localStorage.getItem('leads')||'[]');

function save() { localStorage.setItem('leads', JSON.stringify(leads)); }

function render() {
  let list = document.getElementById('leadList');
  list.innerHTML='';
  leads.forEach((l,i)=>{
    let d=document.createElement('div');
    d.innerHTML= l.name + " - " + l.phone;
    list.appendChild(d);
  });

  // followups
  let f = document.getElementById('followList');
  f.innerHTML='';
  let today = new Date().toISOString().slice(0,10);
  let count=0;
  leads.forEach(l=>{
    if(l.fdate && l.fdate.slice(0,10)==today){
      count++;
      let d=document.createElement('div');
      d.innerHTML=l.name+" - Follow-up at "+l.fdate;
      f.appendChild(d);
    }
  });
  document.getElementById('badge').innerText = count>0?count:'';
}

document.querySelectorAll('.tab').forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    let tab=t.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
  };
});

document.getElementById('addLeadBtn').onclick=()=>{
  document.getElementById('leadForm').style.display='block';
};

document.getElementById('closeForm').onclick=()=>{
  document.getElementById('leadForm').style.display='none';
};

document.getElementById('saveLead').onclick=()=>{
  let l={
    name:document.getElementById('name').value,
    phone:document.getElementById('phone').value,
    ptype:document.getElementById('ptype').value,
    config:document.getElementById('config').value,
    location:document.getElementById('location').value,
    budget:document.getElementById('budget').value,
    status:document.getElementById('status').value,
    fdate:document.getElementById('fdate').value,
    notes:document.getElementById('notes').value
  };
  leads.push(l);
  save();
  render();
  document.getElementById('leadForm').style.display='none';
};

let modeToggle=document.getElementById('modeToggle');
modeToggle.onchange=()=>{
  let mode=modeToggle.checked?'dark':'light';
  document.body.className=mode;
  localStorage.setItem('mode',mode);
};

let m=localStorage.getItem('mode')||'light';
document.body.className=m;
modeToggle.checked = m==='dark';

render();
