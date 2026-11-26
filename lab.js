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
const form=document.getElementById("sim-config");if(!form)return;
const fault=document.getElementById("sim-fault"),policy=document.getElementById("sim-policy"),next=document.getElementById("sim-next"),reset=document.getElementById("sim-reset"),log=document.getElementById("sim-log"),status=document.getElementById("sim-status"),nodes=[...document.querySelectorAll("[data-sim-stage]")];
let rows=[],index=0;
const labels={ok:"Confirmed",warn:"Review",hold:"Handoff"};
function metrics(row){for(const k of ["records","attempts","verified"])document.getElementById("sim-"+k).textContent=String(row?(k==="verified"?row.confirmed:row[k]):0);}
function clear(){rows=[];index=0;metrics(null);next.disabled=true;log.replaceChildren();for(const node of nodes){delete node.dataset.state;node.querySelector("small").textContent="Waiting";}status.textContent="Choose a fault and recovery policy to begin.";const li=document.createElement("li");li.textContent="Waiting for a simulation run.";log.append(li);}
function step(){if(index>=rows.length)return;const row=rows[index++];metrics(row);const node=nodes.find(n=>n.dataset.simStage===row.stage);node.dataset.state=row.state;node.querySelector("small").textContent=labels[row.state];const li=document.createElement("li");li.textContent=row.message;li.dataset.state=row.state;log.append(li);status.textContent=row.message;next.disabled=index>=rows.length;}
form.addEventListener("submit",e=>{e.preventDefault();clear();rows=run(fault.value,policy.value);log.replaceChildren();step();});
next.addEventListener("click",step);reset.addEventListener("click",clear);fault.addEventListener("change",clear);policy.addEventListener("change",clear);
clear();
})();
