
const $ = id => document.getElementById(id);
let leads = JSON.parse(localStorage.getItem('leads')||'[]');
let projects = JSON.parse(localStorage.getItem('projects')||'[]');
let profile = JSON.parse(localStorage.getItem('profile')||JSON.stringify({business:'Vamika Estate', owner:'Hiren Gohel', phone:'7046869462'}));
function saveAll(){ localStorage.setItem('leads', JSON.stringify(leads)); localStorage.setItem('projects', JSON.stringify(projects)); localStorage.setItem('profile', JSON.stringify(profile)); }
function renderHeader(){ if(document.getElementById('brandTitle')) document.getElementById('brandTitle').textContent = profile.business || 'Vamika Estate'; if(document.getElementById('brandSub')) document.getElementById('brandSub').textContent = (profile.owner?profile.owner+' • ':'') + (profile.phone||''); if(localStorage.getItem('logo-data') && document.getElementById('logoImg')) document.getElementById('logoImg').src = localStorage.getItem('logo-data'); }
function openDrawer(){ document.getElementById('drawer').classList.add('open'); }
function closeDrawer(){ document.getElementById('drawer').classList.remove('open'); }
function navigate(page){ window.location = page; }
document.addEventListener('DOMContentLoaded', ()=>{ renderHeader(); if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }});
