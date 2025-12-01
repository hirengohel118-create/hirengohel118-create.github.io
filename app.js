
const $=x=>document.getElementById(x);
let leads = JSON.parse(localStorage.getItem("leads")||"[]");
let projects = JSON.parse(localStorage.getItem("projects")||"[]");
function save(){localStorage.setItem("leads",JSON.stringify(leads));localStorage.setItem("projects",JSON.stringify(projects));}

function showTab(t){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  $('tab-'+t).classList.add('active');
  $('page-'+t).classList.add('active');
  if(t==='leads') renderLeads();
  if(t==='proj') renderProjects();
  if(t==='follow') renderFollow();
}

function renderLeads(){
  let c=$('leadsList'); c.innerHTML='';
  leads.forEach((l,i)=>{
    c.innerHTML += `
    <div class="card">
      <b>${l.name}</b><br>
      📞 ${l.phone}<br>
      Req: ${l.req} — ${l.loc}<br>
      Follow: ${l.follow || '-'}<br><br>
      <button class='btn' onclick='callLead(${i})'>Call</button>
      <button class='btn' onclick='waLead(${i})'>WhatsApp</button>
      <button class='btn' onclick='delLead(${i})' style='background:#d33'>Delete</button>
    </div>`;
  });
}

function addLead(){
  let l={
    name:$('lname').value,
    phone:$('lphone').value,
    req:$('lreq').value,
    loc:$('lloc').value,
    budget:$('lbudget').value,
    notes:$('lnotes').value,
    follow:$('lfollow').value
  };
  leads.unshift(l); save(); showTab('leads');
}

function callLead(i){ window.location=`tel:${leads[i].phone}`; }
function waLead(i){
  let l=leads[i];
  let msg=`Hello ${l.name}, Here are the details:%0ARequirement: ${l.req}%0ALocation: ${l.loc}%0ABudget: ${l.budget}`;
  window.open(`https://wa.me/${l.phone}?text=${msg}`,'_blank');
}
function delLead(i){ leads.splice(i,1); save(); renderLeads(); }

function renderProjects(){
  let c=$('projList'); c.innerHTML='';
  projects.forEach((p,i)=>{
    c.innerHTML += `
    <div class="card">
      <b>${p.title}</b><br>
      ${p.config} — ${p.size} Sqft<br>
      ${p.price}<br>
      <img src="${p.img||''}" width="100"><br><br>
      <button class='btn' onclick='shareProj(${i})'>Share</button>
    </div>`;
  });
}

function addProject(){
  const file=$('pimg').files[0];
  if(file){
    let r=new FileReader();
    r.onload=()=>{ saveProj(r.result); };
    r.readAsDataURL(file);
  } else saveProj('');
}
function saveProj(img){
  projects.unshift({
    title:$('ptitle').value,
    loc:$('ploc').value,
    config:$('pconfig').value,
    size:$('psize').value,
    price:$('pprice').value,
    desc:$('pdesc').value,
    img
  });
  save(); showTab('proj');
}

function shareProj(i){
  let p=projects[i];
  let details=`Project: ${p.title}\n${p.config}\nSize: ${p.size}\nPrice: ${p.price}`;
  if(navigator.share && p.img){
    fetch(p.img).then(r=>r.blob()).then(b=>{
      let f=new File([b],'project.jpg',{type:b.type});
      navigator.share({text:details,files:[f]}).catch(e=>alert('Share error'));
    });
  } else alert('Share not supported');
}

function renderFollow(){
  let c=$('followList'); c.innerHTML='';
  leads.filter(l=>l.follow).forEach((l,i)=>{
    c.innerHTML += `<div class="card">
      <b>${l.name}</b><br>
      Follow: ${l.follow}<br><br>
      <button class='btn' onclick='callLead(${i})'>Call</button>
      <button class='btn' onclick='waLead(${i})'>WhatsApp</button>
    </div>`;
  });
}

function toggleDark(){
  document.body.classList.toggle('dark');
  if(document.body.classList.contains('dark')) $('knob').style.left='25px';
  else $('knob').style.left='3px';
}

window.onload=()=>showTab('leads');
