const test=require("node:test"),assert=require("node:assert/strict"),{actors,scenarios,run}=require("../orchestration.js");
for(const k of Object.keys(scenarios))test(k+" complete handoff chain",()=>{const r=run(k);assert.equal(r[0].from,"atlas");assert.equal(r.at(-1).to,"human");assert.ok(r.every(s=>actors.includes(s.from)&&actors.includes(s.to)&&s.evidence&&s.summary));for(let i=1;i<r.length;i++)assert.equal(r[i].from,r[i-1].to);assert.deepEqual(run(k),r);});
test("missing evidence holds",()=>assert.equal(run("missing").at(-1).state,"hold"));
test("unsupported claim is returned, corrected and reviewed before handoff",()=>{const r=run("rework");assert.equal(r[3].state,"return");assert.equal(r[3].to,"forge");assert.equal(r[4].to,"mara");assert.equal(r[5].to,"human");assert.match(r[4].evidence,/test still pending/);assert.equal(r.at(-1).state,"ready");});
test("reject invalid scenario",()=>assert.throws(()=>run("unknown")));
