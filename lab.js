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
