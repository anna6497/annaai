import fs from "node:fs/promises";
import path from "node:path";
const src=path.join(process.cwd(),"data","hsk");
const stamp=new Date().toISOString().replace(/[:.]/g,"-");
const dst=path.join(process.cwd(),"data","backups",`hsk-${stamp}`);
await fs.mkdir(dst,{recursive:true});
for(const f of await fs.readdir(src)){if(f.endsWith(".json"))await fs.copyFile(path.join(src,f),path.join(dst,f))}
console.log(`Backup created: ${dst}`);
