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

/* CTDG observatory scenes and established project accents. No live telemetry. */
(()=>{
"use strict";
const root=document.documentElement,body=document.body,route=location.pathname;
const projects=[{"slug":"ctdg-website","title":"CTDG Website & Cora","project":"CTDG Website","color":"#F38020"},{"slug":"interactive-demos","title":"Interactive Demos","project":"Interactive Demos","color":"#F38020"},{"slug":"kayacart","title":"KayaCart","project":"KayaCart","color":"#7F52FF"},{"slug":"gandalf-mobile","title":"Gandalf Mobile","project":"Gandalf Mobile","color":"#16834B"},{"slug":"axiom-architect","title":"Axiom Architect","project":"Axiom Architect","color":"#4285F4"},{"slug":"deepmind-resources","title":"DeepMind Resources","project":"DeepMind Resources","color":"#168B68"},{"slug":"trailtrade","title":"TrailTrade","project":"TrailTrade","color":"#B49B00"}];
const bySlug=new Map(projects.map(p=>[p.slug,p]));
const icons={"ctdg-website":"globe","interactive-demos":"activity","kayacart":"layers","gandalf-mobile":"bot","axiom-architect":"code-xml","deepmind-resources":"book-open","trailtrade":"network"};
const categoryColors={"AI systems":"#7F52FF","Integration":"#168B68","Applications":"#4285F4","Assurance":"#16834B","Research":"#B49B00","Automation":"#16834B","Conversational AI":"#F38020","Voice technology":"#7F52FF"};
const variants=route==="/ecosystem/"?"orbit":route==="/intelligence/"||route==="/roadmap.html"?"telemetry":route==="/docs/"?"precision":route==="/services/"||route==="/contact/"?"circuit":route==="/cora/"?"halo":(route==="/lab/"||route==="/workforce/")?"orbit":route.startsWith("/projects")?"network":"observatory";
root.dataset.engineeringScene=variants;
const NS="http://www.w3.org/2000/svg";
function element(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function icon(name){const e=element("svg",{class:"ctdg-icon motion-section-icon",width:18,height:18,"aria-hidden":"true",focusable:"false"});e.append(element("use",{href:"/assets/icons.svg#"+name}));return e;}
const paths={
 observatory:["M-80 330Q250 45 700 250","M-60 380Q300 85 700 300","M30 70L120 130 215 55 330 105 480 25 640 90"],
 orbit:["M70 210C70 20 570 20 570 210S70 400 70 210","M20 200C180 -40 540 30 620 220S170 420 20 200","M120 220L320 200 490 100M320 200L470 305M320 200L180 100"],
 telemetry:["M-10 235H80L110 170H170L205 270H270L305 95H355L390 235H445L485 145H530L575 205H660","M-10 305H95L135 260H220L270 305H350L400 265H480L530 305H660","M0 105H640"],
 precision:["M0 80H640M0 200H640M0 320H640","M80 0V360M240 0V360M400 0V360M560 0V360","M80 80H240V200H400V80H560V320H400"],
 circuit:["M0 80H110L170 140H300L360 80H640","M0 280H130L190 220H320L380 280H640","M90 80V200H230L290 140M400 80V180H550L610 240H640"],
 halo:["M320 50A130 130 0 1 1 319.9 50","M320 15A165 165 0 1 1 319.9 15","M320 85A95 95 0 1 1 319.9 85","M0 180H120M520 180H640"],
 network:["M0 80L115 145 225 65 345 150 470 70 640 135","M0 290L115 145 205 285 345 150 455 285 640 135","M225 65L205 285M470 70L455 285M115 145L345 150"]
};
const nodes={
 observatory:[[120,130],[215,55],[330,105],[480,25]],
 orbit:[[120,220],[320,200],[490,100],[470,305],[180,100]],
 telemetry:[[110,170],[205,270],[305,95],[485,145],[575,205]],
 precision:[[80,80],[240,200],[400,80],[560,320]],
 circuit:[[110,80],[300,140],[360,80],[190,220],[380,280],[550,180]],
 halo:[[320,50],[450,180],[320,310],[190,180]],
 network:[[115,145],[225,65],[345,150],[470,70],[205,285],[455,285]]
};
function scene(type,cls){const e=element("svg",{class:"ctdg-scene "+cls,viewBox:"0 0 640 360",preserveAspectRatio:cls==="ctdg-scene-background"?"xMidYMid slice":"xMidYMid meet","aria-hidden":"true",focusable:"false"});
(paths[type]||paths.observatory).forEach((d,i)=>{e.append(element("path",{d,class:"ctdg-scene-line"}));e.append(element("path",{d,class:"ctdg-scene-signal",style:"--signal-delay:"+(-i*2.3)+"s"}));});
(nodes[type]||nodes.observatory).forEach(([x,y],i)=>{e.append(element("circle",{cx:x,cy:y,r:9,class:"ctdg-scene-glow",style:"--signal-delay:"+(-i*1.1)+"s"}));e.append(element("circle",{cx:x,cy:y,r:2.5,class:"ctdg-scene-dot"}));});
return e;}
body.prepend(scene(variants,"ctdg-scene-background"));
function projectFor(card){const direct=card.getAttribute("data-project");if(bySlug.has(direct))return bySlug.get(direct);for(const a of card.querySelectorAll("a[href]")){const m=a.getAttribute("href").match(/^\/projects\/([^/]+)\/?$/);if(m&&bySlug.has(m[1]))return bySlug.get(m[1]);}const name=card.querySelector("h2,h3,strong")?.textContent.trim();return projects.find(p=>p.title===name||p.project===name)||(name==="Gandalf"?bySlug.get("gandalf-mobile"):null);}
for(const card of document.querySelectorAll("main .work-card,main .doc-entry,main .source-grid article,main .eco-project,main .guide-project-card,main #projects .card,main #repositories .card")){
 const p=projectFor(card);if(!p)continue;card.classList.add("ctdg-accent-card");card.style.setProperty("--ctdg-accent",p.color);if(card.matches(".work-card,#projects .card"))card.style.setProperty("--project",p.color);
 const h=card.querySelector("h2,h3");if(h&&!h.querySelector("svg")&&!card.matches(".eco-project")){h.prepend(icon(icons[p.slug]));h.classList.add("ctdg-icon-heading");}
}
for(const card of document.querySelectorAll("main .service-card")){const category=card.dataset.service||card.querySelector(".service-top .eyebrow")?.textContent.trim();const accent=categoryColors[category];if(accent){card.classList.add("ctdg-accent-card");card.style.setProperty("--ctdg-accent",accent);}}
const sectionIcons={"How to use these references":"book-open","Engineering evidence":"shield-check","Project constellation":"network","Explore the stack":"layers","Programme lifecycle":"activity","Recorded development history":"calendar-range","Reviewed repository evidence":"folder-code","Engineering capabilities and enquiry areas":"code-xml","Engineering capabilities and inquiry areas":"code-xml","How an engineering engagement is scoped":"network","Laboratory questions":"book-open","Experience catalogue":"flask-conical","Engineering evaluation framework":"shield-check","What can we help with?":"layers","Prepare your technical brief":"book-open","What happens next?":"activity","Contact options":"mail","Explore our projects":"folder-code","Frequently asked questions":"book-open","What we are building":"folder-code","Public source directory":"code-xml","Engineering intelligence":"chart-no-axes-combined","Engineering notes & community":"users","Help us build useful technology.":"heart-handshake","Technology across our projects":"layers"};
for(const heading of document.querySelectorAll("main h2")){const symbol=sectionIcons[heading.textContent.trim()];if(symbol&&!heading.querySelector("svg")&&!heading.closest(".cora-section-head")){heading.prepend(icon(symbol));heading.classList.add("ctdg-icon-heading");}}
for(const graph of document.querySelectorAll(".ecosystem-graph")){for(const edge of graph.querySelectorAll("path[data-edge]")){const signal=element("path",{d:edge.getAttribute("d"),stroke:edge.getAttribute("stroke"),class:"ctdg-edge-signal","aria-hidden":"true"});edge.after(signal);}}
if(route==="/intelligence/"||route==="/ecosystem/"){const shell=document.querySelector(".lab-shell");const panel=shell?.querySelector(".lab-map");if(panel){shell.classList.add("ctdg-balanced-shell");const fill=document.createElement("div");fill.className="ctdg-scene-fill";fill.setAttribute("aria-hidden","true");fill.append(scene(variants,"ctdg-scene-inline"));panel.append(fill);}}
const grids=[...document.querySelectorAll("main .work-grid,main .doc-grid,main .service-grid,main .source-grid")];
for(const grid of grids){const fill=document.createElement("div");fill.className="ctdg-grid-fill";fill.setAttribute("aria-hidden","true");fill.hidden=true;fill.append(scene(variants,"ctdg-scene-inline"));grid.append(fill);
 let frame=0;function update(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const cols=getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;const count=[...grid.children].filter(e=>e!==fill&&!e.hidden&&getComputedStyle(e).display!=="none").length;const rem=count%cols;const empty=cols-rem;const show=cols>1&&count>0&&rem>0;fill.hidden=!show;if(show)fill.style.gridColumn="span "+empty;});}
 if(typeof ResizeObserver==="function"){const ro=new ResizeObserver(update);ro.observe(grid);}
 if(typeof MutationObserver==="function"){const mo=new MutationObserver(update);for(const child of grid.children)if(child!==fill)mo.observe(child,{attributes:true,attributeFilter:["hidden","style","class"]});}
 update();
}
})();
