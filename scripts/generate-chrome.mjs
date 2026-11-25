import fs from "node:fs";
import assert from "node:assert/strict";
import {applyChrome} from "./site-chrome.mjs";
for(const path of ["index.html","roadmap.html"]){const s=fs.readFileSync(path,"utf8");const next=applyChrome(s);if(process.argv.includes("--check"))assert.equal(s,next,path);else fs.writeFileSync(path,next);}
console.log("Verified static footer and sharing metadata");
