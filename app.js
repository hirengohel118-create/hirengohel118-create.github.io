
let isDark=false;
function toggleDark(){
  isDark=!isDark;
  if(isDark){
    document.body.classList.add('dark');
    document.querySelector('.knob').style.left='28px';
  } else {
    document.body.classList.remove('dark');
    document.querySelector('.knob').style.left='2px';
  }
}

function shareProject(){
  const details="Project: Demo\nLocation: Shela\nPrice: 53 Lacs";
  const imgUrl='logo.png';
  fetch(imgUrl).then(r=>r.blob()).then(blob=>{
    const file=new File([blob],'project.jpg',{type:blob.type});
    if(navigator.share){
      navigator.share({title:'Project',text:details,files:[file]})
      .catch(e=>console.log(e));
    } else alert('Share not supported');
  });
}
