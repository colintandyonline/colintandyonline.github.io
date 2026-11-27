import fs from "node:fs";
import assert from "node:assert/strict";
import {applyChrome} from "./site-chrome.mjs";
import {stackCSS} from "./stack-colours.mjs";
for(const path of ["index.html","roadmap.html"]){const s=fs.readFileSync(path,"utf8");const next=applyChrome(s);if(process.argv.includes("--check"))assert.equal(s,next,path);else fs.writeFileSync(path,next);}
const css=fs.readFileSync("showcase.css","utf8");const next=css.replace(/\/\* CTDG-STACK-COLOURS-START \*\/[\s\S]*?\/\* CTDG-STACK-COLOURS-END \*\//,stackCSS());if(process.argv.includes("--check"))assert.equal(css,next,"Stack palette drift");else fs.writeFileSync("showcase.css",next);console.log("Verified static footer, sharing metadata and stack palette");
