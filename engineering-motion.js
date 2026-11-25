(()=>{"use strict";
const root=document.documentElement,button=document.getElementById("engineering-motion-toggle");
if(!button||typeof window.matchMedia!=="function")return;
const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
let paused=false;
try{paused=localStorage.getItem("ctdg-engineering-motion-v1")==="off";}catch{}
function apply(){const on=!preference.matches&&!paused;root.dataset.engineeringMotion=on?"on":"off";button.disabled=preference.matches;button.textContent=preference.matches?"Motion reduced":on?"Pause background":"Resume background";}
button.addEventListener("click",()=>{paused=!paused;try{localStorage.setItem("ctdg-engineering-motion-v1",paused?"off":"on");}catch{}apply();});
if(preference.addEventListener)preference.addEventListener("change",apply);else if(preference.addListener)preference.addListener(apply);
button.hidden=false;apply();
})();