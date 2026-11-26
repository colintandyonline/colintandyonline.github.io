(function(){
"use strict";
const cards=[...document.querySelectorAll("#projects > .grid > .card")];
const buttons=[...document.querySelectorAll("[data-filter]")];
const search=document.getElementById("portfolioSearch");
let mode="all";
function update(){
 const q=(search?.value||"").trim().toLowerCase();
 let count=0;
 cards.forEach(card=>{
 const status=card.querySelector(".eyebrow")?.textContent.trim()||"";
 const matches=mode==="all"||(mode==="live"&&status.startsWith("LIVE"))||(mode==="development"&&status==="IN DEVELOPMENT");
 card.hidden=!(matches&&card.textContent.toLowerCase().includes(q));if(!card.hidden)count++;
 });
 const label=document.getElementById("portfolioCount");if(label)label.textContent=count+" of "+cards.length+" showcased projects";
}
buttons.forEach(button=>button.addEventListener("click",()=>{mode=button.dataset.filter;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b===button)));update();}));
if(search){search.addEventListener("input",update);update();}
const signals=document.getElementById("portfolioSignals");
if(signals)fetch("roadmap.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
 if(data.schemaVersion!==1||data.source?.projectNumber!==11||!Array.isArray(data.items))return;
 const items=data.items;
 const rows=[[new Set(items.filter(m=>m.project!=="Engineering Portfolio").map(m=>m.project)).size,"Tracked projects"],[items.length,"Public milestones"],[items.filter(m=>m.stage==="Completed").length,"Completed"]];
 rows.forEach(([value,label])=>{const box=document.createElement("div"),strong=document.createElement("strong"),span=document.createElement("span");strong.textContent=value;span.textContent=label;box.append(strong,span);signals.append(box);});signals.hidden=false;
}).catch(()=>{});
})();
(function(){
"use strict";
const video=document.getElementById("engineering-intro-film"),button=document.getElementById("engineering-film-play"),restart=document.getElementById("engineering-film-replay"),full=document.getElementById("engineering-film-full"),dock=document.getElementById("engineering-film-controls"),status=document.getElementById("engineering-film-status");
if(!video||!button||!restart||!full||!dock||!status)return;
let timer,manual=false;
const label=button.querySelector("span"),path=button.querySelector("path");
function state(){const active=!video.paused&&!video.ended;label.textContent=active?"Pause introduction":video.ended?"Replay introduction":"Play introduction";path.setAttribute("d",active?"M9 5v14m6-14v14":"m8 5 12 7-12 7z");}
function message(text){status.textContent=text;status.hidden=!text;}
function cancel(){manual=true;clearTimeout(timer);}
function play(){if(video.ended)video.currentTime=0;video.play().catch(e=>{state();if(e?.name==="NotAllowedError")message("Select Play introduction to watch with sound.");else if(e?.name!=="AbortError")message("The introduction could not start. Select Play to try again.");});}
button.addEventListener("click",()=>{cancel();if(video.paused||video.ended)play();else video.pause();});
restart.addEventListener("click",()=>{cancel();video.currentTime=0;play();});
const supportsFull=typeof video.requestFullscreen==="function"&&document.fullscreenEnabled||typeof video.webkitEnterFullscreen==="function";
if(supportsFull){full.hidden=false;full.addEventListener("click",()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});}else if(document.fullscreenEnabled&&video.requestFullscreen){video.requestFullscreen().catch(()=>{message("Fullscreen is unavailable in this browser.");});}else{try{video.webkitEnterFullscreen();}catch{message("Fullscreen is unavailable in this browser.");}}});}
video.addEventListener("playing",()=>{message("");state();});
video.addEventListener("pause",state);video.addEventListener("ended",state);video.addEventListener("error",()=>message("The introduction is temporarily unavailable."));
video.controls=false;dock.hidden=false;state();
function schedule(){if(!manual)timer=setTimeout(()=>{if(!manual&&video.paused&&!video.ended)play();},5000);}
if(document.readyState==="complete")schedule();else window.addEventListener("load",schedule,{once:true});
})();
