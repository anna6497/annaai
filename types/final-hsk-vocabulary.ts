export interface FinalHskVocabularyItem {
  id:string; hanzi:string; primaryHanzi:string; traditional:string;
  pinyin:string; primaryPinyin:string; pinyinNumber:string; pinyinSearch:string;
  partOfSpeech:string[]; level:string|number; lesson:number|null;
  meaning:string; english:string; meaningMyanmar:string; myanmar:string;
  examples:Array<{hanzi:string;pinyin:string;meaning?:string;meaningMyanmar?:string}>;
  characters:string[]; strokeCharacters:string[]; audioKey:string;
  searchKeywords:string[]; datasetVersion:string; finalizedAt:string;
}
