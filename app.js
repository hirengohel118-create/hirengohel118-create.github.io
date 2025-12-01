
const $=id=>document.getElementById(id);

let leads = JSON.parse(localStorage.getItem("leads")||"[]");
let projects = JSON.parse(localStorage.getItem("projects")||"[]");

function save(){
  localStorage.setItem("leads",JSON.stringify(leads));
  localStorage.setItem("projects",JSON.stringify(projects));
}

function showTab(t){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  $('tab-'+t).classList.add('active');
  $('page-'+t).classList.add('active');
  if(t==='leads') renderLeads();
  if(t==='proj') renderProjects();
  if(t==='follow') renderFollow();
}

function addLead(){
  const l={
    name:$('lname').value,
    phone:$('lphone').value,
    req:$('lreq').value,
    loc:$('lloc').value,
    budget:$('lbudget').value,
    notes:$('lnotes').value,
    follow:$('lfollow').value
  };
  leads.unshift(l);
  save();
  showTab('leads');
}

function renderLeads(){
  let c=$('leadsList');
  c.innerHTML='';
  leads.forEach((l,i)=>{
    c.innerHTML+=`
    <div class='card'>
      <b>${l.name}</b><br>
      📞 ${l.phone}<br>
      ${l.req} — ${l.loc}<br>
      Budget: ${l.budget}<br>
      Follow: ${l.follow || '-'}<br><br>
      <button class='btn' onclick='callLead(${i})'>Call</button>
      <button class='btn' onclick='waLead(${i})'>WhatsApp</button>
      <button class='btn' style='background:#d33' onclick='delLead(${i})'>Delete</button>
    </div>`;
  });
}

function callLead(i){
  window.location=`tel:${leads[i].phone}`;
}

function waLead(i){
  let l=leads[i];
  let msg = `Project details:%0ARequirement: ${l.req}%0ALocation: ${l.loc}%0ABudget: ${l.budget}`;
  window.open(`https://wa.me/${l.phone}?text=${msg}`,'_blank');
}

function delLead(i){
  leads.splice(i,1);
  save();
  renderLeads();
}

function addProject(){
  let file = $('pimg').files[0];
  if(file){
    let r=new FileReader();
    r.onload=()=> saveProject(r.result);
    r.readAsDataURL(file);
  } else saveProject('');
}

function saveProject(img){
  projects.unshift({
    title:$('ptitle').value,
    loc:$('ploc').value,
    config:$('pconfig').value,
    size:$('psize').value,
    price:$('pprice').value,
    desc:$('pdesc').value,
    img
  });
  save();
  showTab('proj');
}

function renderProjects(){
  let c=$('projList'); c.innerHTML='';
  projects.forEach((p,i)=>{
    c.innerHTML+=`
    <div class='card'>
      <b>${p.title}</b><br>
      ${p.config}<br>
      Size: ${p.size}<br>
      Price: ${p.price}<br>
      <img src='${p.img}' width='120' style='margin-top:8px;border-radius:8px;'><br>
      <button class='btn' onclick='shareProj(${i})'>Share</button>
    </div>`;
  });
}

function shareProj(i){
  let p=projects[i];
  let details=`Project: ${p.title}\n${p.config}\nSize: ${p.size}\nPrice: ${p.price}`;
  if(navigator.share && p.img){
    fetch(p.img).then(r=>r.blob()).then(b=>{
      let f=new File([b],"project.jpg",{type:b.type});
      navigator.share({text:details,files:[f]})
      .catch(()=>alert("Share canceled"));
    });
  } else alert("Share not supported");
}

function renderFollow(){
  let c=$('followList'); c.innerHTML='';
  leads.filter(l=>l.follow).forEach((l,i)=>{
    c.innerHTML+=`
    <div class='card'>
      <b>${l.name}</b><br>
      Follow: ${l.follow}<br><br>
      <button class='btn' onclick='callLead(${i})'>Call</button>
      <button class='btn' onclick='waLead(${i})'>WhatsApp</button>
    </div>`;
  });
}

function toggleDark(){
  document.body.classList.toggle('dark');
  if(document.body.classList.contains('dark'))
     $('knob').style.left='26px';
  else $('knob').style.left='2px';
  localStorage.setItem("darkmode",document.body.classList.contains('dark'));
}

window.onload=()=>{
  if(localStorage.getItem("darkmode")==="true"){
    document.body.classList.add("dark");
    $('knob').style.left='26px';
  }
  showTab('leads');
}
