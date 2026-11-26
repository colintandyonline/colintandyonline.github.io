(()=>{
"use strict";
function evaluate(answers,key){
 if(!Array.isArray(answers)||!Array.isArray(key)||answers.length!==key.length||!answers.length||answers.some(a=>!Number.isInteger(a)||a<0||a>2)||key.some(a=>!Number.isInteger(a)||a<0||a>2))return null;
 const results=answers.map((a,i)=>a===key[i]);
 return {results,score:results.filter(Boolean).length,total:key.length};
}
if(typeof module!=="undefined"&&module.exports)module.exports={evaluate};
if(typeof document==="undefined")return;
for(const form of document.querySelectorAll(".experiment-form")){
 const fields=[...form.querySelectorAll("fieldset")],steps=[...form.querySelectorAll("[data-step]")],status=form.querySelector(".experiment-score");
 const initial=status.textContent;
 function clear(){for(const f of fields){f.removeAttribute("data-result");f.querySelector(".experiment-feedback").hidden=true;}for(const step of steps)step.removeAttribute("data-result");status.textContent=initial;}
 form.addEventListener("change",clear);
 form.addEventListener("reset",clear);
 form.addEventListener("submit",event=>{
 event.preventDefault();
 const answers=fields.map(f=>{const input=f.querySelector("input:checked");return input?Number(input.value):null;});
 const key=fields.map(f=>Number(f.dataset.correct));
 const result=evaluate(answers,key);
 if(!result){status.textContent="Please answer every question.";return;}
 fields.forEach((f,i)=>{const passed=result.results[i];const outcome=passed?"met":"review";f.dataset.result=outcome;steps[i].dataset.result=outcome;const feedback=f.querySelector(".experiment-feedback");feedback.querySelector("strong").textContent=passed?"Supported reasoning":"Review this decision";feedback.hidden=false;});
 status.textContent=result.score+" of "+result.total+" decisions match the answer key. "+(result.score===result.total?"All decisions are supported by the supplied evidence and rules.":"Read the explanations above and try again.");
 });
}
})();

(()=>{
"use strict";
const faults=["normal","committed","absent","unknown"],policies=["guarded","naive"];
function run(fault,policy){
 if(!faults.includes(fault)||!policies.includes(policy))throw new Error("Unknown simulation configuration");
 const rows=[];let records=0,attempts=0,confirmed=0;
 const add=(stage,state,message)=>rows.push({stage,state,message,records,attempts,confirmed});
 add("intake","ok","Fictional enquiry SIM-104 accepted. Stable request key assigned.");
 attempts++;
 if(fault==="normal"){records=1;confirmed=1;add("write","ok","Service confirms the first write.");add("verify","ok","Matching confirmation identifies the created record.");add("resolve","ok","One confirmed record. No retry needed.");return rows;}
 if(fault==="committed"||fault==="unknown")records=1;
 add("write","warn","Request timed out. Caller cannot establish whether a record was created.");
 if(policy==="naive"){
   attempts++;records++;confirmed=1;
   add("verify","warn","Blind retry uses a fresh key; a new record is confirmed, but the original request remains unverified.");
   add("resolve","warn",records>1?"Model reveals two records. The new confirmation did not establish the fate of the original request.":"One record exists in this model, but the first request's outcome was not verified.");
 }else if(fault==="unknown"){
   add("verify","warn","Lookup unavailable. A retry would lack reliable evidence.");
   add("resolve","hold","Unresolved outcome. Stop and hand off for authorised investigation; do not claim delivery.");
 }else if(fault==="committed"){
   confirmed=1;add("verify","ok","Lookup by the original key confirms the existing record.");
   add("resolve","ok","One confirmed record. Duplicate avoided without retrying.");
 }else{
   add("verify","ok","Reliable lookup reports no existing record. Retry with the original stable key under the stated contract.");
   attempts++;records=1;confirmed=1;
   add("resolve","ok","Bounded retry confirmed one record using the original key.");
 }
 return rows;
}
if(typeof module!=="undefined"&&module.exports)module.exports.run=run;
if(typeof document==="undefined")return;
const root=document.getElementById("simulation");if(!root)return;
const buttons=[...root.querySelectorAll(".sim-scenario")],lanes=[...root.querySelectorAll(".sim-compare-lane")],status=document.getElementById("sim-status"),conclusion=document.getElementById("sim-conclusion"),pause=document.getElementById("sim-pause"),replay=document.getElementById("sim-replay"),progress=root.querySelector(".sim-progress"),reduced=matchMedia("(prefers-reduced-motion: reduce)");
const messages={normal:"Both policies receive a normal confirmation. The difference only matters when something goes wrong.",committed:"Checking the original key avoids a duplicate. Blind retry creates a second record: somebody may now have to reconcile two enquiries.",absent:"Both paths create one record, but only the evidence-led path verifies why a retry is safe.",unknown:"Evidence-led recovery stops for investigation. Blind retry creates a duplicate in this model, while the original request remains unverified."};
let selected="committed",runs={},index=0,timer=null,paused=false,started=false;
function stop(){if(timer!==null)clearTimeout(timer);timer=null;}
function showStep(){if(index>=4)return;const i=index++;
 for(const lane of lanes){const row=runs[lane.dataset.policy][i],node=lane.querySelector('[data-sim-stage='+row.stage+']');node.dataset.state=row.state;node.querySelector("small").textContent=row.stage==="intake"?"Accepted":row.state==="ok"?"Confirmed":row.state==="hold"?"Handoff":"Review";for(const k of ["records","attempts","confirmed"])lane.querySelector('[data-metric='+k+']').textContent=row[k];lane.querySelector(".sim-lane-detail").textContent=row.message;
 const result=lane.querySelector(".sim-lane-result");result.dataset.resultState=row.state;result.textContent=i===3?(row.state==="hold"?"Human investigation needed":row.records>1?"Duplicate record created":row.state==="warn"?"Original outcome unverified":"One confirmed record"):["Enquiry accepted","Integration response","Evidence check"][i];
 const li=document.createElement("li");li.textContent=row.message;lane.querySelector(".sim-log").append(li);}
 progress.setAttribute("aria-valuenow",String(index));progress.firstElementChild.style.width=index*25+"%";status.textContent=index===4?"Comparison complete. Choose another scenario or replay.":"Running: "+["enquiry","integration","verification","resolution"][i]+" ("+index+"/4)";
 if(index===4){conclusion.textContent=messages[selected];pause.disabled=true;stop();}else if(!paused&&!reduced.matches)timer=setTimeout(showStep,850);}
function start(key){started=true;stop();selected=key;paused=false;index=0;runs=Object.fromEntries(["guarded","naive"].map(p=>[p,run(key,p)]));buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.fault===key)));for(const lane of lanes){lane.querySelector(".sim-log").replaceChildren();lane.querySelectorAll(".sim-node").forEach(n=>{delete n.dataset.state;n.querySelector("small").textContent="Waiting";});lane.querySelectorAll("[data-metric]").forEach(n=>n.textContent="0");}conclusion.textContent="Watch the two paths respond to the same fictional event.";pause.textContent="Pause";pause.disabled=false;showStep();if(reduced.matches)while(index<4)showStep();}
buttons.forEach(b=>b.addEventListener("click",()=>start(b.dataset.fault)));replay.addEventListener("click",()=>start(selected));pause.addEventListener("click",()=>{if(!started||index===4)return;paused=!paused;pause.textContent=paused?"Resume":"Pause";if(paused){stop();status.textContent="Paused at decision "+index+" of 4.";}else showStep();});reduced.addEventListener?.("change",()=>{if(started&&reduced.matches){stop();while(index<4)showStep();}});
if("IntersectionObserver" in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(!started)start(selected);}}, {threshold:0.08});observer.observe(root.querySelector(".sim-scenarios"));}else start(selected);
})();
