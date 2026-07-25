import fs from "node:fs/promises";
import path from "node:path";
const files=["hsk1.json","hsk2.json","hsk3.json","hsk4.json","hsk5.json","hsk6.json","hsk7-9.json"];
let total=0,missingPinyin=0,missingNumber=0,missingEnglish=0,missingMyanmar=0,duplicateIds=0;
const ids=new Set();
for(const f of files){
  const words=JSON.parse(await fs.readFile(path.join(process.cwd(),"data","hsk",f),"utf8"));
  for(const w of words){total++;if(ids.has(w.id))duplicateIds++;ids.add(w.id);if(!String(w.pinyin??"").trim())missingPinyin++;if(!String(w.pinyinNumber??"").trim())missingNumber++;if(!String(w.meaning??w.english??"").trim())missingEnglish++;if(!String(w.meaningMyanmar??w.myanmar??"").trim())missingMyanmar++}
}
console.log({total,missingPinyin,missingNumber,missingEnglish,missingMyanmar,duplicateIds});
if(missingPinyin||missingNumber||duplicateIds)process.exitCode=1;
