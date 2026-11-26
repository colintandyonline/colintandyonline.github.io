import fs from "node:fs";
import assert from "node:assert/strict";
import {applyChrome} from "./site-chrome.mjs";
const records=JSON.parse(fs.readFileSync("scripts/portfolio-records.json","utf8"));
const host="https://engineering.ctdigital.group";
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const icon=n=>'<svg class="ctdg-icon" width="18" height="18" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#'+n+'"></use></svg>';
const nav=fs.readFileSync("index.html","utf8").match(/<header>[\s\S]*?<\/header>/)[0].replace(/ aria-current="page"/g,"").replaceAll('href="./"','href="/"').replaceAll('href="./#','href="/#').replace('href="roadmap.html"','href="/roadmap.html"').replace('src="assets/','src="/assets/');
const steps=[
  [
    "Find the right solution",
    "Looking for AI reception, automation or a custom application? Start with our engineering capabilities and explore the work that matches your goal.",
    "house",
    "/services/",
    "Find engineering services"
  ],
  [
    "Discover our projects",
    "See how our web, mobile and AI projects are put together, from the problem they address to their architecture and technologies.",
    "folder-code",
    "/projects/",
    "Explore project portfolios"
  ],
  [
    "Explore the technology",
    "Discover how our projects connect to languages, frameworks, cloud services and AI technologies. Find developer references to investigate further.",
    "layers",
    "/ecosystem/",
    "Explore the ecosystem"
  ],
  [
    "Experience AI in action",
    "Try an AI receptionist, follow an automated lead journey, explore workflow automation or listen to voice samples in the Innovation Laboratory.",
    "flask-conical",
    "/lab/",
    "Launch the experiences"
  ],
  [
    "Follow our innovation",
    "Discover what we are developing, what has been completed and the milestones that shape our future engineering work.",
    "chart-no-axes-combined",
    "/intelligence/",
    "Explore engineering intelligence"
  ],
  [
    "Build something together",
    "Have an idea, a technical challenge or a potential research partnership? Tell our engineering team what you want to achieve.",
    "mail",
    "/contact/",
    "Discuss your project"
  ]
];
const cards=steps.map(([title,body,symbol,path,label],i)=>'<article class="guide-step service-card" id="guide-step-'+(i+1)+'" data-guide-step><div class="service-top"><span class="service-symbol">'+icon(symbol)+'</span><span class="eyebrow">EXPLORE WITH CORA</span></div><h2>'+esc(title)+'</h2><p>'+esc(body)+'</p><a class="action" href="'+path+'">'+esc(label)+' '+icon("arrow-right")+'</a></article>').join("");
const projectIcons={"ctdg-website":"globe","interactive-demos":"activity","kayacart":"layers","gandalf-mobile":"bot","axiom-architect":"code-xml","deepmind-resources":"book-open","trailtrade":"network"};
const projectLinks=records.map(r=>'<li><a class="guide-project-card" href="/projects/'+esc(r.slug)+'/"><span class="guide-project-symbol">'+icon(projectIcons[r.slug]||"folder-code")+'</span><span class="guide-project-body"><strong>'+esc(r.title)+'</strong><span class="guide-project-domain">'+esc(r.domain)+'</span><span class="guide-project-tags">'+r.stack.map(t=>'<span>'+esc(t)+'</span>').join("")+'</span></span><span class="guide-project-arrow">'+icon("arrow-right")+'</span></a></li>').join("");
const title="Cora engineering guided tour | CTDG Engineering";
const desc="Meet Cora, your guide to CTDG engineering services, AI demonstrations, project portfolios, developer resources and technical enquiries.";
const questions=[
  [
    "bot",
    "What can Cora help me explore?",
    "Use the guided tour to find engineering services, project case studies, developer documentation, interactive AI experiences and our contact centre."
  ],
  [
    "activity",
    "Can I speak to Cora?",
    "Yes. <a href=\"https://ctdigital.group/interactive/ai-receptionist\">Open our interactive AI receptionist</a> to try the corporate conversational experience. The engineering guide on this page uses selectable text topics."
  ],
  [
    "layers",
    "What types of AI and automation can I explore?",
    "Try workflow automation, lead follow-up and conversational reception in our <a href=\"/lab/\">Innovation Laboratory</a>. Our <a href=\"/services/\">engineering services</a> include AI agents, integrations, custom applications and governance."
  ],
  [
    "book-open",
    "Can I inspect the technology behind your projects?",
    "Yes. The <a href=\"/projects/\">project portfolios</a> include architecture and technology information, while <a href=\"/docs/\">developer documentation</a> links to reviewed public source and technical references."
  ],
  [
    "flask-conical",
    "Can I try an AI receptionist before discussing a project?",
    "Yes. Explore the <a href=\"https://ctdigital.group/interactive/ai-receptionist\">receptionist demonstration</a> and <a href=\"https://ctdigital.group/voice-library\">voice library</a>. Use fictional details when testing."
  ],
  [
    "network",
    "Can CTDG connect AI to my existing systems?",
    "We can discuss your existing software, APIs, workflows and integration requirements. Feasibility and the required access are assessed during technical discovery."
  ],
  [
    "code-xml",
    "Do you develop bespoke applications and AI agents?",
    "Our engineering enquiry areas include custom web and mobile applications, AI agents, multi-agent systems and legacy modernisation. Tell us your intended outcomes so we can discuss the scope."
  ],
  [
    "mail",
    "How do I get a quote or discuss my project?",
    "Visit our <a href=\"/contact/\">engineering contact centre</a>, email <a href=\"mailto:developers@ctdigital.group\">developers@ctdigital.group</a> or use the existing <a href=\"https://ctdigital.group/contact\">CTDG enquiry form</a>. Pricing and delivery are agreed after assessing your requirements."
  ],
  [
    "heart-handshake",
    "Can developers collaborate with CTDG?",
    "We welcome technical and research partnership enquiries. Explore our <a href=\"/#community\">developer community</a>, <a href=\"https://github.com/colintandyonline\">GitHub profile</a> and <a href=\"/contact/\">contact centre</a>."
  ],
  [
    "shield-check",
    "What information should I share in an enquiry?",
    "Describe the problem, intended outcomes and existing systems. Do not include passwords, API credentials or sensitive customer records in an initial enquiry. See our <a href=\"https://ctdigital.group/privacy\">privacy policy</a>."
  ]
];
const faqCards=questions.map(([symbol,q,a])=>'<details class="cora-faq-item"><summary><span class="cora-faq-icon">'+icon(symbol)+'</span><span>'+esc(q)+'</span><span class="cora-faq-chevron" aria-hidden="true">'+icon("arrow-right")+'</span></summary><div class="cora-faq-answer"><p>'+a+'</p></div></details>').join("");
const raw='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+desc+'"><meta name="robots" content="index,follow"><link rel="canonical" href="'+host+'/cora/"><title>'+title+'</title><link rel="stylesheet" href="/showcase.css"><link rel="stylesheet" href="/portfolio.css"><link rel="stylesheet" href="/ecosystem.css"><link rel="stylesheet" href="/services.css"><link rel="stylesheet" href="/cora-guide.css"></head><body>'+nav+'<main><p class="crumb"><a href="/">Engineering &amp; Innovation</a> / Cora guided tour</p><section class="cora-hero"><div class="cora-hero-content"><span class="eyebrow cora-product-label">'+icon("bot")+' CORA / ENGINEERING EDITION</span><h1>Meet Cora.<br><span>Your guide to what’s possible.</span></h1><p>Discover practical AI, explore our technology and find the right engineering solution for your next idea.</p><div class="actions cora-hero-actions"><a class="button primary" href="#guided-tour">'+icon("globe")+' Explore with Cora</a><a class="button" href="https://ctdigital.group/interactive/ai-receptionist">'+icon("activity")+' Talk to corporate Cora</a></div><div class="cora-hero-note">'+icon("circle-check")+' Guided engineering experience &middot; Interactive voice demo on our corporate site</div></div><div class="cora-media"><div class="cora-media-top"><span>'+icon("bot")+' Meet Cora</span><span>CT DIGITAL GROUP</span></div><video controls playsinline preload="none" aria-label="CTDG Engineering and Innovation introduction, presented by Cora"><source src="https://github.com/colintandyonline/colintandyonline.github.io/releases/download/cora-engineering-film-v1/cora-engineering-1080p.mp4" type="video/mp4"> <a href="https://github.com/colintandyonline/colintandyonline.github.io/releases/download/cora-engineering-film-v1/cora-engineering-1080p.mp4">Watch the Cora introduction</a></video><div class="cora-media-caption">'+icon("activity")+' Play the Engineering &amp; Innovation introduction</div></div></section><section id="guided-tour" class="cora-explore" aria-label="Engineering guided tour"><div class="cora-section-head"><span class="service-symbol">'+icon("globe")+'</span><div><span class="eyebrow">CHOOSE YOUR JOURNEY</span><h2>What would you like to explore?</h2><p>Pick a topic or follow the guided journey at your own pace.</p></div></div><div class="guide-controls" id="guide-controls" hidden><div class="guide-meter"><label for="guide-progress" id="guide-count">Stage 1 of '+steps.length+'</label><progress id="guide-progress" max="'+steps.length+'" value="1"></progress></div><div class="guide-buttons" id="guide-buttons">'+steps.map((s,i)=>'<button type="button" data-guide-index="'+i+'"><span class="guide-topic-icon">'+icon(s[2])+'</span><span>'+esc(s[0])+'</span><span class="guide-topic-arrow">'+icon("arrow-right")+'</span></button>').join("")+'</div></div><div class="guide-stages" id="guide-stages">'+cards+'</div><div class="guide-pagination" id="guide-pagination" hidden><button class="button" id="guide-prev" type="button">Previous stage</button><button class="button" id="guide-reset" type="button">Restart tour</button><button class="button primary" id="guide-next" type="button">Next stage</button></div><p id="guide-status" role="status" class="guide-status"></p></section><section class="guide-portfolio"><div class="guide-portfolio-heading"><div><span class="eyebrow">ENGINEERING PORTFOLIOS</span><h2>Explore our projects</h2><p>Explore the architecture, technology and reviewed source evidence behind each project.</p></div><a class="button" href="/projects/">All portfolios '+icon("arrow-right")+'</a></div><ul class="guide-projects">'+projectLinks+'</ul><div class="guide-portfolio-footer"><a class="button" href="/docs/">'+icon("book-open")+' Developer documentation '+icon("arrow-right")+'</a></div></section><section class="cora-faq" id="faq"><div class="cora-section-head"><span class="service-symbol">'+icon("book-open")+'</span><div><span class="eyebrow">YOUR QUESTIONS, ANSWERED</span><h2>Frequently asked questions</h2><p>Explore Cora, our engineering capabilities and how we can work together.</p></div></div><div class="cora-faq-grid">'+faqCards+'</div></section><section class="cora-contact-banner"><span class="service-symbol">'+icon("mail")+'</span><div><span class="eyebrow">LET’S BUILD SOMETHING</span><h2>Bring us your next idea.</h2><p>Connect with our engineering team to discuss your project.</p></div><a class="button primary" href="/contact/">Contact engineering '+icon("arrow-right")+'</a></section></main><footer>CT DIGITAL GROUP</footer><script src="/cora-guide.js" defer></script></body></html>\n';
const html=applyChrome(raw);
if(process.argv.includes("--check"))assert.equal(fs.readFileSync("cora/index.html","utf8").replace(/\r\n/g,"\n"),html);else{fs.mkdirSync("cora",{recursive:true});fs.writeFileSync("cora/index.html",html);}
console.log("Verified "+steps.length+" scripted tour stages and "+records.length+" public project links");
