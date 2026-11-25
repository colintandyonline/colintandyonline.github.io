(()=>{"use strict";
const storageKey="ctdg-engineering-analytics-v1";
const denied={ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied"};
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
gtag("consent","default",denied);
let loaded=false;
function load(){if(loaded)return;loaded=true;gtag("consent","update",{...denied,analytics_storage:"granted"});window.dataLayer.push({"gtm.start":Date.now(),event:"gtm.js"});const script=document.createElement("script");script.async=true;script.src="https://www.googletagmanager.com/gtm.js?id=GTM-WKW6GMBK";document.head.appendChild(script);}
function stored(){try{const v=localStorage.getItem(storageKey);return v==="allow"||v==="deny"?v:null;}catch{return null;}}
function save(v){try{localStorage.setItem(storageKey,v);return true;}catch{return false;}}
function init(){const panel=document.getElementById("analytics-choice"),settings=document.getElementById("analytics-settings"),allow=document.getElementById("analytics-allow"),deny=document.getElementById("analytics-deny");if(!panel||!settings||!allow||!deny)return;
let choice=stored();if(choice==="allow")load();panel.hidden=choice!==null;
settings.addEventListener("click",()=>{panel.hidden=false;allow.focus();});
allow.addEventListener("click",()=>{save("allow");choice="allow";panel.hidden=true;load();settings.focus();});
deny.addEventListener("click",()=>{const persisted=save("deny");choice="deny";panel.hidden=true;if(loaded){gtag("consent","update",denied);if(persisted)location.reload();}else settings.focus();});
window.addEventListener("storage",e=>{if(e.key===storageKey&&e.newValue!==choice)location.reload();});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();