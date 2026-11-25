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