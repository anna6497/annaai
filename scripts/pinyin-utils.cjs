const MAP={ā:["a","1"],á:["a","2"],ǎ:["a","3"],à:["a","4"],ē:["e","1"],é:["e","2"],ě:["e","3"],è:["e","4"],ī:["i","1"],í:["i","2"],ǐ:["i","3"],ì:["i","4"],ō:["o","1"],ó:["o","2"],ǒ:["o","3"],ò:["o","4"],ū:["u","1"],ú:["u","2"],ǔ:["u","3"],ù:["u","4"],ǖ:["ü","1"],ǘ:["ü","2"],ǚ:["ü","3"],ǜ:["ü","4"],ń:["n","2"],ň:["n","3"],ǹ:["n","4"],ḿ:["m","2"]};
function clean(v){return String(v??"").replace(/[|]/g," | ").replace(/[-–—']/g," ").replace(/\s+/g," ").trim()}
function syllableToNumber(s){if(s==="|")return"|";let tone="5",plain="";for(const c of s.normalize("NFC")){const m=MAP[c];if(m){plain+=m[0];tone=m[1]}else plain+=c}plain=plain.replace(/ü/g,"v").replace(/Ü/g,"V");return /[1-5]$/.test(plain)?plain:`${plain}${tone}`}
function toToneNumberPinyin(v){return clean(v).split(/\s+/).filter(Boolean).map(syllableToNumber).join(" ").replace(/\s+\|\s+/g," | ")}
function toSearchPinyin(v){return toToneNumberPinyin(v).replace(/[1-5]/g,"").replace(/v/g,"u").toLowerCase().trim()}
module.exports={normalizeDisplayPinyin:clean,toToneNumberPinyin,toSearchPinyin};
