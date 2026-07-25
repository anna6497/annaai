import fs from "node:fs/promises";
import path from "node:path";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {normalizeDisplayPinyin,toToneNumberPinyin,toSearchPinyin}=require("./pinyin-utils.cjs");
const files=["hsk1.json","hsk2.json","hsk3.json","hsk4.json","hsk5.json","hsk6.json","hsk7-9.json"];
const clean=v=>String(v??"").replace(/\s+/g," ").trim();
const primary=v=>clean(v).split("|").map(x=>x.trim()).filter(Boolean)[0]??clean(v);
const uniq=a=>[...new Set(a.filter(Boolean))];
let total=0,pinyinCount=0,englishCount=0,myanmarCount=0;
for(const filename of files){
  const filePath=path.join(process.cwd(),"data","hsk",filename);
  const words=JSON.parse(await fs.readFile(filePath,"utf8"));
  const finalized=words.map(source=>{
    total++;
    const pinyin=normalizeDisplayPinyin(source.pinyin??source.dictionaryPinyin??"");
    const meaning=clean(source.meaning??source.english);
    const meaningMyanmar=clean(source.meaningMyanmar??source.myanmar);
    if(pinyin)pinyinCount++; if(meaning)englishCount++; if(meaningMyanmar)myanmarCount++;
    const levelSafe=String(source.level).toLowerCase().replace(/[^a-z0-9-]/g,"-");
    const strokeCharacters=uniq(Array.from(primary(source.hanzi)).filter(c=>/[\u3400-\u9fff]/u.test(c)));
    const word={
      ...source,
      hanzi:clean(source.hanzi),
      primaryHanzi:primary(source.hanzi),
      traditional:clean(source.traditional),
      pinyin,
      primaryPinyin:primary(pinyin),
      pinyinNumber:toToneNumberPinyin(pinyin),
      pinyinSearch:toSearchPinyin(pinyin),
      meaning,
      english:meaning,
      meaningMyanmar,
      myanmar:meaningMyanmar,
      audioKey:source.audioKey??`hsk-${levelSafe}/${source.id}.mp3`,
      strokeCharacters,
    };
    const searchKeywords=uniq([
      word.hanzi,word.traditional,word.pinyin,word.pinyinNumber,word.pinyinSearch,
      word.meaning,word.meaningMyanmar,...(word.partOfSpeech??[])
    ].flatMap(v=>String(v??"").toLowerCase().split(/[;,/|()\[\]\s]+/)).map(v=>v.trim()));
    return {...word,searchKeywords,datasetVersion:"anna-ai-hsk-final-v1",finalizedAt:new Date().toISOString()};
  });
  await fs.writeFile(filePath,JSON.stringify(finalized),"utf8");
  console.log(`Finalized ${filename}: ${finalized.length}`);
}
const manifest={datasetVersion:"anna-ai-hsk-final-v1",generatedAt:new Date().toISOString(),total,coverage:{pinyin:pinyinCount,english:englishCount,myanmar:myanmarCount}};
await fs.writeFile(path.join(process.cwd(),"data","hsk","manifest.final.json"),JSON.stringify(manifest,null,2),"utf8");
console.log(manifest);
