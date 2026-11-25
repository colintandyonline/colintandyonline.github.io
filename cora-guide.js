(()=>{"use strict";
const steps=[...document.querySelectorAll("[data-guide-step]")];
const buttons=[...document.querySelectorAll("[data-guide-index]")];
const controls=document.getElementById("guide-controls"),pagination=document.getElementById("guide-pagination"),meter=document.getElementById("guide-progress"),count=document.getElementById("guide-count"),status=document.getElementById("guide-status"),prev=document.getElementById("guide-prev"),next=document.getElementById("guide-next"),reset=document.getElementById("guide-reset");
if(!steps.length||steps.length!==buttons.length||![controls,pagination,meter,count,status,prev,next,reset].every(Boolean))return;
let index=0;
function render(value){index=Math.max(0,Math.min(steps.length-1,value));steps.forEach((s,i)=>s.hidden=i!==index);buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(i===index)));meter.value=index+1;count.textContent="Stage "+(index+1)+" of "+steps.length;prev.disabled=index===0;next.disabled=index===steps.length-1;status.textContent=index===steps.length-1?"Tour complete. Explore the contact page or restart the tour.":"";}
buttons.forEach((b,i)=>b.addEventListener("click",()=>render(i)));prev.addEventListener("click",()=>render(index-1));next.addEventListener("click",()=>render(index+1));reset.addEventListener("click",()=>render(0));controls.hidden=false;pagination.hidden=false;render(0);
})();