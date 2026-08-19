export type HskReadingStorySource = {
  id: string;
  level: number;
  order: number;

  title: string;
  pinyinTitle: string;
  myanmarTitle: string;

  category:
    | "daily-life"
    | "school"
    | "friends"
    | "shopping"
    | "travel";

  difficulty:
    | "easy"
    | "medium"
    | "hard";

  estimatedMinutes: number;

  paragraphs: string[];
  pinyinParagraphs: string[];
  myanmarParagraphs: string[];

  keywords: string[];

  audioUrl: string | null;
  audioText: string;
};

export const HSK4_READING_STORIES:
  HskReadingStorySource[] = [
  {
    id: "hsk4-reading-001",
    level: 4,
    order: 1,
    title: "换工作的决定",
    pinyinTitle: "Huàn gōngzuò de juédìng",
    myanmarTitle: "အလုပ်ပြောင်းဖို့ ဆုံးဖြတ်ခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "我在原来的公司工作了三年。刚开始的时候，我很喜欢那份工作，因为同事友好，工作内容也比较熟悉。但是时间长了以后，我发现自己每天做的事情几乎都一样，很少有机会学习新的东西。",
      "那段时间，我一直在想要不要换工作。一方面，我担心新的工作环境不适合自己；另一方面，我又觉得如果一直留在原来的地方，可能很难有新的发展。为了做决定，我和家人、朋友谈了很多次，也认真想了自己的未来计划。",
      "最后，我决定开始找新的工作。虽然这个决定让我有一点紧张，但是我也觉得自己应该给未来更多可能。后来我真的找到了一份更适合自己的工作，也学到了很多新的东西。",
      "现在回头看，我觉得换工作不是为了逃离原来的生活，而是为了让自己继续成长。有时候，一个重要的决定会让人不安，但是只要认真考虑过，就应该勇敢地往前走。",
    ],

    pinyinParagraphs: [
      "Wǒ zài yuánlái de gōngsī gōngzuò le sān nián. Gāng kāishǐ de shíhou, wǒ hěn xǐhuan nà fèn gōngzuò, yīnwèi tóngshì yǒuhǎo, gōngzuò nèiróng yě bǐjiào shúxī. Dànshì shíjiān cháng le yǐhòu, wǒ fāxiàn zìjǐ měitiān zuò de shìqing jīhū dōu yíyàng, hěn shǎo yǒu jīhuì xuéxí xīn de dōngxi.",
      "Nà duàn shíjiān, wǒ yìzhí zài xiǎng yào búyào huàn gōngzuò. Yì fāngmiàn, wǒ dānxīn xīn de gōngzuò huánjìng bù shìhé zìjǐ; lìng yì fāngmiàn, wǒ yòu juéde rúguǒ yìzhí liú zài yuánlái de dìfang, kěnéng hěn nán yǒu xīn de fāzhǎn. Wèile zuò juédìng, wǒ hé jiārén, péngyou tán le hěn duō cì, yě rènzhēn xiǎng le zìjǐ de wèilái jìhuà.",
      "Zuìhòu, wǒ juédìng kāishǐ zhǎo xīn de gōngzuò. Suīrán zhège juédìng ràng wǒ yǒu yìdiǎn jǐnzhāng, dànshì wǒ yě juéde zìjǐ yīnggāi gěi wèilái gèng duō kěnéng. Hòulái wǒ zhēnde zhǎodào le yí fèn gèng shìhé zìjǐ de gōngzuò, yě xué dào le hěn duō xīn de dōngxi.",
      "Xiànzài huítóu kàn, wǒ juéde huàn gōngzuò bú shì wèile táolí yuánlái de shēnghuó, ér shì wèile ràng zìjǐ jìxù chéngzhǎng. Yǒu shíhou, yí ge zhòngyào de juédìng huì ràng rén bù'ān, dànshì zhǐyào rènzhēn kǎolǜ guo, jiù yīnggāi yǒnggǎn de wǎng qián zǒu.",
    ],

    myanmarParagraphs: [
      "ကျွန်မက အရင်ကုမ္ပဏီမှာ သုံးနှစ်အလုပ်လုပ်ခဲ့တယ်။ အစမှာ လုပ်ဖော်ကိုင်ဖက်တွေက ဖော်ရွေပြီး အလုပ်လည်း ရင်းနှီးလို့ အဲဒီအလုပ်ကိုကြိုက်တယ်။ ဒါပေမယ့် အချိန်ကြာလာတော့ နေ့တိုင်းလုပ်ရတာတွေ တူလာပြီး အသစ်လေ့လာခွင့်နည်းလာတယ်။",
      "အဲဒီအချိန် အလုပ်ပြောင်းသင့်မသင့် အမြဲစဉ်းစားနေတယ်။ တစ်ဖက်က အလုပ်အသစ်နဲ့ မလိုက်ဖက်မှာစိုးတယ်၊ တစ်ဖက်ကလည်း ဒီနေရာမှာပဲနေသွားရင် တိုးတက်ဖို့ခက်မယ်လို့ ခံစားရတယ်။ ဆုံးဖြတ်ဖို့ မိသားစုနဲ့ သူငယ်ချင်းတွေကို မကြာခဏဆွေးနွေးပြီး ကိုယ့်အနာဂတ်ကိုလည်း သေချာစဉ်းစားတယ်။",
      "နောက်ဆုံး အလုပ်အသစ်ရှာဖို့ဆုံးဖြတ်တယ်။ စိတ်လှုပ်ရှားပေမယ့် အနာဂတ်အတွက် ရွေးချယ်စရာပိုပေးသင့်တယ်လို့ထင်တယ်။ နောက်ပိုင်း ကိုယ့်နဲ့ပိုကိုက်တဲ့အလုပ်ရပြီး အသစ်တွေလည်းအများကြီးသင်ယူရတယ်။",
      "အခု ပြန်ကြည့်ရင် အလုပ်ပြောင်းတာက အရင်ဘဝကနေထွက်ပြေးတာမဟုတ်ဘဲ ကိုယ့်ကို ဆက်တိုးတက်စေဖို့ပါ။ အရေးကြီးတဲ့ဆုံးဖြတ်ချက်တွေက တစ်ခါတလေ စိတ်မအေးစေပေမယ့် သေချာစဉ်းစားပြီးပြီဆိုရင် ရဲရဲရှေ့ဆက်သင့်တယ်။",
    ],

    keywords: [
      "决定",
      "机会",
      "发展",
      "环境",
      "担心",
      "未来",
      "适合",
      "成长",
      "考虑",
      "勇敢",
    ],

    audioUrl: null,
    audioText:
      "我在原来的公司工作了三年。刚开始的时候，我很喜欢那份工作，因为同事友好，工作内容也比较熟悉。但是时间长了以后，我发现自己每天做的事情几乎都一样，很少有机会学习新的东西。那段时间，我一直在想要不要换工作。一方面，我担心新的工作环境不适合自己；另一方面，我又觉得如果一直留在原来的地方，可能很难有新的发展。为了做决定，我和家人、朋友谈了很多次，也认真想了自己的未来计划。最后，我决定开始找新的工作。虽然这个决定让我有一点紧张，但是我也觉得自己应该给未来更多可能。后来我真的找到了一份更适合自己的工作，也学到了很多新的东西。现在回头看，我觉得换工作不是为了逃离原来的生活，而是为了让自己继续成长。有时候，一个重要的决定会让人不安，但是只要认真考虑过，就应该勇敢地往前走。",
  },

  {
    id: "hsk4-reading-002",
    level: 4,
    order: 2,
    title: "一次难忘的旅行",
    pinyinTitle: "Yí cì nánwàng de lǚxíng",
    myanmarTitle: "မမေ့နိုင်တဲ့ ခရီးတစ်ခေါက်",
    category: "travel",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "两年前，我和三个朋友一起去了一个靠近山区的小城市旅行。我们本来计划只住两天，但是因为那里比我们想象中更漂亮，所以最后多住了一天。",
      "第一天，我们去了当地最有名的山。刚开始天气很好，可是走到一半的时候突然下起了雨。我们没有带伞，只能先找一个地方休息。虽然计划被打乱了，但是大家都没有生气。",
      "雨停以后，山里的空气变得特别清新。我们继续往上走，最后终于到了山顶。站在那里，我们可以看到整个城市和远处的河。那一刻，大家都觉得之前的辛苦很值得。",
      "这次旅行让我记得最清楚的，并不是去了多少地方，而是和朋友一起面对意外的过程。后来每次看到那次旅行的照片，我都会想起大家一起笑、一起走路的画面。",
    ],

    pinyinParagraphs: [
      "Liǎng nián qián, wǒ hé sān ge péngyou yìqǐ qù le yí ge kàojìn shānqū de xiǎo chéngshì lǚxíng. Wǒmen běnlái jìhuà zhǐ zhù liǎng tiān, dànshì yīnwèi nàli bǐ wǒmen xiǎngxiàng zhōng gèng piàoliang, suǒyǐ zuìhòu duō zhù le yì tiān.",
      "Dì yī tiān, wǒmen qù le dāngdì zuì yǒumíng de shān. Gāng kāishǐ tiānqì hěn hǎo, kěshì zǒu dào yíbàn de shíhou tūrán xià qǐ le yǔ. Wǒmen méiyǒu dài sǎn, zhǐ néng xiān zhǎo yí ge dìfang xiūxi. Suīrán jìhuà bèi dǎluàn le, dànshì dàjiā dōu méiyǒu shēngqì.",
      "Yǔ tíng yǐhòu, shān lǐ de kōngqì biàn de tèbié qīngxīn. Wǒmen jìxù wǎng shàng zǒu, zuìhòu zhōngyú dào le shāndǐng. Zhàn zài nàli, wǒmen kěyǐ kàndào zhěng ge chéngshì hé yuǎnchù de hé. Nà yí kè, dàjiā dōu juéde zhīqián de xīnkǔ hěn zhíde.",
      "Zhè cì lǚxíng ràng wǒ jìde zuì qīngchu de, bìng bú shì qù le duōshao dìfang, ér shì hé péngyou yìqǐ miànduì yìwài de guòchéng. Hòulái měi cì kàndào nà cì lǚxíng de zhàopiàn, wǒ dōu huì xiǎng qǐ dàjiā yìqǐ xiào, yìqǐ zǒulù de huàmiàn.",
    ],

    myanmarParagraphs: [
      "နှစ်နှစ်လောက်အရင်က သူငယ်ချင်းသုံးယောက်နဲ့ တောင်တန်းဒေသနားက မြို့လေးတစ်မြို့ကိုခရီးသွားတယ်။ အစက နှစ်ရက်ပဲနေဖို့စီစဉ်ပေမယ့် ထင်ထားတာထက်လှလို့ တစ်ရက်ထပ်နေလိုက်တယ်။",
      "ပထမနေ့မှာ ဒေသရဲ့ နာမည်ကြီးတောင်ကိုတက်တယ်။ အစမှာ ရာသီဥတုကောင်းပေမယ့် လမ်းတစ်ဝက်လောက်ရောက်တော့ ရုတ်တရက်မိုးရွာတယ်။ ထီးမပါလို့ နားစရာနေရာရှာရတယ်။ အစီအစဉ်ပျက်ပေမယ့် ဘယ်သူမှစိတ်မဆိုးဘူး။",
      "မိုးတိတ်တော့ တောင်ပေါ်လေက အရမ်းလတ်ဆတ်လာတယ်။ ဆက်တက်ပြီး နောက်ဆုံးတောင်ထိပ်ရောက်တယ်။ အဲဒီကနေ မြို့တစ်မြို့လုံးနဲ့ အဝေးကမြစ်ကိုမြင်ရတယ်။ အဲဒီအချိန်မှာ ပင်ပန်းခဲ့တာတန်တယ်လို့အားလုံးထင်တယ်။",
      "ဒီခရီးမှာ အမှတ်ရဆုံးက ဘယ်နှနေရာသွားခဲ့လဲမဟုတ်ဘဲ မထင်မှတ်တာတွေကို သူငယ်ချင်းတွေနဲ့အတူ ရင်ဆိုင်ခဲ့တာပါ။ အခုလည်း ဓာတ်ပုံတွေကြည့်တိုင်း အတူရယ်ခဲ့တာ၊ အတူလမ်းလျှောက်ခဲ့တာတွေကို သတိရတယ်။",
    ],

    keywords: [
      "难忘",
      "旅行",
      "山区",
      "计划",
      "突然",
      "打乱",
      "清新",
      "山顶",
      "辛苦",
      "值得",
    ],

    audioUrl: null,
    audioText:
      "两年前，我和三个朋友一起去了一个靠近山区的小城市旅行。我们本来计划只住两天，但是因为那里比我们想象中更漂亮，所以最后多住了一天。第一天，我们去了当地最有名的山。刚开始天气很好，可是走到一半的时候突然下起了雨。我们没有带伞，只能先找一个地方休息。虽然计划被打乱了，但是大家都没有生气。雨停以后，山里的空气变得特别清新。我们继续往上走，最后终于到了山顶。站在那里，我们可以看到整个城市和远处的河。那一刻，大家都觉得之前的辛苦很值得。这次旅行让我记得最清楚的，并不是去了多少地方，而是和朋友一起面对意外的过程。后来每次看到那次旅行的照片，我都会想起大家一起笑、一起走路的画面。",
  },

  {
    id: "hsk4-reading-003",
    level: 4,
    order: 3,
    title: "学习一门外语",
    pinyinTitle: "Xuéxí yì mén wàiyǔ",
    myanmarTitle: "နိုင်ငံခြားဘာသာတစ်ခုလေ့လာခြင်း",
    category: "school",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "很多人开始学习一门外语的时候，都希望自己能很快说得很好。我以前也是这样。学习中文的前几个月，我每天记很多单词，也花很多时间做练习。",
      "但是过了一段时间以后，我发现自己认识的词虽然越来越多，真正说话的时候却还是不知道怎么表达。这让我有一点失望，也开始怀疑自己的学习方法。",
      "后来老师告诉我，学习语言不能只记单词，还要把听、说、读、写放在一起练习。从那以后，我每天都会听一点中文，也会试着把新学的词放进句子里。",
      "慢慢地，我发现自己没有以前那么怕说错了。现在我觉得，学外语最重要的不是每天学多少，而是能不能长期坚持，并且真正把学到的东西用起来。",
    ],

    pinyinParagraphs: [
      "Hěn duō rén kāishǐ xuéxí yì mén wàiyǔ de shíhou, dōu xīwàng zìjǐ néng hěn kuài shuō de hěn hǎo. Wǒ yǐqián yě shì zhèyàng. Xuéxí Zhōngwén de qián jǐ ge yuè, wǒ měitiān jì hěn duō dāncí, yě huā hěn duō shíjiān zuò liànxí.",
      "Dànshì guò le yí duàn shíjiān yǐhòu, wǒ fāxiàn zìjǐ rènshi de cí suīrán yuèláiyuè duō, zhēnzhèng shuōhuà de shíhou què háishi bù zhīdào zěnme biǎodá. Zhè ràng wǒ yǒu yìdiǎn shīwàng, yě kāishǐ huáiyí zìjǐ de xuéxí fāngfǎ.",
      "Hòulái lǎoshī gàosu wǒ, xuéxí yǔyán bù néng zhǐ jì dāncí, hái yào bǎ tīng, shuō, dú, xiě fàng zài yìqǐ liànxí. Cóng nà yǐhòu, wǒ měitiān dōu huì tīng yìdiǎn Zhōngwén, yě huì shìzhe bǎ xīn xué de cí fàng jìn jùzi lǐ.",
      "Mànmàn de, wǒ fāxiàn zìjǐ méiyǒu yǐqián nàme pà shuō cuò le. Xiànzài wǒ juéde, xué wàiyǔ zuì zhòngyào de bú shì měitiān xué duōshao, ér shì néng bù néng chángqī jiānchí, bìngqiě zhēnzhèng bǎ xué dào de dōngxi yòng qǐlái.",
    ],

    myanmarParagraphs: [
      "လူအများကြီးက နိုင်ငံခြားဘာသာတစ်ခု စလေ့လာတဲ့အခါ အမြန်ပြောတတ်ချင်ကြတယ်။ ကျွန်မလည်း အရင်ကဒီလိုပဲ။ တရုတ်စာစလေ့လာတဲ့လတွေမှာ နေ့တိုင်း စကားလုံးအများကြီးကျက်ပြီး exercise လည်းအများကြီးလုပ်တယ်။",
      "ဒါပေမယ့် အချိန်ကြာလာတော့ စကားလုံးအများကြီးသိလာပေမယ့် တကယ်ပြောရင် ဘယ်လိုဖော်ပြရမလဲမသိသေးဘူး။ ဒီအရာက နည်းနည်းစိတ်ပျက်စေပြီး ကိုယ့်လေ့လာနည်းကိုတောင် သံသယဝင်လာတယ်။",
      "နောက်တော့ ဆရာက ဘာသာစကားလေ့လာတာမှာ vocabulary ပဲမလုံလောက်ဘဲ listening, speaking, reading, writing အားလုံးတွဲလေ့ကျင့်ရမယ်လို့ပြောတယ်။ အဲဒီနောက် နေ့တိုင်း တရုတ်စာနားထောင်ပြီး စကားလုံးအသစ်ကို စာကြောင်းထဲသုံးကြည့်တယ်။",
      "တဖြည်းဖြည်းနဲ့ မှားမှာအရင်လောက်မကြောက်တော့ဘူး။ အခုတော့ နိုင်ငံခြားဘာသာလေ့လာရာမှာ တစ်နေ့ဘယ်လောက်လေ့လာလဲထက် ရေရှည်ဆက်လုပ်နိုင်ဖို့နဲ့ တကယ်အသုံးချနိုင်ဖို့က ပိုအရေးကြီးတယ်လို့ထင်တယ်။",
    ],

    keywords: [
      "外语",
      "希望",
      "表达",
      "失望",
      "怀疑",
      "方法",
      "语言",
      "练习",
      "长期",
      "坚持",
    ],

    audioUrl: null,
    audioText:
      "很多人开始学习一门外语的时候，都希望自己能很快说得很好。我以前也是这样。学习中文的前几个月，我每天记很多单词，也花很多时间做练习。但是过了一段时间以后，我发现自己认识的词虽然越来越多，真正说话的时候却还是不知道怎么表达。这让我有一点失望，也开始怀疑自己的学习方法。后来老师告诉我，学习语言不能只记单词，还要把听、说、读、写放在一起练习。从那以后，我每天都会听一点中文，也会试着把新学的词放进句子里。慢慢地，我发现自己没有以前那么怕说错了。现在我觉得，学外语最重要的不是每天学多少，而是能不能长期坚持，并且真正把学到的东西用起来。",
  },

  {
    id: "hsk4-reading-004",
    level: 4,
    order: 4,
    title: "和父母的一次谈话",
    pinyinTitle: "Hé fùmǔ de yí cì tánhuà",
    myanmarTitle: "မိဘတွေနဲ့ စကားပြောခဲ့ခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "大学毕业以后，我一直在外地工作。刚开始的时候，我觉得自己终于可以独立生活了，所以很少跟父母谈自己的困难。",
      "有一次，我在工作上遇到了一些问题，心情很不好。妈妈打电话的时候听出了我的声音不太对，就问我是不是发生了什么事。",
      "我本来不想让他们担心，但是后来还是把事情说了出来。父母没有马上告诉我应该怎么做，只是安静地听我说完，然后告诉我，不管最后怎么决定，他们都会支持我。",
      "那次谈话以后，我突然觉得轻松了很多。我也明白了，长大和独立并不表示什么事情都必须一个人解决。有时候，把自己的想法告诉家人也是一种力量。",
    ],

    pinyinParagraphs: [
      "Dàxué bìyè yǐhòu, wǒ yìzhí zài wàidì gōngzuò. Gāng kāishǐ de shíhou, wǒ juéde zìjǐ zhōngyú kěyǐ dúlì shēnghuó le, suǒyǐ hěn shǎo gēn fùmǔ tán zìjǐ de kùnnan.",
      "Yǒu yí cì, wǒ zài gōngzuò shàng yùdào le yìxiē wèntí, xīnqíng hěn bù hǎo. Māma dǎ diànhuà de shíhou tīng chū le wǒ de shēngyīn bú tài duì, jiù wèn wǒ shì bú shì fāshēng le shénme shì.",
      "Wǒ běnlái bù xiǎng ràng tāmen dānxīn, dànshì hòulái háishi bǎ shìqing shuō le chūlái. Fùmǔ méiyǒu mǎshàng gàosu wǒ yīnggāi zěnme zuò, zhǐshì ānjìng de tīng wǒ shuō wán, ránhòu gàosu wǒ, bùguǎn zuìhòu zěnme juédìng, tāmen dōu huì zhīchí wǒ.",
      "Nà cì tánhuà yǐhòu, wǒ tūrán juéde qīngsōng le hěn duō. Wǒ yě míngbai le, zhǎngdà hé dúlì bìng bù biǎoshì shénme shìqing dōu bìxū yí ge rén jiějué. Yǒu shíhou, bǎ zìjǐ de xiǎngfǎ gàosu jiārén yě shì yì zhǒng lìliàng.",
    ],

    myanmarParagraphs: [
      "တက္ကသိုလ်ပြီးကတည်းက အိမ်နဲ့ဝေးတဲ့နေရာမှာ အလုပ်လုပ်နေတယ်။ အစမှာ ကိုယ့်ဘဝကို ကိုယ်တိုင်ရပ်တည်နိုင်ပြီလို့ထင်ပြီး အခက်အခဲတွေကို မိဘတွေကိုသိပ်မပြောဘူး။",
      "တစ်ခါက အလုပ်မှာ ပြဿနာတချို့ကြုံပြီး စိတ်မကောင်းဖြစ်နေတယ်။ အမေဖုန်းခေါ်တော့ အသံမတူတာသတိထားပြီး ဘာဖြစ်လဲမေးတယ်။",
      "သူတို့စိုးရိမ်မှာမလိုချင်ပေမယ့် နောက်ဆုံးအကုန်ပြောလိုက်တယ်။ မိဘတွေက ချက်ချင်းအကြံမပေးဘဲ အေးအေးဆေးဆေးနားထောင်ပြီး ဘယ်လိုဆုံးဖြတ်ဆုံးဖြတ် အမြဲထောက်ခံမယ်လို့ပြောတယ်။",
      "အဲဒီစကားပြောပြီးနောက် စိတ်အများကြီးပေါ့သွားတယ်။ အရွယ်ရောက်ပြီး independent ဖြစ်တာက အရာအားလုံးကို တစ်ယောက်တည်းဖြေရှင်းရမယ်ဆိုတာမဟုတ်ဘူးလို့လည်း သိလာတယ်။ တစ်ခါတလေ ကိုယ့်အတွေးကို မိသားစုကိုပြောပြခြင်းကလည်း အင်အားတစ်ခုပါ။",
    ],

    keywords: [
      "父母",
      "独立",
      "困难",
      "心情",
      "担心",
      "支持",
      "轻松",
      "解决",
      "想法",
      "力量",
    ],

    audioUrl: null,
    audioText:
      "大学毕业以后，我一直在外地工作。刚开始的时候，我觉得自己终于可以独立生活了，所以很少跟父母谈自己的困难。有一次，我在工作上遇到了一些问题，心情很不好。妈妈打电话的时候听出了我的声音不太对，就问我是不是发生了什么事。我本来不想让他们担心，但是后来还是把事情说了出来。父母没有马上告诉我应该怎么做，只是安静地听我说完，然后告诉我，不管最后怎么决定，他们都会支持我。那次谈话以后，我突然觉得轻松了很多。我也明白了，长大和独立并不表示什么事情都必须一个人解决。有时候，把自己的想法告诉家人也是一种力量。",
  },

  {
    id: "hsk4-reading-005",
    level: 4,
    order: 5,
    title: "第一次独立生活",
    pinyinTitle: "Dì yī cì dúlì shēnghuó",
    myanmarTitle: "ပထမဆုံး ကိုယ့်ဘာသာနေထိုင်ခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "二十三岁的时候，我第一次离开家，一个人搬到另一个城市生活。刚搬过去的时候，我觉得很自由，因为每天做什么都可以自己决定。",
      "可是没过多久，我就发现独立生活并没有想象中那么简单。除了工作，我还要自己做饭、洗衣服、交房租、处理各种生活中的小问题。",
      "有一次我生病了，那几天特别想家。以前在家的时候，妈妈会准备饭，也会提醒我吃药。那时候我才真正明白，家人的照顾并不是理所当然的。",
      "慢慢地，我学会了照顾自己，也开始更认真地安排生活。独立生活让我变得更成熟，同时也让我更懂得珍惜家人。",
    ],

    pinyinParagraphs: [
      "Èrshísān suì de shíhou, wǒ dì yī cì líkāi jiā, yí ge rén bān dào lìng yí ge chéngshì shēnghuó. Gāng bān guòqù de shíhou, wǒ juéde hěn zìyóu, yīnwèi měitiān zuò shénme dōu kěyǐ zìjǐ juédìng.",
      "Kěshì méi guò duōjiǔ, wǒ jiù fāxiàn dúlì shēnghuó bìng méiyǒu xiǎngxiàng zhōng nàme jiǎndān. Chúle gōngzuò, wǒ hái yào zìjǐ zuòfàn, xǐ yīfu, jiāo fángzū, chǔlǐ gè zhǒng shēnghuó zhōng de xiǎo wèntí.",
      "Yǒu yí cì wǒ shēngbìng le, nà jǐ tiān tèbié xiǎng jiā. Yǐqián zài jiā de shíhou, māma huì zhǔnbèi fàn, yě huì tíxǐng wǒ chī yào. Nà shíhou wǒ cái zhēnzhèng míngbai, jiārén de zhàogù bìng bú shì lǐsuǒdāngrán de.",
      "Mànmàn de, wǒ xuéhuì le zhàogù zìjǐ, yě kāishǐ gèng rènzhēn de ānpái shēnghuó. Dúlì shēnghuó ràng wǒ biàn de gèng chéngshú, tóngshí yě ràng wǒ gèng dǒngde zhēnxī jiārén.",
    ],

    myanmarParagraphs: [
      "အသက် ၂၃ နှစ်မှာ ပထမဆုံး အိမ်ကနေခွဲပြီး တခြားမြို့တစ်မြို့မှာ တစ်ယောက်တည်းနေခဲ့တယ်။ အစမှာ နေ့တိုင်းဘာလုပ်မလဲကို ကိုယ်တိုင်ဆုံးဖြတ်နိုင်လို့ လွတ်လပ်တယ်လို့ခံစားရတယ်။",
      "ဒါပေမယ့် မကြာခင် independent life က ထင်ထားသလောက်မလွယ်ဘူးဆိုတာ သိလာတယ်။ အလုပ်အပြင် အစားအသောက်ချက်တာ၊ အဝတ်လျှော်တာ၊ အိမ်လခပေးတာနဲ့ နေ့စဉ်ပြဿနာတွေအားလုံး ကိုယ်တိုင်လုပ်ရတယ်။",
      "တစ်ခါက နေမကောင်းဖြစ်တော့ အိမ်ကိုအရမ်းလွမ်းတယ်။ အရင်အိမ်မှာဆို အမေက စားစရာပြင်ပြီး ဆေးသောက်ဖို့လည်းသတိပေးတယ်။ အဲဒီအချိန်မှ မိသားစုစောင့်ရှောက်မှုက အလိုအလျောက်ရသင့်တဲ့အရာမဟုတ်ဘူးဆိုတာ နားလည်လာတယ်။",
      "တဖြည်းဖြည်း ကိုယ့်ကိုယ်ကိုစောင့်ရှောက်တတ်လာပြီး ဘဝကိုလည်း ပိုသေချာစီမံတတ်လာတယ်။ တစ်ယောက်တည်းနေခြင်းက ကျွန်မကို ပိုရင့်ကျက်လာစေပြီး မိသားစုတန်ဖိုးကိုလည်း ပိုသိလာစေတယ်။",
    ],

    keywords: [
      "独立",
      "自由",
      "房租",
      "处理",
      "生病",
      "照顾",
      "理所当然",
      "成熟",
      "珍惜",
      "生活",
    ],

    audioUrl: null,
    audioText:
      "二十三岁的时候，我第一次离开家，一个人搬到另一个城市生活。刚搬过去的时候，我觉得很自由，因为每天做什么都可以自己决定。可是没过多久，我就发现独立生活并没有想象中那么简单。除了工作，我还要自己做饭、洗衣服、交房租、处理各种生活中的小问题。有一次我生病了，那几天特别想家。以前在家的时候，妈妈会准备饭，也会提醒我吃药。那时候我才真正明白，家人的照顾并不是理所当然的。慢慢地，我学会了照顾自己，也开始更认真地安排生活。独立生活让我变得更成熟，同时也让我更懂得珍惜家人。",
  },

  {
    id: "hsk4-reading-006",
    level: 4,
    order: 6,
    title: "重新联系老朋友",
    pinyinTitle: "Chóngxīn liánxì lǎo péngyou",
    myanmarTitle: "သူငယ်ချင်းဟောင်းနဲ့ ပြန်ဆက်သွယ်ခြင်း",
    category: "friends",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "上大学的时候，我有一个很好的朋友。毕业以后，我们去了不同的城市工作。刚开始还常常联系，后来大家越来越忙，慢慢就很少说话了。",
      "去年有一天，我整理手机里的旧照片，突然看到我们大学时候的照片。我想起以前一起上课、一起吃饭的日子，于是决定给她发一条消息。",
      "我本来担心这么久没联系会有一点尴尬，没想到她很快就回复了。我们聊了很久，才发现虽然几年没有见面，但是很多感觉都没有改变。",
      "后来我们约在一个周末见面。那天我们谈了各自的工作和生活，也笑着回忆以前的事情。我觉得真正的朋友有时候不需要天天联系，只要重新见面，还是可以很自然。",
    ],

    pinyinParagraphs: [
      "Shàng dàxué de shíhou, wǒ yǒu yí ge hěn hǎo de péngyou. Bìyè yǐhòu, wǒmen qù le bùtóng de chéngshì gōngzuò. Gāng kāishǐ hái chángcháng liánxì, hòulái dàjiā yuèláiyuè máng, mànmàn jiù hěn shǎo shuōhuà le.",
      "Qùnián yǒu yì tiān, wǒ zhěnglǐ shǒujī lǐ de jiù zhàopiàn, tūrán kàndào wǒmen dàxué shíhou de zhàopiàn. Wǒ xiǎng qǐ yǐqián yìqǐ shàngkè, yìqǐ chīfàn de rìzi, yúshì juédìng gěi tā fā yì tiáo xiāoxi.",
      "Wǒ běnlái dānxīn zhème jiǔ méi liánxì huì yǒu yìdiǎn gāngà, méi xiǎngdào tā hěn kuài jiù huífù le. Wǒmen liáo le hěn jiǔ, cái fāxiàn suīrán jǐ nián méiyǒu jiànmiàn, dànshì hěn duō gǎnjué dōu méiyǒu gǎibiàn.",
      "Hòulái wǒmen yuē zài yí ge zhōumò jiànmiàn. Nà tiān wǒmen tán le gèzì de gōngzuò hé shēnghuó, yě xiàozhe huíyì yǐqián de shìqing. Wǒ juéde zhēnzhèng de péngyou yǒu shíhou bù xūyào tiāntiān liánxì, zhǐyào chóngxīn jiànmiàn, háishi kěyǐ hěn zìrán.",
    ],

    myanmarParagraphs: [
      "တက္ကသိုလ်တုန်းက အရမ်းခင်တဲ့သူငယ်ချင်းတစ်ယောက်ရှိတယ်။ ဘွဲ့ရပြီးတော့ မတူတဲ့မြို့တွေမှာ အလုပ်လုပ်ကြတယ်။ အစမှာ မကြာခဏဆက်သွယ်ပေမယ့် အားလုံးအလုပ်များလာတော့ စကားနည်းလာတယ်။",
      "မနှစ်က တစ်နေ့ ဖုန်းထဲကဓာတ်ပုံဟောင်းတွေစီရင်း တက္ကသိုလ်တုန်းကဓာတ်ပုံတွေမြင်တယ်။ အတူတက်ခဲ့တာ၊ အတူစားခဲ့တာတွေကို သတိရပြီး message ပို့ဖို့ဆုံးဖြတ်တယ်။",
      "ဒီလောက်ကြာ မဆက်သွယ်ထားလို့ အနည်းငယ်အဆင်မပြေဖြစ်မယ်ထင်ပေမယ့် သူက အမြန်ပြန်တယ်။ အချိန်တော်တော်ကြာစကားပြောပြီး နှစ်တွေကြာမတွေ့ပေမယ့် အရင်လိုခံစားချက်အများကြီးမပြောင်းသေးဘူးဆိုတာသိလာတယ်။",
      "နောက်တော့ ပိတ်ရက်တစ်ရက်မှာတွေ့ကြတယ်။ ကိုယ့်အလုပ်၊ ဘဝအကြောင်းပြောပြီး ဟောင်းတဲ့အမှတ်တရတွေကို ရယ်ရင်းပြောကြတယ်။ တကယ့်သူငယ်ချင်းဆို နေ့တိုင်းမဆက်သွယ်ရလည်း ပြန်တွေ့တဲ့အခါ သဘာဝကျကျဆက်ဖြစ်နိုင်တယ်လို့ထင်တယ်။",
    ],

    keywords: [
      "联系",
      "毕业",
      "整理",
      "回忆",
      "尴尬",
      "回复",
      "感觉",
      "改变",
      "真正",
      "自然",
    ],

    audioUrl: null,
    audioText:
      "上大学的时候，我有一个很好的朋友。毕业以后，我们去了不同的城市工作。刚开始还常常联系，后来大家越来越忙，慢慢就很少说话了。去年有一天，我整理手机里的旧照片，突然看到我们大学时候的照片。我想起以前一起上课、一起吃饭的日子，于是决定给她发一条消息。我本来担心这么久没联系会有一点尴尬，没想到她很快就回复了。我们聊了很久，才发现虽然几年没有见面，但是很多感觉都没有改变。后来我们约在一个周末见面。那天我们谈了各自的工作和生活，也笑着回忆以前的事情。我觉得真正的朋友有时候不需要天天联系，只要重新见面，还是可以很自然。",
  },

  {
    id: "hsk4-reading-007",
    level: 4,
    order: 7,
    title: "一次工作上的错误",
    pinyinTitle: "Yí cì gōngzuò shàng de cuòwù",
    myanmarTitle: "အလုပ်မှာ မှားခဲ့ဖူးတဲ့အတွေ့အကြုံ",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "刚参加工作的时候，我曾经犯过一次让我印象很深的错误。那天经理让我准备一份重要的报告，我因为赶时间，没有认真检查就发了出去。",
      "过了十几分钟，我突然发现报告里有一个数字写错了。虽然错误不算特别严重，但是这份报告已经发给了客户，我一下子非常紧张。",
      "我马上告诉经理发生了什么，也主动联系客户说明情况，并重新发了一份正确的文件。经理没有批评我太久，只提醒我以后重要文件一定要认真检查。",
      "从那以后，我养成了发送文件以前再检查一次的习惯。这个错误让我明白，工作中犯错并不可怕，真正重要的是发现以后怎么处理，以及能不能从错误中学到东西。",
    ],

    pinyinParagraphs: [
      "Gāng cānjiā gōngzuò de shíhou, wǒ céngjīng fàn guo yí cì ràng wǒ yìnxiàng hěn shēn de cuòwù. Nà tiān jīnglǐ ràng wǒ zhǔnbèi yí fèn zhòngyào de bàogào, wǒ yīnwèi gǎn shíjiān, méiyǒu rènzhēn jiǎnchá jiù fā le chūqù.",
      "Guò le shí jǐ fēnzhōng, wǒ tūrán fāxiàn bàogào lǐ yǒu yí ge shùzì xiě cuò le. Suīrán cuòwù bú suàn tèbié yánzhòng, dànshì zhè fèn bàogào yǐjīng fā gěi le kèhù, wǒ yíxiàzi fēicháng jǐnzhāng.",
      "Wǒ mǎshàng gàosu jīnglǐ fāshēng le shénme, yě zhǔdòng liánxì kèhù shuōmíng qíngkuàng, bìng chóngxīn fā le yí fèn zhèngquè de wénjiàn. Jīnglǐ méiyǒu pīpíng wǒ tài jiǔ, zhǐ tíxǐng wǒ yǐhòu zhòngyào wénjiàn yídìng yào rènzhēn jiǎnchá.",
      "Cóng nà yǐhòu, wǒ yǎngchéng le fāsòng wénjiàn yǐqián zài jiǎnchá yí cì de xíguàn. Zhège cuòwù ràng wǒ míngbai, gōngzuò zhōng fàncuò bìng bù kěpà, zhēnzhèng zhòngyào de shì fāxiàn yǐhòu zěnme chǔlǐ, yǐjí néng bù néng cóng cuòwù zhōng xué dào dōngxi.",
    ],

    myanmarParagraphs: [
      "အလုပ်စဝင်ခါစက အမှတ်ရစရာ အမှားတစ်ခုလုပ်ဖူးတယ်။ အဲဒီနေ့ manager က အရေးကြီး report တစ်ခုလုပ်ခိုင်းတယ်။ အချိန်လောလို့ သေချာမစစ်ဘဲပို့လိုက်တယ်။",
      "၁၀ မိနစ်ကျော်ကြာမှ report ထဲမှာ ကိန်းဂဏန်းတစ်ခုမှားနေတယ်ဆိုတာတွေ့တယ်။ ပြဿနာကြီးမဟုတ်ပေမယ့် client ဆီပို့ပြီးသားဖြစ်လို့ အရမ်းစိတ်လှုပ်ရှားသွားတယ်။",
      "Manager ကိုချက်ချင်းပြောပြီး client ကိုလည်း ဆက်သွယ်ရှင်းပြကာ မှန်တဲ့ဖိုင်ပြန်ပို့တယ်။ Manager က အရမ်းမဆူဘဲ နောက်တစ်ခါ အရေးကြီးဖိုင်ကို ပို့မယ့်အရင် သေချာစစ်ဖို့သတိပေးတယ်။",
      "အဲဒီနောက် ဖိုင်ပို့မယ့်အရင် နောက်တစ်ကြိမ်စစ်တဲ့အလေ့အကျင့်ရလာတယ်။ အလုပ်မှာအမှားလုပ်တာကိုယ်တိုင်ထက် အမှားတွေ့ပြီးဘယ်လိုဖြေရှင်းလဲနဲ့ အဲဒီအမှားကနေဘာသင်ယူလဲက ပိုအရေးကြီးတယ်လို့ နားလည်လာတယ်။",
    ],

    keywords: [
      "错误",
      "报告",
      "数字",
      "客户",
      "主动",
      "情况",
      "正确",
      "文件",
      "养成",
      "处理",
    ],

    audioUrl: null,
    audioText:
      "刚参加工作的时候，我曾经犯过一次让我印象很深的错误。那天经理让我准备一份重要的报告，我因为赶时间，没有认真检查就发了出去。过了十几分钟，我突然发现报告里有一个数字写错了。虽然错误不算特别严重，但是这份报告已经发给了客户，我一下子非常紧张。我马上告诉经理发生了什么，也主动联系客户说明情况，并重新发了一份正确的文件。经理没有批评我太久，只提醒我以后重要文件一定要认真检查。从那以后，我养成了发送文件以前再检查一次的习惯。这个错误让我明白，工作中犯错并不可怕，真正重要的是发现以后怎么处理，以及能不能从错误中学到东西。",
  },

  {
    id: "hsk4-reading-008",
    level: 4,
    order: 8,
    title: "搬家以后",
    pinyinTitle: "Bānjiā yǐhòu",
    myanmarTitle: "အိမ်ပြောင်းပြီးနောက်",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "去年我因为工作搬到了一个新的地区。新家离公司很近，但是我对周围完全不熟悉。",
      "刚搬来的几个星期，我常常要看地图才能找到超市、银行和车站。有时候下班以后想出去吃饭，也不知道哪家店比较好。",
      "后来我开始每天晚上在附近走一走。慢慢地，我认识了常去的咖啡店老板，也发现了一个很安静的小公园。",
      "几个月以后，这个原来很陌生的地方变得越来越熟悉。我觉得一个地方是不是像“家”，并不只是看住了多久，还要看自己有没有真正开始在这里生活。",
    ],

    pinyinParagraphs: [
      "Qùnián wǒ yīnwèi gōngzuò bān dào le yí ge xīn de dìqū. Xīn jiā lí gōngsī hěn jìn, dànshì wǒ duì zhōuwéi wánquán bù shúxī.",
      "Gāng bān lái de jǐ ge xīngqī, wǒ chángcháng yào kàn dìtú cái néng zhǎodào chāoshì, yínháng hé chēzhàn. Yǒu shíhou xiàbān yǐhòu xiǎng chūqù chīfàn, yě bù zhīdào nǎ jiā diàn bǐjiào hǎo.",
      "Hòulái wǒ kāishǐ měitiān wǎnshang zài fùjìn zǒu yì zǒu. Mànmàn de, wǒ rènshi le cháng qù de kāfēidiàn lǎobǎn, yě fāxiàn le yí ge hěn ānjìng de xiǎo gōngyuán.",
      "Jǐ ge yuè yǐhòu, zhège yuánlái hěn mòshēng de dìfang biàn de yuèláiyuè shúxī. Wǒ juéde yí ge dìfang shì bú shì xiàng 'jiā', bìng bù zhǐshì kàn zhù le duōjiǔ, hái yào kàn zìjǐ yǒu méiyǒu zhēnzhèng kāishǐ zài zhèlǐ shēnghuó.",
    ],

    myanmarParagraphs: [
      "မနှစ်က အလုပ်ကြောင့် နေရာအသစ်တစ်ခုကို ပြောင်းနေခဲ့တယ်။ အိမ်အသစ်က ရုံးနဲ့နီးပေမယ့် ပတ်ဝန်းကျင်ကို လုံးဝမသိဘူး။",
      "အစပိုင်းသီတင်းပတ်တွေမှာ supermarket, bank, ဘူတာရှာဖို့မြေပုံကြည့်ရတယ်။ အလုပ်ဆင်းပြီး ဘယ်ဆိုင်စားကောင်းလဲတောင် မသိဘူး။",
      "နောက်တော့ ညတိုင်းအနီးမှာ လမ်းလျှောက်တတ်လာတယ်။ တဖြည်းဖြည်း အမြဲသွားတဲ့ကော်ဖီဆိုင်ရှင်နဲ့ရင်းနှီးပြီး တိတ်ဆိတ်တဲ့ပန်းခြံလေးတစ်ခုလည်းတွေ့တယ်။",
      "လအနည်းငယ်ကြာတော့ အစကမရင်းနှီးတဲ့နေရာက တဖြည်းဖြည်း ကိုယ့်နေရာလိုဖြစ်လာတယ်။ နေရာတစ်ခုကို အိမ်လိုခံစားရဖို့ ဘယ်လောက်ကြာနေခဲ့လဲထက် အဲဒီနေရာမှာ တကယ်ဘဝစတင်နေထိုင်ထားလားက ပိုအရေးကြီးတယ်လို့ ထင်တယ်။",
    ],

    keywords: [
      "地区",
      "周围",
      "熟悉",
      "陌生",
      "地图",
      "附近",
      "发现",
      "公园",
      "生活",
      "真正",
    ],

    audioUrl: null,
    audioText:
      "去年我因为工作搬到了一个新的地区。新家离公司很近，但是我对周围完全不熟悉。刚搬来的几个星期，我常常要看地图才能找到超市、银行和车站。有时候下班以后想出去吃饭，也不知道哪家店比较好。后来我开始每天晚上在附近走一走。慢慢地，我认识了常去的咖啡店老板，也发现了一个很安静的小公园。几个月以后，这个原来很陌生的地方变得越来越熟悉。我觉得一个地方是不是像家，并不只是看住了多久，还要看自己有没有真正开始在这里生活。",
  },

  {
    id: "hsk4-reading-009",
    level: 4,
    order: 9,
    title: "一次成功的演讲",
    pinyinTitle: "Yí cì chénggōng de yǎnjiǎng",
    myanmarTitle: "အောင်မြင်တဲ့ တင်ပြချက်တစ်ခု",
    category: "school",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "公司安排我做一次简单的工作分享。虽然只有十分钟，但是我从来没有在这么多人面前正式讲话，所以提前一星期就开始准备。",
      "我先把内容写下来，然后做成几个简单的重点。每天晚上，我都会自己练习一次，有时候还会录下声音，看看哪些地方说得太快。",
      "真正开始演讲的时候，我还是很紧张。刚开始的几句话声音有一点小，但是看到同事们认真听，我慢慢放松下来。",
      "最后，我顺利讲完了所有内容。经理还说我准备得很清楚。这次经历让我发现，很多事情开始以前看起来很难，但是认真准备以后，往往没有想象中那么可怕。",
    ],

    pinyinParagraphs: [
      "Gōngsī ānpái wǒ zuò yí cì jiǎndān de gōngzuò fēnxiǎng. Suīrán zhǐ yǒu shí fēnzhōng, dànshì wǒ cónglái méiyǒu zài zhème duō rén miànqián zhèngshì jiǎnghuà, suǒyǐ tíqián yì xīngqī jiù kāishǐ zhǔnbèi.",
      "Wǒ xiān bǎ nèiróng xiě xiàlái, ránhòu zuò chéng jǐ ge jiǎndān de zhòngdiǎn. Měitiān wǎnshang, wǒ dōu huì zìjǐ liànxí yí cì, yǒu shíhou hái huì lù xià shēngyīn, kànkan nǎxiē dìfang shuō de tài kuài.",
      "Zhēnzhèng kāishǐ yǎnjiǎng de shíhou, wǒ háishi hěn jǐnzhāng. Gāng kāishǐ de jǐ jù huà shēngyīn yǒu yìdiǎn xiǎo, dànshì kàndào tóngshìmen rènzhēn tīng, wǒ mànmàn fàngsōng xiàlái.",
      "Zuìhòu, wǒ shùnlì jiǎng wán le suǒyǒu nèiróng. Jīnglǐ hái shuō wǒ zhǔnbèi de hěn qīngchu. Zhè cì jīnglì ràng wǒ fāxiàn, hěn duō shìqing kāishǐ yǐqián kàn qǐlái hěn nán, dànshì rènzhēn zhǔnbèi yǐhòu, wǎngwǎng méiyǒu xiǎngxiàng zhōng nàme kěpà.",
    ],

    myanmarParagraphs: [
      "ကုမ္ပဏီက အလုပ်အကြောင်း ၁၀ မိနစ် presentation လုပ်ခိုင်းတယ်။ လူအများရှေ့မှာ formal presentation မလုပ်ဖူးလို့ တစ်ပတ်ကြိုပြင်တယ်။",
      "အရင် content ရေးပြီး အဓိကအချက်အနည်းငယ်ခွဲတယ်။ ညတိုင်း ကိုယ်တိုင်လေ့ကျင့်ပြီး တစ်ခါတလေ အသံ record လုပ်ကာ ဘယ်နေရာမြန်လွန်းလဲစစ်တယ်။",
      "Presentation တကယ်စတော့ စိတ်လှုပ်ရှားနေသေးတယ်။ အစမှာအသံနည်းနည်းတိုးပေမယ့် လုပ်ဖော်ကိုင်ဖက်တွေသေချာနားထောင်နေတာမြင်တော့ ဖြည်းဖြည်းအေးသွားတယ်။",
      "နောက်ဆုံး content အကုန်အဆင်ပြေပြေပြောနိုင်တယ်။ Manager ကလည်း ပြင်ဆင်ထားတာရှင်းတယ်လို့ပြောတယ်။ ဒီအတွေ့အကြုံက အစမလုပ်ခင်ခက်တယ်ထင်တဲ့အရာတွေကို သေချာပြင်ဆင်ထားရင် ထင်ထားသလောက်မကြောက်စရာမဟုတ်ဘူးလို့ သင်ပေးတယ်။",
    ],

    keywords: [
      "演讲",
      "分享",
      "正式",
      "提前",
      "重点",
      "声音",
      "放松",
      "顺利",
      "内容",
      "准备",
    ],

    audioUrl: null,
    audioText:
      "公司安排我做一次简单的工作分享。虽然只有十分钟，但是我从来没有在这么多人面前正式讲话，所以提前一星期就开始准备。我先把内容写下来，然后做成几个简单的重点。每天晚上，我都会自己练习一次，有时候还会录下声音，看看哪些地方说得太快。真正开始演讲的时候，我还是很紧张。刚开始的几句话声音有一点小，但是看到同事们认真听，我慢慢放松下来。最后，我顺利讲完了所有内容。经理还说我准备得很清楚。这次经历让我发现，很多事情开始以前看起来很难，但是认真准备以后，往往没有想象中那么可怕。",
  },

  {
    id: "hsk4-reading-010",
    level: 4,
    order: 10,
    title: "旅行中的意外",
    pinyinTitle: "Lǚxíng zhōng de yìwài",
    myanmarTitle: "ခရီးထဲက မထင်မှတ်ထားတဲ့အဖြစ်",
    category: "travel",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "去年夏天，我和妹妹去海边旅行。我们已经提前订好了酒店，也安排好了每天要去的地方。",
      "可是到达的第二天，妹妹突然发烧了。原来的计划只能全部取消。我陪她去了附近的医院，医生说问题不严重，只需要休息两天。",
      "刚开始，我有一点失望，因为这次旅行准备了很久。但是后来我想，旅行最重要的不是完成所有计划，而是大家都平安。",
      "妹妹好一点以后，我们没有再安排很多活动，只是在海边走走、看看日落。没想到这种比较慢的旅行方式反而让我们觉得很舒服。",
    ],

    pinyinParagraphs: [
      "Qùnián xiàtiān, wǒ hé mèimei qù hǎibiān lǚxíng. Wǒmen yǐjīng tíqián dìng hǎo le jiǔdiàn, yě ānpái hǎo le měitiān yào qù de dìfang.",
      "Kěshì dàodá de dì èr tiān, mèimei tūrán fāshāo le. Yuánlái de jìhuà zhǐ néng quánbù qǔxiāo. Wǒ péi tā qù le fùjìn de yīyuàn, yīshēng shuō wèntí bù yánzhòng, zhǐ xūyào xiūxi liǎng tiān.",
      "Gāng kāishǐ, wǒ yǒu yìdiǎn shīwàng, yīnwèi zhè cì lǚxíng zhǔnbèi le hěn jiǔ. Dànshì hòulái wǒ xiǎng, lǚxíng zuì zhòngyào de bú shì wánchéng suǒyǒu jìhuà, ér shì dàjiā dōu píng'ān.",
      "Mèimei hǎo yìdiǎn yǐhòu, wǒmen méiyǒu zài ānpái hěn duō huódòng, zhǐshì zài hǎibiān zǒuzou, kànkan rìluò. Méi xiǎngdào zhè zhǒng bǐjiào màn de lǚxíng fāngshì fǎn'ér ràng wǒmen juéde hěn shūfu.",
    ],

    myanmarParagraphs: [
      "မနှစ်နွေရာသီမှာ ညီမနဲ့ပင်လယ်ကမ်းခြေသွားတယ်။ ဟိုတယ်ကြို booking လုပ်ပြီး နေ့တိုင်းဘယ်သွားမလဲပါစီစဉ်ထားတယ်။",
      "ဒါပေမယ့် ဒုတိယနေ့မှာ ညီမရုတ်တရက်ဖျားတယ်။ အစီအစဉ်အားလုံးဖျက်ပြီး အနီးကဆေးရုံသွားတယ်။ ဆရာဝန်က အရေးမကြီးဘဲ နှစ်ရက်လောက်အနားယူဖို့ပဲလိုတယ်လို့ပြောတယ်။",
      "အစမှာ ခရီးကိုကြာကြာပြင်ထားလို့ နည်းနည်းစိတ်ပျက်တယ်။ နောက်တော့ ခရီးမှာအရေးကြီးဆုံးက plan အကုန်ပြီးဖို့မဟုတ်ဘဲ အားလုံးဘေးကင်းဖို့ဆိုတာ သဘောပေါက်တယ်။",
      "ညီမသက်သာလာတော့ activity တွေအများကြီးမလုပ်ဘဲ ပင်လယ်ကမ်းနားလမ်းလျှောက်ပြီး နေဝင်ချိန်ကြည့်တယ်။ မထင်မှတ်ဘဲ ဒီလိုနှေးနှေးခရီးက ပိုသက်တောင့်သက်သာဖြစ်စေတယ်။",
    ],

    keywords: [
      "意外",
      "提前",
      "到达",
      "发烧",
      "取消",
      "失望",
      "平安",
      "活动",
      "日落",
      "方式",
    ],

    audioUrl: null,
    audioText:
      "去年夏天，我和妹妹去海边旅行。我们已经提前订好了酒店，也安排好了每天要去的地方。可是到达的第二天，妹妹突然发烧了。原来的计划只能全部取消。我陪她去了附近的医院，医生说问题不严重，只需要休息两天。刚开始，我有一点失望，因为这次旅行准备了很久。但是后来我想，旅行最重要的不是完成所有计划，而是大家都平安。妹妹好一点以后，我们没有再安排很多活动，只是在海边走走、看看日落。没想到这种比较慢的旅行方式反而让我们觉得很舒服。",
  },

  {
    id: "hsk4-reading-011",
    level: 4,
    order: 11,
    title: "如何安排周末",
    pinyinTitle: "Rúhé ānpái zhōumò",
    myanmarTitle: "ပိတ်ရက်ကို ဘယ်လိုစီစဉ်မလဲ",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "以前每到周末，我都想做很多事情。想学习、运动、打扫房间，也想和朋友出去。可是因为计划太多，最后常常什么都做不好。",
      "后来我开始把周末分成不同的时间。星期六上午做需要集中注意力的事情，下午出去买东西或者见朋友。星期天则尽量安排得轻松一点。",
      "我还学会了不把每一分钟都安排满。如果太累，我就允许自己休息，而不是因为没有完成计划就责怪自己。",
      "现在我的周末比以前更有规律，也更轻松。我发现真正好的安排，不是把时间全部填满，而是让重要的事情有时间完成，也让自己有时间恢复。",
    ],

    pinyinParagraphs: [
      "Yǐqián měi dào zhōumò, wǒ dōu xiǎng zuò hěn duō shìqing. Xiǎng xuéxí, yùndòng, dǎsǎo fángjiān, yě xiǎng hé péngyou chūqù. Kěshì yīnwèi jìhuà tài duō, zuìhòu chángcháng shénme dōu zuò bù hǎo.",
      "Hòulái wǒ kāishǐ bǎ zhōumò fēn chéng bùtóng de shíjiān. Xīngqīliù shàngwǔ zuò xūyào jízhōng zhùyìlì de shìqing, xiàwǔ chūqù mǎi dōngxi huòzhě jiàn péngyou. Xīngqītiān zé jǐnliàng ānpái de qīngsōng yìdiǎn.",
      "Wǒ hái xuéhuì le bù bǎ měi yì fēnzhōng dōu ānpái mǎn. Rúguǒ tài lèi, wǒ jiù yǔnxǔ zìjǐ xiūxi, ér bú shì yīnwèi méiyǒu wánchéng jìhuà jiù zéguài zìjǐ.",
      "Xiànzài wǒ de zhōumò bǐ yǐqián gèng yǒu guīlǜ, yě gèng qīngsōng. Wǒ fāxiàn zhēnzhèng hǎo de ānpái, bú shì bǎ shíjiān quánbù tián mǎn, ér shì ràng zhòngyào de shìqing yǒu shíjiān wánchéng, yě ràng zìjǐ yǒu shíjiān huīfù.",
    ],

    myanmarParagraphs: [
      "အရင်က ပိတ်ရက်တိုင်း လုပ်ချင်တာအများကြီးရှိတယ်။ စာလေ့လာချင်၊ လေ့ကျင့်ခန်းလုပ်ချင်၊ အခန်းရှင်းချင်သလို သူငယ်ချင်းတွေနဲ့လည်းထွက်ချင်တယ်။ Plan များလွန်းတော့ နောက်ဆုံး ဘာမှကောင်းကောင်းမပြီးဘူး။",
      "နောက်တော့ ပိတ်ရက်ကို အချိန်ပိုင်းခွဲစီမံတယ်။ စနေနေ့မနက်မှာ အာရုံစိုက်ရတဲ့အလုပ်လုပ်ပြီး ညနေပိုင်း ပစ္စည်းဝယ် ဒါမှမဟုတ် သူငယ်ချင်းတွေ့တယ်။ တနင်္ဂနွေကိုတော့ ပိုပေါ့ပေါ့ပါးပါးထားတယ်။",
      "မိနစ်တိုင်းကို plan အပြည့်မချတော့ဘူး။ ပင်ပန်းရင် ကိုယ်တိုင်အနားယူခွင့်ပေးတယ်။ Plan မပြီးလို့ ကိုယ့်ကိုယ်ကိုအပြစ်မတင်တော့ဘူး။",
      "အခု ပိတ်ရက်က ပိုစနစ်ကျပြီး ပိုအေးဆေးလာတယ်။ တကယ့်ကောင်းတဲ့အချိန်စီမံခြင်းဆိုတာ အချိန်အကုန်ဖြည့်ထားတာမဟုတ်ဘဲ အရေးကြီးတာတွေလုပ်ဖို့အချိန်နဲ့ ကိုယ့်အားပြန်ဖြည့်ဖို့အချိန် နှစ်ခုလုံးရှိတာပါ။",
    ],

    keywords: [
      "安排",
      "周末",
      "集中",
      "注意力",
      "允许",
      "责怪",
      "规律",
      "完成",
      "恢复",
      "轻松",
    ],

    audioUrl: null,
    audioText:
      "以前每到周末，我都想做很多事情。想学习、运动、打扫房间，也想和朋友出去。可是因为计划太多，最后常常什么都做不好。后来我开始把周末分成不同的时间。星期六上午做需要集中注意力的事情，下午出去买东西或者见朋友。星期天则尽量安排得轻松一点。我还学会了不把每一分钟都安排满。如果太累，我就允许自己休息，而不是因为没有完成计划就责怪自己。现在我的周末比以前更有规律，也更轻松。我发现真正好的安排，不是把时间全部填满，而是让重要的事情有时间完成，也让自己有时间恢复。",
  },

  {
    id: "hsk4-reading-012",
    level: 4,
    order: 12,
    title: "我开始运动以后",
    pinyinTitle: "Wǒ kāishǐ yùndòng yǐhòu",
    myanmarTitle: "လေ့ကျင့်ခန်းစလုပ်ပြီးနောက်",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "以前我很少运动。每天上班坐很久，下班以后又常常躺着看手机。虽然年纪不大，但是身体总觉得很累。",
      "朋友建议我从最简单的运动开始，不要一开始就给自己太大的压力。于是我每天晚上先走三十分钟。",
      "刚开始的一两个星期，我常常觉得累，有时候也很想放弃。但是慢慢地，我发现自己睡得更好了，白天工作的时候也更有精神。",
      "现在运动已经变成了我的习惯。我并没有每天做很难的运动，但是我学会了照顾身体。对我来说，健康不是突然得到的，而是每天一点一点积累起来的。",
    ],

    pinyinParagraphs: [
      "Yǐqián wǒ hěn shǎo yùndòng. Měitiān shàngbān zuò hěn jiǔ, xiàbān yǐhòu yòu chángcháng tǎngzhe kàn shǒujī. Suīrán niánjì bú dà, dànshì shēntǐ zǒng juéde hěn lèi.",
      "Péngyou jiànyì wǒ cóng zuì jiǎndān de yùndòng kāishǐ, búyào yì kāishǐ jiù gěi zìjǐ tài dà de yālì. Yúshì wǒ měitiān wǎnshang xiān zǒu sānshí fēnzhōng.",
      "Gāng kāishǐ de yì liǎng ge xīngqī, wǒ chángcháng juéde lèi, yǒu shíhou yě hěn xiǎng fàngqì. Dànshì mànmàn de, wǒ fāxiàn zìjǐ shuì de gèng hǎo le, báitiān gōngzuò de shíhou yě gèng yǒu jīngshén.",
      "Xiànzài yùndòng yǐjīng biàn chéng le wǒ de xíguàn. Wǒ bìng méiyǒu měitiān zuò hěn nán de yùndòng, dànshì wǒ xuéhuì le zhàogù shēntǐ. Duì wǒ láishuō, jiànkāng bú shì tūrán dédào de, ér shì měitiān yìdiǎn yìdiǎn jīlěi qǐlái de.",
    ],

    myanmarParagraphs: [
      "အရင်က လေ့ကျင့်ခန်းသိပ်မလုပ်ဘူး။ နေ့တိုင်းအလုပ်မှာကြာကြာထိုင်ပြီး အလုပ်ဆင်းရင် ဖုန်းကြည့်ရင်းလှဲနေတတ်တယ်။ အသက်မကြီးသေးပေမယ့် ကိုယ်လက်အမြဲပင်ပန်းတယ်။",
      "သူငယ်ချင်းက အရင်လွယ်တာကစပြီး ကိုယ့်ကိုဖိအားမများစေဖို့ပြောတယ်။ ဒါကြောင့် ညတိုင်း မိနစ် ၃၀ လမ်းလျှောက်တာကစတယ်။",
      "အစပိုင်းတစ်ပတ်နှစ်ပတ် ပင်ပန်းပြီး လက်လွှတ်ချင်တဲ့အချိန်တွေလည်းရှိတယ်။ ဒါပေမယ့် တဖြည်းဖြည်းအိပ်ရေးပိုကောင်းလာပြီး နေ့ခင်းအလုပ်ချိန်မှာလည်း အားပိုရှိလာတယ်။",
      "အခု exercise က အလေ့အကျင့်ဖြစ်နေပြီ။ ခက်တဲ့ workout တွေမလုပ်ပေမယ့် ကိုယ့်ကျန်းမာရေးကိုစောင့်ရှောက်တတ်လာတယ်။ ကျန်းမာရေးက ချက်ချင်းရတာမဟုတ်ဘဲ နေ့တိုင်းနည်းနည်းစီစုဆောင်းတာလို့ ထင်တယ်။",
    ],

    keywords: [
      "运动",
      "压力",
      "放弃",
      "精神",
      "习惯",
      "照顾",
      "健康",
      "积累",
      "身体",
      "建议",
    ],

    audioUrl: null,
    audioText:
      "以前我很少运动。每天上班坐很久，下班以后又常常躺着看手机。虽然年纪不大，但是身体总觉得很累。朋友建议我从最简单的运动开始，不要一开始就给自己太大的压力。于是我每天晚上先走三十分钟。刚开始的一两个星期，我常常觉得累，有时候也很想放弃。但是慢慢地，我发现自己睡得更好了，白天工作的时候也更有精神。现在运动已经变成了我的习惯。我并没有每天做很难的运动，但是我学会了照顾身体。对我来说，健康不是突然得到的，而是每天一点一点积累起来的。",
  },

  {
    id: "hsk4-reading-013",
    level: 4,
    order: 13,
    title: "第一次参加会议",
    pinyinTitle: "Dì yī cì cānjiā huìyì",
    myanmarTitle: "ပထမဆုံး အစည်းအဝေးတက်ခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "刚到新公司的第二个星期，经理让我参加一个重要会议。因为这是我第一次参加这样的会议，我提前准备了笔记本，也看了相关的资料。",
      "会议开始以后，大家讨论了一个新项目。开始的时候，我只是认真听，没有说太多。后来经理突然问我对其中一个问题有什么看法。",
      "我有一点紧张，但是还是把自己的想法说了出来。没想到几个同事都觉得这个建议不错，还继续讨论了我的意见。",
      "会议结束以后，我觉得很有成就感。我发现参加会议并不是一定要说很多，而是在需要的时候，能够清楚地表达自己的意见。",
    ],

    pinyinParagraphs: [
      "Gāng dào xīn gōngsī de dì èr ge xīngqī, jīnglǐ ràng wǒ cānjiā yí ge zhòngyào huìyì. Yīnwèi zhè shì wǒ dì yī cì cānjiā zhèyàng de huìyì, wǒ tíqián zhǔnbèi le bǐjìběn, yě kàn le xiāngguān de zīliào.",
      "Huìyì kāishǐ yǐhòu, dàjiā tǎolùn le yí ge xīn xiàngmù. Kāishǐ de shíhou, wǒ zhǐshì rènzhēn tīng, méiyǒu shuō tài duō. Hòulái jīnglǐ tūrán wèn wǒ duì qízhōng yí ge wèntí yǒu shénme kànfǎ.",
      "Wǒ yǒu yìdiǎn jǐnzhāng, dànshì háishi bǎ zìjǐ de xiǎngfǎ shuō le chūlái. Méi xiǎngdào jǐ ge tóngshì dōu juéde zhège jiànyì búcuò, hái jìxù tǎolùn le wǒ de yìjiàn.",
      "Huìyì jiéshù yǐhòu, wǒ juéde hěn yǒu chéngjiùgǎn. Wǒ fāxiàn cānjiā huìyì bìng bú shì yídìng yào shuō hěn duō, ér shì zài xūyào de shíhou, nénggòu qīngchu de biǎodá zìjǐ de yìjiàn.",
    ],

    myanmarParagraphs: [
      "ကုမ္ပဏီအသစ်ဝင်ပြီး ဒုတိယအပတ်မှာ manager က အရေးကြီး meeting တစ်ခုတက်ခိုင်းတယ်။ ဒီလို meeting ကို ပထမဆုံးတက်တာမို့ notebook ပြင်ပြီး သက်ဆိုင်ရာစာရွက်စာတမ်းတွေကို ကြိုဖတ်ထားတယ်။",
      "Meeting စတော့ project အသစ်အကြောင်းဆွေးနွေးကြတယ်။ အစမှာ ကျွန်မက နားထောင်ပဲနားထောင်ပြီး သိပ်မပြောဘူး။ နောက်တော့ manager က ပြဿနာတစ်ခုအပေါ် ကိုယ့်အမြင်မေးတယ်။",
      "နည်းနည်းစိတ်လှုပ်ရှားပေမယ့် ကိုယ့်အတွေးကိုပြောလိုက်တယ်။ မထင်မှတ်ဘဲ လုပ်ဖော်ကိုင်ဖက်တချို့က အကြံကောင်းတယ်လို့ပြောပြီး ဆက်ဆွေးနွေးကြတယ်။",
      "Meeting ပြီးတော့ ကိုယ့်အတွက် အောင်မြင်မှုတစ်ခုလိုခံစားရတယ်။ Meeting မှာ အများကြီးပြောဖို့မလိုဘဲ လိုတဲ့အချိန်မှာ ကိုယ့်အမြင်ကိုရှင်းရှင်းပြောနိုင်ဖို့က အရေးကြီးတယ်လို့ သိလာတယ်။",
    ],

    keywords: [
      "会议",
      "资料",
      "项目",
      "讨论",
      "看法",
      "建议",
      "意见",
      "表达",
      "成就感",
      "清楚",
    ],

    audioUrl: null,
    audioText:
      "刚到新公司的第二个星期，经理让我参加一个重要会议。因为这是我第一次参加这样的会议，我提前准备了笔记本，也看了相关的资料。会议开始以后，大家讨论了一个新项目。开始的时候，我只是认真听，没有说太多。后来经理突然问我对其中一个问题有什么看法。我有一点紧张，但是还是把自己的想法说了出来。没想到几个同事都觉得这个建议不错，还继续讨论了我的意见。会议结束以后，我觉得很有成就感。我发现参加会议并不是一定要说很多，而是在需要的时候，能够清楚地表达自己的意见。",
  },

  {
    id: "hsk4-reading-014",
    level: 4,
    order: 14,
    title: "网上学习的好处",
    pinyinTitle: "Wǎngshàng xuéxí de hǎochu",
    myanmarTitle: "Online learning ရဲ့ အကျိုးကျေးဇူး",
    category: "school",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "这几年，网上学习变得越来越普遍。以前想学一门课程，常常要去学校或者培训中心，现在只要有电脑和网络，在家也可以学习。",
      "我自己也常常使用网上课程。最大的好处是时间比较自由。工作忙的时候，我可以晚上学习；周末有时间的时候，也可以多学一点。",
      "当然，网上学习也有缺点。如果没有人提醒，很容易因为累或者想玩手机就停止学习。所以我觉得网上学习更需要自己安排时间。",
      "对我来说，网上学习不是完全代替老师，而是给学习者更多选择。只要能找到适合自己的方法，它可以让学习变得更方便。",
    ],

    pinyinParagraphs: [
      "Zhè jǐ nián, wǎngshàng xuéxí biàn de yuèláiyuè pǔbiàn. Yǐqián xiǎng xué yì mén kèchéng, chángcháng yào qù xuéxiào huòzhě péixùn zhōngxīn, xiànzài zhǐyào yǒu diànnǎo hé wǎngluò, zài jiā yě kěyǐ xuéxí.",
      "Wǒ zìjǐ yě chángcháng shǐyòng wǎngshàng kèchéng. Zuì dà de hǎochu shì shíjiān bǐjiào zìyóu. Gōngzuò máng de shíhou, wǒ kěyǐ wǎnshang xuéxí; zhōumò yǒu shíjiān de shíhou, yě kěyǐ duō xué yìdiǎn.",
      "Dāngrán, wǎngshàng xuéxí yě yǒu quēdiǎn. Rúguǒ méiyǒu rén tíxǐng, hěn róngyì yīnwèi lèi huòzhě xiǎng wán shǒujī jiù tíngzhǐ xuéxí. Suǒyǐ wǒ juéde wǎngshàng xuéxí gèng xūyào zìjǐ ānpái shíjiān.",
      "Duì wǒ láishuō, wǎngshàng xuéxí bú shì wánquán dàitì lǎoshī, ér shì gěi xuéxízhě gèng duō xuǎnzé. Zhǐyào néng zhǎodào shìhé zìjǐ de fāngfǎ, tā kěyǐ ràng xuéxí biàn de gèng fāngbiàn.",
    ],

    myanmarParagraphs: [
      "ဒီနှစ်ပိုင်း online learning က ပိုများလာတယ်။ အရင်က course သင်ချင်ရင် ကျောင်း ဒါမှမဟုတ် training center သွားရပေမယ့် အခု computer နဲ့ internet ရှိရင် အိမ်ကနေလေ့လာလို့ရတယ်။",
      "ကျွန်မလည်း online course တွေမကြာခဏသုံးတယ်။ အကြီးဆုံးအကျိုးကျေးဇူးက အချိန်ပိုလွတ်လပ်တာပါ။ အလုပ်များရင် ညမှာလေ့လာပြီး ပိတ်ရက်မှာ အချိန်ရှိရင် ပိုလေ့လာလို့ရတယ်။",
      "ဒါပေမယ့် အားနည်းချက်လည်းရှိတယ်။ သတိပေးမယ့်သူမရှိရင် ပင်ပန်းလို့ ဒါမှမဟုတ် ဖုန်းကြည့်ချင်လို့ စာရပ်သွားလွယ်တယ်။ ဒါကြောင့် online learning က ကိုယ့်အချိန်ကိုယ်စီမံဖို့ ပိုလိုတယ်။",
      "ကျွန်မအတွက် online learning က ဆရာကိုအပြည့်အဝအစားထိုးတာမဟုတ်ဘဲ လေ့လာသူကို ရွေးချယ်စရာပိုပေးတာပါ။ ကိုယ့်နဲ့ကိုက်တဲ့နည်းရှာနိုင်ရင် စာလေ့လာရတာ အများကြီးအဆင်ပြေစေတယ်။",
    ],

    keywords: [
      "网上",
      "普遍",
      "课程",
      "培训",
      "自由",
      "缺点",
      "停止",
      "代替",
      "选择",
      "方便",
    ],

    audioUrl: null,
    audioText:
      "这几年，网上学习变得越来越普遍。以前想学一门课程，常常要去学校或者培训中心，现在只要有电脑和网络，在家也可以学习。我自己也常常使用网上课程。最大的好处是时间比较自由。工作忙的时候，我可以晚上学习；周末有时间的时候，也可以多学一点。当然，网上学习也有缺点。如果没有人提醒，很容易因为累或者想玩手机就停止学习。所以我觉得网上学习更需要自己安排时间。对我来说，网上学习不是完全代替老师，而是给学习者更多选择。只要能找到适合自己的方法，它可以让学习变得更方便。",
  },

  {
    id: "hsk4-reading-015",
    level: 4,
    order: 15,
    title: "朋友之间的信任",
    pinyinTitle: "Péngyou zhījiān de xìnrèn",
    myanmarTitle: "သူငယ်ချင်းကြား ယုံကြည်မှု",
    category: "friends",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "我觉得朋友之间最重要的东西之一就是信任。没有信任，即使每天见面，也很难成为真正的朋友。",
      "以前我有一次因为听到别人说了一些话，就误会了一个很好的朋友。我没有先问她，而是自己生气了好几天。",
      "后来她发现我不太对，就主动问我发生了什么。我们把事情说清楚以后，我才知道原来的消息并不完整。",
      "从那以后，我学会了遇到问题时先和朋友沟通。真正的信任并不是永远不会产生误会，而是有误会以后，双方愿意把事情说清楚。",
    ],

    pinyinParagraphs: [
      "Wǒ juéde péngyou zhījiān zuì zhòngyào de dōngxi zhī yī jiù shì xìnrèn. Méiyǒu xìnrèn, jíshǐ měitiān jiànmiàn, yě hěn nán chéngwéi zhēnzhèng de péngyou.",
      "Yǐqián wǒ yǒu yí cì yīnwèi tīngdào biérén shuō le yìxiē huà, jiù wùhuì le yí ge hěn hǎo de péngyou. Wǒ méiyǒu xiān wèn tā, ér shì zìjǐ shēngqì le hǎo jǐ tiān.",
      "Hòulái tā fāxiàn wǒ bú tài duì, jiù zhǔdòng wèn wǒ fāshēng le shénme. Wǒmen bǎ shìqing shuō qīngchu yǐhòu, wǒ cái zhīdào yuánlái de xiāoxi bìng bù wánzhěng.",
      "Cóng nà yǐhòu, wǒ xuéhuì le yùdào wèntí shí xiān hé péngyou gōutōng. Zhēnzhèng de xìnrèn bìng bú shì yǒngyuǎn bú huì chǎnshēng wùhuì, ér shì yǒu wùhuì yǐhòu, shuāngfāng yuànyì bǎ shìqing shuō qīngchu.",
    ],

    myanmarParagraphs: [
      "သူငယ်ချင်းကြားမှာ အရေးကြီးဆုံးအရာတွေထဲက တစ်ခုက ယုံကြည်မှုလို့ထင်တယ်။ ယုံကြည်မှုမရှိရင် နေ့တိုင်းတွေ့နေရင်တောင် တကယ့်သူငယ်ချင်းဖြစ်ဖို့ခက်တယ်။",
      "အရင်က တစ်ခါ တခြားသူပြောတာနားထောင်ပြီး သူငယ်ချင်းကောင်းတစ်ယောက်ကို နားလည်မှုလွဲခဲ့တယ်။ သူ့ကိုမမေးဘဲ ကိုယ့်ဘာသာ ရက်အနည်းငယ်စိတ်ဆိုးနေတယ်။",
      "နောက်တော့ သူက ကျွန်မမတူတာသတိထားပြီး ဘာဖြစ်လဲလာမေးတယ်။ အကုန်ရှင်းပြပြီးမှ အရင်ကြားခဲ့တဲ့အချက်အလက်က မပြည့်စုံဘူးဆိုတာသိရတယ်။",
      "အဲဒီနောက် ပြဿနာရှိရင် အရင်ဆွေးနွေးဖို့သင်ယူလာတယ်။ တကယ့်ယုံကြည်မှုဆိုတာ ဘယ်တော့မှ misunderstand မဖြစ်တာမဟုတ်ဘဲ ဖြစ်လာရင် နှစ်ဖက်လုံးရှင်းပြဖို့ဆန္ဒရှိတာပါ။",
    ],

    keywords: [
      "信任",
      "误会",
      "主动",
      "完整",
      "沟通",
      "双方",
      "真正",
      "产生",
      "愿意",
      "清楚",
    ],

    audioUrl: null,
    audioText:
      "我觉得朋友之间最重要的东西之一就是信任。没有信任，即使每天见面，也很难成为真正的朋友。以前我有一次因为听到别人说了一些话，就误会了一个很好的朋友。我没有先问她，而是自己生气了好几天。后来她发现我不太对，就主动问我发生了什么。我们把事情说清楚以后，我才知道原来的消息并不完整。从那以后，我学会了遇到问题时先和朋友沟通。真正的信任并不是永远不会产生误会，而是有误会以后，双方愿意把事情说清楚。",
  },

  {
    id: "hsk4-reading-016",
    level: 4,
    order: 16,
    title: "一次特别的礼物",
    pinyinTitle: "Yí cì tèbié de lǐwù",
    myanmarTitle: "ထူးခြားတဲ့ လက်ဆောင်",
    category: "friends",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "去年生日的时候，我收到了一份很特别的礼物。它并不贵，也不是商店里买来的东西。",
      "一个认识了很多年的朋友送给我一本小册子。里面放了我们以前一起拍的照片，还有她写下的很多回忆。",
      "我一页一页看下去，想起了很多已经忘记的小事情。有些照片拍得并不好看，但是每一张都有一个故事。",
      "那份礼物让我明白，一份礼物的价值不一定和价格有关。真正让人感动的，是送礼物的人花了多少心思。",
    ],

    pinyinParagraphs: [
      "Qùnián shēngrì de shíhou, wǒ shōudào le yí fèn hěn tèbié de lǐwù. Tā bìng bú guì, yě bú shì shāngdiàn lǐ mǎi lái de dōngxi.",
      "Yí ge rènshi le hěn duō nián de péngyou sòng gěi wǒ yì běn xiǎo cèzi. Lǐmiàn fàng le wǒmen yǐqián yìqǐ pāi de zhàopiàn, hái yǒu tā xiě xià de hěn duō huíyì.",
      "Wǒ yí yè yí yè kàn xiàqù, xiǎng qǐ le hěn duō yǐjīng wàngjì de xiǎo shìqing. Yǒuxiē zhàopiàn pāi de bìng bù hǎokàn, dànshì měi yì zhāng dōu yǒu yí ge gùshi.",
      "Nà fèn lǐwù ràng wǒ míngbai, yí fèn lǐwù de jiàzhí bù yídìng hé jiàgé yǒuguān. Zhēnzhèng ràng rén gǎndòng de, shì sòng lǐwù de rén huā le duōshao xīnsī.",
    ],

    myanmarParagraphs: [
      "မနှစ်မွေးနေ့မှာ ထူးခြားတဲ့လက်ဆောင်တစ်ခုရတယ်။ ဈေးမကြီးဘဲ ဆိုင်ကဝယ်လာတာလည်းမဟုတ်ဘူး။",
      "နှစ်တွေအများကြီးရင်းနှီးတဲ့သူငယ်ချင်းက စာအုပ်သေးသေးတစ်အုပ်ပေးတယ်။ အထဲမှာ အတူရိုက်ထားတဲ့ဓာတ်ပုံဟောင်းတွေနဲ့ သူရေးထားတဲ့အမှတ်တရတွေရှိတယ်။",
      "စာမျက်နှာတစ်ရွက်ချင်းကြည့်ရင်း မေ့နေတဲ့အရာသေးသေးလေးတွေကို ပြန်သတိရတယ်။ ဓာတ်ပုံတချို့မလှပေမယ့် တစ်ပုံချင်းမှာဇာတ်လမ်းတစ်ခုရှိတယ်။",
      "ဒီလက်ဆောင်က လက်ဆောင်တန်ဖိုးဟာ ဈေးနှုန်းနဲ့ အမြဲမဆိုင်ဘူးလို့ သင်ပေးတယ်။ တကယ်စိတ်ထိခိုက်စေတဲ့အရာက ပေးသူက ဘယ်လောက်စိတ်ထားပြီးပြင်ထားလဲဆိုတာပါ။",
    ],

    keywords: [
      "特别",
      "礼物",
      "册子",
      "回忆",
      "价值",
      "价格",
      "感动",
      "心思",
      "收到",
      "故事",
    ],

    audioUrl: null,
    audioText:
      "去年生日的时候，我收到了一份很特别的礼物。它并不贵，也不是商店里买来的东西。一个认识了很多年的朋友送给我一本小册子。里面放了我们以前一起拍的照片，还有她写下的很多回忆。我一页一页看下去，想起了很多已经忘记的小事情。有些照片拍得并不好看，但是每一张都有一个故事。那份礼物让我明白，一份礼物的价值不一定和价格有关。真正让人感动的，是送礼物的人花了多少心思。",
  },

  {
    id: "hsk4-reading-017",
    level: 4,
    order: 17,
    title: "城市生活和乡村生活",
    pinyinTitle: "Chéngshì shēnghuó hé xiāngcūn shēnghuó",
    myanmarTitle: "မြို့ဘဝနဲ့ ကျေးလက်ဘဝ",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "我小时候住在乡村，大学毕业以后才搬到大城市工作。所以我对城市生活和乡村生活都有比较深的感受。",
      "城市最大的优点是方便。交通、医院、商场和工作机会都比较多。但是城市生活节奏很快，人也常常觉得压力大。",
      "乡村虽然没有那么方便，但是环境安静，人与人之间的关系也比较近。小时候我常常在外面玩，认识附近几乎所有的人。",
      "现在让我选择，我可能还是会因为工作住在城市，但是我希望以后有机会常常回乡村。对我来说，两种生活没有绝对的好坏，只是适合不同的阶段。",
    ],

    pinyinParagraphs: [
      "Wǒ xiǎoshíhou zhù zài xiāngcūn, dàxué bìyè yǐhòu cái bān dào dà chéngshì gōngzuò. Suǒyǐ wǒ duì chéngshì shēnghuó hé xiāngcūn shēnghuó dōu yǒu bǐjiào shēn de gǎnshòu.",
      "Chéngshì zuì dà de yōudiǎn shì fāngbiàn. Jiāotōng, yīyuàn, shāngchǎng hé gōngzuò jīhuì dōu bǐjiào duō. Dànshì chéngshì shēnghuó jiézòu hěn kuài, rén yě chángcháng juéde yālì dà.",
      "Xiāngcūn suīrán méiyǒu nàme fāngbiàn, dànshì huánjìng ānjìng, rén yǔ rén zhījiān de guānxì yě bǐjiào jìn. Xiǎoshíhou wǒ chángcháng zài wàimiàn wán, rènshi fùjìn jīhū suǒyǒu de rén.",
      "Xiànzài ràng wǒ xuǎnzé, wǒ kěnéng háishi huì yīnwèi gōngzuò zhù zài chéngshì, dànshì wǒ xīwàng yǐhòu yǒu jīhuì chángcháng huí xiāngcūn. Duì wǒ láishuō, liǎng zhǒng shēnghuó méiyǒu juéduì de hǎohuài, zhǐshì shìhé bùtóng de jiēduàn.",
    ],

    myanmarParagraphs: [
      "ငယ်ငယ်က ကျေးလက်မှာနေပြီး တက္ကသိုလ်ပြီးမှ မြို့ကြီးကိုအလုပ်လာလုပ်တယ်။ ဒါကြောင့် မြို့ဘဝနဲ့ကျေးလက်ဘဝနှစ်ခုလုံးကို ကောင်းကောင်းသိတယ်။",
      "မြို့ရဲ့အကြီးဆုံးအားသာချက်က အဆင်ပြေတာပါ။ သယ်ယူပို့ဆောင်ရေး၊ ဆေးရုံ၊ shopping mall နဲ့ အလုပ်အခွင့်အရေးများတယ်။ ဒါပေမယ့် ဘဝအရှိန်မြန်ပြီး ဖိအားလည်းများတယ်။",
      "ကျေးလက်က အဆင်ပြေမှုနည်းပေမယ့် တိတ်ဆိတ်ပြီး လူတွေရင်းနှီးတယ်။ ငယ်ငယ်တုန်းက အပြင်ကစားပြီး အနီးကလူအားလုံးနီးပါးကို သိတယ်။",
      "အခုရွေးရမယ်ဆို အလုပ်ကြောင့် မြို့မှာပဲနေမယ်ထင်ပေမယ့် နောက်ပိုင်း ကျေးလက်ကို မကြာခဏပြန်ချင်တယ်။ နှစ်ခုလုံးမှာ လုံးဝကောင်း/မကောင်းဆိုတာမရှိဘဲ ဘဝအဆင့်မတူတဲ့အချိန်မှာ သင့်တော်တာမတူတာပါ။",
    ],

    keywords: [
      "城市",
      "乡村",
      "优点",
      "节奏",
      "压力",
      "关系",
      "环境",
      "机会",
      "绝对",
      "阶段",
    ],

    audioUrl: null,
    audioText:
      "我小时候住在乡村，大学毕业以后才搬到大城市工作。所以我对城市生活和乡村生活都有比较深的感受。城市最大的优点是方便。交通、医院、商场和工作机会都比较多。但是城市生活节奏很快，人也常常觉得压力大。乡村虽然没有那么方便，但是环境安静，人与人之间的关系也比较近。小时候我常常在外面玩，认识附近几乎所有的人。现在让我选择，我可能还是会因为工作住在城市，但是我希望以后有机会常常回乡村。对我来说，两种生活没有绝对的好坏，只是适合不同的阶段。",
  },

  {
    id: "hsk4-reading-018",
    level: 4,
    order: 18,
    title: "我学会了拒绝",
    pinyinTitle: "Wǒ xuéhuì le jùjué",
    myanmarTitle: "ငြင်းဆိုတတ်လာခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "以前别人请我帮忙的时候，我很难说“不”。即使自己没有时间，我也常常答应，因为怕别人觉得我不友好。",
      "可是这样时间长了以后，我发现自己的事情总是做不完，也常常因为太累而心情不好。",
      "后来一个朋友告诉我，拒绝别人并不等于不关心别人。真正重要的是诚实地说明自己的情况。",
      "现在如果我真的没有时间，我会直接但礼貌地说出来。有时候对方完全可以理解。我也慢慢明白，照顾自己的时间和精力并不是自私。",
    ],

    pinyinParagraphs: [
      "Yǐqián biérén qǐng wǒ bāngmáng de shíhou, wǒ hěn nán shuō 'bù'. Jíshǐ zìjǐ méiyǒu shíjiān, wǒ yě chángcháng dāying, yīnwèi pà biérén juéde wǒ bù yǒuhǎo.",
      "Kěshì zhèyàng shíjiān cháng le yǐhòu, wǒ fāxiàn zìjǐ de shìqing zǒng shì zuò bù wán, yě chángcháng yīnwèi tài lèi ér xīnqíng bù hǎo.",
      "Hòulái yí ge péngyou gàosu wǒ, jùjué biérén bìng bù děngyú bù guānxīn biérén. Zhēnzhèng zhòngyào de shì chéngshí de shuōmíng zìjǐ de qíngkuàng.",
      "Xiànzài rúguǒ wǒ zhēnde méiyǒu shíjiān, wǒ huì zhíjiē dàn lǐmào de shuō chūlái. Yǒu shíhou duìfāng wánquán kěyǐ lǐjiě. Wǒ yě mànmàn míngbai, zhàogù zìjǐ de shíjiān hé jīnglì bìng bú shì zìsī.",
    ],

    myanmarParagraphs: [
      "အရင်က တစ်ယောက်ယောက်က အကူအညီတောင်းရင် “မရဘူး” လို့ပြောဖို့ခက်တယ်။ ကိုယ့်မှာအချိန်မရှိရင်တောင် လက်ခံတတ်တယ်။ မကူညီရင် မဖော်ရွေဘူးထင်မှာစိုးလို့ပါ။",
      "ဒါပေမယ့် ဒီလိုကြာလာတော့ ကိုယ့်အလုပ်တွေမပြီးဘဲ ပင်ပန်းလွန်းလို့ စိတ်မကောင်းလည်းဖြစ်တယ်။",
      "နောက်တော့ သူငယ်ချင်းတစ်ယောက်က ငြင်းတာဟာ လူတစ်ယောက်ကို ဂရုမစိုက်တာမဟုတ်ဘူးလို့ပြောတယ်။ ကိုယ့်အခြေအနေကို ရိုးရိုးသားသားရှင်းပြတာက ပိုအရေးကြီးတယ်။",
      "အခု တကယ်အချိန်မရှိရင် တိုက်ရိုက်ပေမယ့် ယဉ်ယဉ်ကျေးကျေးပြောတတ်လာတယ်။ အများအားဖြင့် တစ်ဖက်ကလည်း နားလည်တယ်။ ကိုယ့်အချိန်နဲ့အားကို ကာကွယ်တာက selfish ဖြစ်တာမဟုတ်ဘူးလို့လည်း သိလာတယ်။",
    ],

    keywords: [
      "拒绝",
      "答应",
      "友好",
      "关心",
      "诚实",
      "情况",
      "礼貌",
      "理解",
      "精力",
      "自私",
    ],

    audioUrl: null,
    audioText:
      "以前别人请我帮忙的时候，我很难说不。即使自己没有时间，我也常常答应，因为怕别人觉得我不友好。可是这样时间长了以后，我发现自己的事情总是做不完，也常常因为太累而心情不好。后来一个朋友告诉我，拒绝别人并不等于不关心别人。真正重要的是诚实地说明自己的情况。现在如果我真的没有时间，我会直接但礼貌地说出来。有时候对方完全可以理解。我也慢慢明白，照顾自己的时间和精力并不是自私。",
  },

  {
    id: "hsk4-reading-019",
    level: 4,
    order: 19,
    title: "一个改变我的老师",
    pinyinTitle: "Yí ge gǎibiàn wǒ de lǎoshī",
    myanmarTitle: "ကျွန်မကိုပြောင်းလဲစေခဲ့တဲ့ဆရာ",
    category: "school",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "高中时候，我遇到过一位对我影响很大的老师。那时候我的成绩并不是很好，也常常觉得自己不够聪明。",
      "有一次考试以后，我因为成绩不好很失望。老师没有批评我，而是问我平时怎么学习。听完以后，他告诉我，我的问题不是不努力，而是方法不合适。",
      "他建议我把大的学习目标分成小目标，每天完成一点。后来我按照这个方法学习，成绩真的慢慢提高了。",
      "更重要的是，我开始相信能力不是完全固定的。只要找到合适的方法并坚持，人是可以进步的。直到现在，我遇到困难的时候还会想起那位老师的话。",
    ],

    pinyinParagraphs: [
      "Gāozhōng shíhou, wǒ yùdào guo yí wèi duì wǒ yǐngxiǎng hěn dà de lǎoshī. Nà shíhou wǒ de chéngjì bìng bú shì hěn hǎo, yě chángcháng juéde zìjǐ bú gòu cōngming.",
      "Yǒu yí cì kǎoshì yǐhòu, wǒ yīnwèi chéngjì bù hǎo hěn shīwàng. Lǎoshī méiyǒu pīpíng wǒ, ér shì wèn wǒ píngshí zěnme xuéxí. Tīng wán yǐhòu, tā gàosu wǒ, wǒ de wèntí bú shì bù nǔlì, ér shì fāngfǎ bù héshì.",
      "Tā jiànyì wǒ bǎ dà de xuéxí mùbiāo fēn chéng xiǎo mùbiāo, měitiān wánchéng yìdiǎn. Hòulái wǒ ànzhào zhège fāngfǎ xuéxí, chéngjì zhēnde mànmàn tígāo le.",
      "Gèng zhòngyào de shì, wǒ kāishǐ xiāngxìn nénglì bú shì wánquán gùdìng de. Zhǐyào zhǎodào héshì de fāngfǎ bìng jiānchí, rén shì kěyǐ jìnbù de. Zhídào xiànzài, wǒ yùdào kùnnan de shíhou hái huì xiǎng qǐ nà wèi lǎoshī de huà.",
    ],

    myanmarParagraphs: [
      "အထက်တန်းတုန်းက ကျွန်မဘဝအပေါ် သက်ရောက်မှုကြီးတဲ့ဆရာတစ်ယောက်တွေ့ဖူးတယ်။ အဲဒီအချိန် အမှတ်မကောင်းဘဲ ကိုယ့်ကိုယ်ကိုလည်း သိပ်မတော်ဘူးလို့ထင်တတ်တယ်။",
      "စာမေးပွဲတစ်ခါပြီးတော့ အမှတ်မကောင်းလို့ အရမ်းစိတ်ပျက်တယ်။ ဆရာက မဆူဘဲ ပုံမှန်ဘယ်လိုလေ့လာလဲမေးတယ်။ နားထောင်ပြီး ကျွန်မမကြိုးစားတာမဟုတ်ဘဲ လေ့လာနည်းမသင့်တော်တာလို့ပြောတယ်။",
      "ကြီးတဲ့ပန်းတိုင်ကို အသေးလေးတွေခွဲပြီး နေ့တိုင်းနည်းနည်းလုပ်ဖို့ အကြံပေးတယ်။ အဲဒီအတိုင်းလုပ်တော့ အမှတ်တဖြည်းဖြည်းကောင်းလာတယ်။",
      "ပိုအရေးကြီးတာက စွမ်းရည်ဆိုတာ အမြဲတမ်းမပြောင်းလဲတဲ့အရာမဟုတ်ဘူးလို့ ယုံကြည်လာတယ်။ မှန်တဲ့နည်းရှာပြီး ဆက်လုပ်ရင် တိုးတက်နိုင်တယ်။ အခုလည်း အခက်အခဲကြုံတိုင်း ဆရာပြောခဲ့တာကို သတိရတယ်။",
    ],

    keywords: [
      "影响",
      "成绩",
      "聪明",
      "努力",
      "目标",
      "提高",
      "能力",
      "固定",
      "相信",
      "困难",
    ],

    audioUrl: null,
    audioText:
      "高中时候，我遇到过一位对我影响很大的老师。那时候我的成绩并不是很好，也常常觉得自己不够聪明。有一次考试以后，我因为成绩不好很失望。老师没有批评我，而是问我平时怎么学习。听完以后，他告诉我，我的问题不是不努力，而是方法不合适。他建议我把大的学习目标分成小目标，每天完成一点。后来我按照这个方法学习，成绩真的慢慢提高了。更重要的是，我开始相信能力不是完全固定的。只要找到合适的方法并坚持，人是可以进步的。直到现在，我遇到困难的时候还会想起那位老师的话。",
  },

  {
    id: "hsk4-reading-020",
    level: 4,
    order: 20,
    title: "第一次解决大问题",
    pinyinTitle: "Dì yī cì jiějué dà wèntí",
    myanmarTitle: "ပထမဆုံး ပြဿနာကြီးဖြေရှင်းခြင်း",
    category: "daily-life",
    difficulty: "medium",
    estimatedMinutes: 5,

    paragraphs: [
      "工作第二年的时候，我第一次自己负责一个比较重要的任务。原来的负责人突然请假，所以经理让我暂时接手。",
      "开始的两天，我非常紧张，因为很多事情以前只是看别人做，自己并没有真正处理过。后来我把所有问题写下来，一个一个解决。",
      "遇到不会的地方，我主动问同事，也和客户确认重要的信息。虽然中间出现了几次小问题，但是最后任务还是按时完成了。",
      "经理后来告诉我，他其实也知道这个任务对我来说不容易，但想给我一个机会。那次经历以后，我对自己的能力有了更多信心。我发现很多时候，我们只有真正开始做，才会知道自己能做到多少。",
    ],

    pinyinParagraphs: [
      "Gōngzuò dì èr nián de shíhou, wǒ dì yī cì zìjǐ fùzé yí ge bǐjiào zhòngyào de rènwu. Yuánlái de fùzérén tūrán qǐngjià, suǒyǐ jīnglǐ ràng wǒ zànshí jiēshǒu.",
      "Kāishǐ de liǎng tiān, wǒ fēicháng jǐnzhāng, yīnwèi hěn duō shìqing yǐqián zhǐshì kàn biérén zuò, zìjǐ bìng méiyǒu zhēnzhèng chǔlǐ guo. Hòulái wǒ bǎ suǒyǒu wèntí xiě xiàlái, yí ge yí ge jiějué.",
      "Yùdào bú huì de dìfang, wǒ zhǔdòng wèn tóngshì, yě hé kèhù quèrèn zhòngyào de xìnxī. Suīrán zhōngjiān chūxiàn le jǐ cì xiǎo wèntí, dànshì zuìhòu rènwu háishi ànshí wánchéng le.",
      "Jīnglǐ hòulái gàosu wǒ, tā qíshí yě zhīdào zhège rènwu duì wǒ láishuō bù róngyì, dàn xiǎng gěi wǒ yí ge jīhuì. Nà cì jīnglì yǐhòu, wǒ duì zìjǐ de nénglì yǒu le gèng duō xìnxīn. Wǒ fāxiàn hěn duō shíhou, wǒmen zhǐyǒu zhēnzhèng kāishǐ zuò, cái huì zhīdào zìjǐ néng zuò dào duōshao.",
    ],

    myanmarParagraphs: [
      "အလုပ်ဒုတိယနှစ်မှာ ပထမဆုံး အရေးကြီး task တစ်ခုကို ကိုယ်တိုင်တာဝန်ယူရတယ်။ အရင်တာဝန်ခံက ရုတ်တရက်ခွင့်ယူလို့ manager က ယာယီလွှဲပေးတယ်။",
      "ပထမနှစ်ရက်မှာ အရမ်းစိတ်လှုပ်ရှားတယ်။ အရင်က သူများလုပ်တာပဲမြင်ဖူးပြီး ကိုယ်တိုင်မလုပ်ဖူးတဲ့အရာတွေများတယ်။ နောက်တော့ ပြဿနာအားလုံးကိုရေးပြီး တစ်ခုချင်းဖြေရှင်းတယ်။",
      "မသိတာရှိရင် လုပ်ဖော်ကိုင်ဖက်ကိုမေးပြီး client နဲ့လည်း အရေးကြီးအချက်တွေ confirm လုပ်တယ်။ အလယ်မှာ ပြဿနာသေးသေးတချို့ဖြစ်ပေမယ့် နောက်ဆုံး deadline မှာ အလုပ်ပြီးတယ်။",
      "Manager က ဒီ task ခက်မယ်ဆိုတာသိပေမယ့် အခွင့်အရေးပေးချင်လို့တာဝန်ပေးခဲ့တာလို့ပြောတယ်။ အဲဒီနောက် ကိုယ့်စွမ်းရည်အပေါ် ယုံကြည်မှုပိုရှိလာတယ်။ တစ်ခါတလေ တကယ်စလုပ်မှ ကိုယ်ဘယ်လောက်လုပ်နိုင်လဲ သိရတယ်။",
    ],

    keywords: [
      "负责",
      "任务",
      "负责人",
      "暂时",
      "处理",
      "主动",
      "确认",
      "按时",
      "能力",
      "信心",
    ],

    audioUrl: null,
    audioText:
      "工作第二年的时候，我第一次自己负责一个比较重要的任务。原来的负责人突然请假，所以经理让我暂时接手。开始的两天，我非常紧张，因为很多事情以前只是看别人做，自己并没有真正处理过。后来我把所有问题写下来，一个一个解决。遇到不会的地方，我主动问同事，也和客户确认重要的信息。虽然中间出现了几次小问题，但是最后任务还是按时完成了。经理后来告诉我，他其实也知道这个任务对我来说不容易，但想给我一个机会。那次经历以后，我对自己的能力有了更多信心。我发现很多时候，我们只有真正开始做，才会知道自己能做到多少。",
  },
];

export function getHsk4ReadingSourceStories() {
  return [...HSK4_READING_STORIES].sort(
    (a, b) => a.order - b.order,
  );
}