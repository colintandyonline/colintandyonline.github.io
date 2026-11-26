(()=>{
"use strict";
const actors=["atlas","scout","forge","mara","human"];
const scenarios={
ready:{title:"A usable integration brief",brief:"A business wants its enquiry form connected to an existing CRM. The system version and read-only documentation are supplied.",steps:[
["atlas","scout","ok","Define the job","Atlas assigns discovery. The scope permits a draft only.","Task brief: identify compatibility evidence and missing information."],
["scout","forge","ok","Find the evidence","Scout finds the stated version and matching documentation.","Evidence E01: version supplied; E02: matching API documentation."],
["forge","mara","ok","Propose the design","Forge prepares a bounded integration plan with a compatibility test.","Draft: test mapping in a non-production environment; no live changes."],
["mara","human","ok","Check the boundaries","Mara checks that the proposal cites its evidence and does not promise deployment.","Review: draft may be presented; external actions require separate approval."],
["human","human","ready","Ready for human review","The person receives the proposal and its limitations, not an automatic deployment.","Outcome: draft ready for review. No external action performed."]]},
missing:{title:"Missing system information",brief:"The same request arrives without the CRM version. Documentation alone cannot establish compatibility.",steps:[
["atlas","scout","ok","Define the job","Atlas assigns a bounded discovery task.","Task brief: establish integration requirements; no writes."],
["scout","forge","warn","Find the gap","Scout finds generic documentation but no verified version.","Evidence E01: version unknown; E02: generic API reference."],
["forge","mara","warn","Limit the proposal","Forge can outline options but cannot claim compatibility.","Draft: request version and propose a controlled test."],
["mara","human","hold","Stop an unsupported promise","Mara flags the missing prerequisite and routes the question to a person.","Review: compatibility unverified; no delivery commitment."],
["human","human","hold","Waiting for information","The person receives a precise question rather than a fabricated answer.","Outcome: request CRM version before proceeding."]]},
rework:{title:"A claim fails review",brief:"The version is known, but a draft contains an unsupported claim that the integration was tested. Watch the correction loop.",steps:[
["atlas","scout","ok","Define the job","Atlas assigns a draft integration plan, not execution.","Task brief: cite source and specify test conditions."],
["scout","forge","ok","Collect the evidence","Scout hands over the supplied version and documentation.","Evidence E01: version supplied; E02: API reference; no test result."],
["forge","mara","warn","Submit a flawed draft","The fictional draft wrongly states that compatibility testing passed.","Draft claim: compatibility test passed. No receipt supports it."],
["mara","forge","return","Return for correction","Mara rejects the unsupported claim and requests a source-matched draft.","Finding: test outcome absent. Correction: remove claim and mark test pending."],
["forge","mara","ok","Correct the draft","Forge separates documented interface facts from untested compatibility.","Revised draft: documentation reviewed; compatibility test still pending."],
["mara","human","ok","Review again","Mara checks the corrected claim against E01 and E02.","Retest: unsupported completion claim removed; no test pass asserted."],
["human","human","ready","Corrected draft ready","The person receives the corrected proposal with the test still outstanding.","Outcome: review the proposal; authorise any test separately."]]}
};
function run(key){if(!Object.hasOwn(scenarios,key))throw Error("Unknown scenario");return scenarios[key].steps.map(([from,to,state,title,summary,evidence])=>({from,to,state,title,summary,evidence}));}
if(typeof module!=="undefined"&&module.exports)module.exports={actors,scenarios,run};
if(typeof document==="undefined")return;
const root=document.getElementById("orchestration-studio");if(!root)return;
const buttons=[...root.querySelectorAll("[data-scenario]")],nodes=[...root.querySelectorAll("[data-actor]")],links=[...root.querySelectorAll("[data-edge]")],status=root.querySelector("#orch-status"),stepTitle=root.querySelector("#orch-step-title"),summary=root.querySelector("#orch-step-copy"),evidence=root.querySelector("#orch-evidence"),progress=root.querySelector("#orch-progress"),log=root.querySelector("#orch-log"),pause=root.querySelector("#orch-pause"),replay=root.querySelector("#orch-replay"),brief=root.querySelector("#orch-brief"),count=root.querySelector("#orch-count"),reduced=matchMedia("(prefers-reduced-motion: reduce)");
let selected="rework",rows=[],index=0,timer=null,paused=false,started=false;
const names={atlas:"Atlas",scout:"Scout",forge:"Forge",mara:"Mara",human:"Human reviewer"};
const labels={ok:"Handoff",warn:"Needs evidence",return:"Correction requested",hold:"Waiting for information",ready:"Ready for review"};
function stop(){if(timer!==null)clearTimeout(timer);timer=null;}
function instant(){return reduced.matches||document.documentElement.dataset.engineeringMotion==="off";}
function step(){if(index>=rows.length)return;const r=rows[index++];nodes.forEach(n=>{const id=n.dataset.actor;n.classList.toggle("active",id===r.from||id===r.to);if(id===r.from||id===r.to){n.dataset.state=r.state;n.querySelector("small").textContent=id===r.to?labels[r.state]:"Sent";}else if(n.dataset.state){n.querySelector("small").textContent="Previously involved";}});links.forEach(l=>{l.classList.toggle("active",l.dataset.edge===r.from+"-"+r.to);l.dataset.state=r.state;});root.dataset.outcome=r.state;status.textContent=labels[r.state];stepTitle.textContent=r.title;summary.textContent=r.summary;evidence.textContent=r.evidence;count.textContent="Decision "+index+" of "+rows.length;progress.setAttribute("aria-valuenow",String(index));progress.firstElementChild.style.width=(index/rows.length*100)+"%";
const li=document.createElement("li");const b=document.createElement("strong");b.textContent=names[r.from]+(r.from===r.to?"":" → "+names[r.to])+": "+r.title;const p=document.createElement("span");p.textContent=r.evidence;li.append(b,p);log.append(li);
if(index===rows.length){stop();pause.disabled=true;}else if(!paused&&!instant())timer=setTimeout(step,1800);}
function finish(){stop();while(index<rows.length)step();}
function start(key){started=true;stop();selected=key;rows=run(key);index=0;paused=false;brief.textContent=scenarios[key].brief;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.scenario===key)));nodes.forEach(n=>{delete n.dataset.state;n.classList.remove("active");n.querySelector("small").textContent="Waiting";});links.forEach(l=>l.classList.remove("active"));log.replaceChildren();progress.setAttribute("aria-valuemax",String(rows.length));pause.textContent="Pause";pause.disabled=false;step();if(instant())finish();}
buttons.forEach(b=>b.addEventListener("click",()=>start(b.dataset.scenario)));replay.addEventListener("click",()=>start(selected));pause.addEventListener("click",()=>{if(!started||index===rows.length)return;paused=!paused;pause.textContent=paused?"Resume":"Pause";if(paused)stop();else if(instant())finish();else step();});
reduced.addEventListener?.("change",()=>{if(started&&instant())finish();});
new MutationObserver(()=>{if(started&&instant())finish();}).observe(document.documentElement,{attributes:true,attributeFilter:["data-engineering-motion"]});
if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();if(!started)start(selected);}}, {threshold:.1});io.observe(root.querySelector(".orch-network"));}else start(selected);
})();
