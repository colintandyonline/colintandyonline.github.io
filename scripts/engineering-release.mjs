import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import {extname} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const host = "engineering.ctdigital.group";
const name = "ctdg-engineering-innovation";
const repo = "https://github.com/colintandyonline/colintandyonline.github.io";
const workerPath = "worker/engineering.mjs";
const paths = ["index.html", "roadmap.html", "roadmap.js", "roadmap.json", "showcase.css", "showcase.js", "assets/ctdg-logo.png", "assets/icons.svg", "portfolio.css", "portfolio.js", "projects/index.html", "projects/ctdg-website/index.html", "projects/interactive-demos/index.html", "projects/kayacart/index.html", "projects/gandalf-mobile/index.html", "projects/axiom-architect/index.html", "projects/deepmind-resources/index.html", "projects/trailtrade/index.html", "ecosystem/index.html", "intelligence/index.html", "ecosystem.css", "ecosystem.js", "docs/index.html", "docs.css", "docs.js", "robots.txt", "sitemap.xml", "llms.txt", "services/index.html", "services.css", "services.js", "assets/social-share.jpg", "contact/index.html", "analytics-consent.js", "lab/index.html"];
const types = {".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".css":"text/css; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".xml":"application/xml; charset=utf-8", ".txt":"text/plain; charset=utf-8"};
const git = (...args) => execFileSync("git", args, {cwd:root, maxBuffer:16*1024*1024});
const commit = git("rev-parse", "HEAD").toString().trim();
assert.match(commit, /^[a-f0-9]{40}$/);
const read = path => git("show", commit + ":" + path);
const files = new Map(paths.map(path => ["/"+path, read(path)]));
const moduleBytes = read(workerPath);
const manifest = Object.fromEntries([...files].map(([path, bytes]) => [path, {
  hash: createHash("sha256").update(bytes.toString("base64") + extname(path).slice(1)).digest("hex").slice(0,32),
  size: bytes.length
}]));
const assetsByHash = new Map(Object.entries(manifest).map(([path, info]) => [info.hash, {path, bytes:files.get(path)}]));

function validateSource(){
  assert.equal(files.size, paths.length);
  for (const path of files.keys()) assert.ok(types[extname(path)] && !path.includes(".."));
  const homepage = files.get("/index.html").toString("utf8");
  const roadmap = files.get("/roadmap.html").toString("utf8");
  for (const html of [homepage, roadmap]) {
    assert.match(html, /assets\/ctdg-logo\.png/);
    assert.match(html, /showcase\.css/);
    assert.match(html, /showcase\.js/);
  }
  assert.match(roadmap, /roadmap\.js/);
  for (const id of ["projectFilter","stageFilter","search","milestones","timeline","stats","portfolioSignals"])
    assert.ok(roadmap.includes('id="'+id+'"'), "Missing roadmap element: "+id);
  const sponsorships = [686982,686983,686984,686985,686986];
  for (const id of sponsorships) assert.ok(homepage.includes("tier_id="+id), "Sponsorship link changed: "+id);
  const data = JSON.parse(files.get("/roadmap.json"));
  assert.equal(data.schemaVersion,1);
  assert.equal(data.source.projectNumber,11);
  assert.ok(data.items.length > 0 && data.items.every(item => typeof item.title === "string" && ["Completed","In progress","Planned"].includes(item.stage)));
  for (const path of ["/roadmap.js","/showcase.js","/portfolio.js","/ecosystem.js","/docs.js","/services.js","/analytics-consent.js"]) new Function(files.get(path).toString("utf8"));
  assert.equal(files.get("/assets/ctdg-logo.png").subarray(0,8).toString("hex"),"89504e470d0a1a0a");
}

async function validateWorker(){
  const module = await import("data:application/javascript;base64,"+moduleBytes.toString("base64"));
  const env = {SOURCE_COMMIT:commit,ASSETS:{async fetch(request) {
    const bytes = files.get(new URL(request.url).pathname);
    return bytes ? new Response(request.method==="HEAD"?null:bytes,{headers:{"Content-Type":types[extname(new URL(request.url).pathname)]}}) : new Response("Not found",{status:404});
  }}};
  const req = (path,method="GET",hostname=host) => module.default.fetch(new Request("https://"+hostname+path,{method}),env);
  for (const path of ["/","/projects/","/projects/kayacart/",...files.keys()]) {
    const response = await req(path);
    assert.equal(response.status,200,path);
    assert.equal(response.headers.get("X-CTDG-Source-Commit"),commit);
    assert.equal(response.headers.get("X-Robots-Tag"),null);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),files.get(path.endsWith("/")?path+"index.html":path));
  }
  const head = await req("/","HEAD");
  assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
  for (const path of ["/.git/config","/worker/engineering.mjs","/scripts/engineering-release.mjs","/README.md","/missing"]) assert.equal((await req(path)).status,404,path);
  assert.equal((await req("/","POST")).status,405);
  assert.equal((await req("/","GET","ctdigital.group")).status,404);
  console.log("Source and Worker contract checks passed; "+files.size+" public assets at "+commit);
}

function config(){
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const worker = process.env.CLOUDFLARE_WORKER_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  assert.match(account||"",/^[a-f0-9]{32}$/,"Missing account ID");
  assert.match(worker||"",/^[a-f0-9]{32}$/,"Missing Worker ID");
  assert.ok(token,"Missing scoped deployment secret");
  return {account,worker,token,base:"https://api.cloudflare.com/client/v4/accounts/"+account};
}
async function call(url, token, method="GET", body){
  const options = {method, headers:{Authorization:"Bearer "+token},signal:AbortSignal.timeout(60000)};
  if (body !== undefined) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
    if (!(body instanceof FormData)) options.headers["Content-Type"]="application/json";
  }
  const response = await fetch(url, options);
  let data;try{data=await response.json();}catch{throw Error(method+" "+new URL(url).pathname+" HTTP "+response.status+" (invalid response)");}
  if (!response.ok || data.success===false) {
    const codes = Array.isArray(data.errors)?data.errors.map(e=>String(e.code||"unknown")).join(","):"unknown";
    throw Error(method+" "+new URL(url).pathname+" HTTP "+response.status+" (error codes "+codes+")");
  }
  return data.result ?? data;
}
async function uploadBuckets(base, session){
  assert.ok(typeof session.jwt==="string" && Array.isArray(session.buckets),"Invalid upload session");
  let completion = session.buckets.length ? null : session.jwt;
  for (const bucket of session.buckets) {
    const form = new FormData();
    for (const hash of bucket) {
      const entry=assetsByHash.get(hash);assert.ok(entry,"Unexpected asset requested");
      form.append(hash,new Blob([entry.bytes.toString("base64")],{type:types[extname(entry.path)]}),hash);
    }
    const response=await call(base+"/workers/assets/upload?base64=true",session.jwt,"POST",form);
    if (response.jwt) completion=response.jwt;
  }
  assert.ok(completion,"No completion token returned");
  return completion;
}
function versionBody(completion){
  return {
    compatibility_date:"2026-11-25",main_module:"engineering.mjs",
    bindings:[{type:"assets",name:"ASSETS"},{type:"plain_text",name:"SOURCE_COMMIT",text:commit}],
    assets:{jwt:completion,config:{html_handling:"none",not_found_handling:"none",run_worker_first:true}},
    modules:[{name:"engineering.mjs",content_type:"application/javascript+module",content_base64:moduleBytes.toString("base64")}],
    annotations:{"workers/tag":commit,"workers/message":"Reviewed CTDG engineering source "+commit}
  };
}
async function smoke(){
  for (const [path, bytes] of files) {
    const requestPath=path.endsWith("/index.html")?path.slice(0,-"index.html".length):path;
    const response=await fetch("https://"+host+requestPath+"?release="+commit,{redirect:"error",signal:AbortSignal.timeout(20000),cache:"no-store"});
    assert.equal(response.status,200,requestPath);
    assert.equal(response.headers.get("X-CTDG-Source-Commit"),commit,requestPath+" source commit");
    assert.equal(response.headers.get("X-Robots-Tag"),null,requestPath+" indexing header");
    assert.ok(response.headers.get("content-type")?.startsWith(types[extname(path)].split(";")[0]),path+" MIME type");
    const actual=Buffer.from(await response.arrayBuffer());
    if (!actual.equals(bytes)) {
      assert.ok(path.endsWith(".html"),path+" bytes mismatch");
      const expected=bytes.toString("utf8"),served=actual.toString("utf8"),end=expected.lastIndexOf("</body>");
      assert.ok(end>=0&&served.startsWith(expected.slice(0,end))&&served.endsWith(expected.slice(end)),path+" HTML changed");
      const injected=served.slice(end,served.length-(expected.length-end));
      assert.ok(injected.startsWith("<script")&&injected.includes("/cdn-cgi/challenge-platform/")&&injected.endsWith("</script>"),path+" unexpected injected HTML");
    }
  }
  for (const path of ["/.git/config","/scripts/engineering-release.mjs","/worker/engineering.mjs","/README.md","/no-such-page"]){
    const response=await fetch("https://"+host+path,{signal:AbortSignal.timeout(10000),redirect:"manual"});
    assert.ok([403,404].includes(response.status),path+" exposed");
  }
  const head=await fetch("https://"+host+"/",{method:"HEAD",signal:AbortSignal.timeout(10000)});
  assert.equal(head.status,200);
  assert.equal(head.headers.get("X-CTDG-Source-Commit"),commit);
  const post=await fetch("https://"+host+"/",{method:"POST",signal:AbortSignal.timeout(10000)});
  assert.equal(post.status,405);
  console.log("Live checks passed: "+files.size+" exact-source assets, indexing header, HEAD and blocked private paths.");
}
async function deploy(){
  assert.equal(git("status","--porcelain","--untracked-files=normal").toString().trim(),"","Dirty checkout");
  git("fetch","--no-tags","origin","main");
  assert.equal(git("rev-parse","FETCH_HEAD").toString().trim(),commit,"Main advanced; refuse stale deployment");
  const {base,worker,token}=config();
  const identity=await call(base+"/workers/workers/"+worker,token);
  assert.equal(identity.name,name,"Incorrect deployment target");
  assert.equal(identity.id,worker);
  const deployments=base+"/workers/scripts/"+name+"/deployments";
  const getCurrent=async()=>{const x=await call(deployments,token);return (x.deployments||x)[0];};
  const previous=await getCurrent();
  assert.ok(previous&&previous.versions?.length===1&&previous.versions[0].percentage===100,"Unexpected current deployment");
  const session=await call(base+"/workers/scripts/"+name+"/assets-upload-session",token,"POST",{manifest});
  const completion=await uploadBuckets(base,session);
  const version=await call(base+"/workers/workers/"+worker+"/versions",token,"POST",versionBody(completion));
  assert.ok(version.id,"Version not created");
  console.log("Staged Worker version "+version.id+"; rollback target "+previous.versions[0].version_id);
  assert.equal((await getCurrent()).id,previous.id,"Deployment changed during staging");
  git("fetch","--no-tags","origin","main");
  assert.equal(git("rev-parse","FETCH_HEAD").toString().trim(),commit,"Main advanced during staging");
  const deployment=await call(deployments,token,"POST",{strategy:"percentage",versions:[{version_id:version.id,percentage:100}]});
  console.log("Deployment "+deployment.id);
  try {
    let error;
    for(let attempt=0;attempt<3;attempt++) {
      try{await smoke();return;}catch(e){error=e;if(attempt<2)await new Promise(r=>setTimeout(r,3000));}
    }
    throw error;
  } catch(error) {
    const current=await getCurrent();
    if(current.versions?.length===1&&current.versions[0].version_id.replaceAll("-","")===version.id.replaceAll("-","")){
      const rollback=await call(deployments,token,"POST",{strategy:"percentage",versions:previous.versions});
      console.error("Release verification failed; rolled back via deployment "+rollback.id);
    }else console.error("Release verification failed; deployment changed, automatic rollback refused");
    throw error;
  }
}
try {
  validateSource();execFileSync(process.execPath, ["scripts/generate-portfolios.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-ecosystem.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-docs.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-discovery.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-services.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-chrome.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-contact.mjs","--check"], {cwd:root,stdio:"inherit"});execFileSync(process.execPath, ["scripts/generate-lab.mjs","--check"], {cwd:root,stdio:"inherit"});await validateWorker();
  const action=process.argv[2]||"check";
  if(action==="deploy")await deploy();
  else if(action==="smoke")await smoke();
  else if(action==="manifest")console.log(JSON.stringify(manifest));
  else if(action!=="check")throw Error("Use check, manifest, deploy or smoke");
} catch(error) {
  console.error(error.message);
  process.exitCode=1;
}
