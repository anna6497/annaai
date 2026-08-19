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

export const HSK7_READING_STORIES:
  HskReadingStorySource[] = [
  {
    id: "hsk7-reading-001",
    level: 7,
    order: 1,
    title: "科技发展与人的选择",
    pinyinTitle: "Kējì fāzhǎn yǔ rén de xuǎnzé",
    myanmarTitle: "နည်းပညာတိုးတက်မှုနဲ့ လူသားရွေးချယ်မှု",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "科技的发展给我们的生活带来了前所未有的便利。过去需要几天甚至几周才能完成的事情，现在可能几分钟就可以处理完。无论是工作、学习、购物还是交流，人们都越来越依赖各种数字工具。",
      "然而，工具越强大，我们越需要思考一个问题：哪些事情应该交给技术完成，哪些决定仍然应该由人自己承担？如果只是为了提高效率，把所有能够自动化的过程都交给机器，我们可能会逐渐失去某些能力。",
      "比如导航让人很少记路，推荐系统替我们选择音乐、电影甚至新闻。长期下来，我们可能会越来越习惯接受系统提供的答案，而减少主动寻找和判断的过程。",
      "因此，我觉得真正重要的并不是拒绝技术，而是保持选择权。科技应该扩大人的能力，而不是让人停止思考。面对越来越智能的工具，我们也许更需要学习如何做一个有判断力的使用者。",
    ],

    pinyinParagraphs: [
      "Kējì de fāzhǎn gěi wǒmen de shēnghuó dàilái le qiánsuǒwèiyǒu de biànlì. Guòqù xūyào jǐ tiān shènzhì jǐ zhōu cái néng wánchéng de shìqing, xiànzài kěnéng jǐ fēnzhōng jiù kěyǐ chǔlǐ wán. Wúlùn shì gōngzuò, xuéxí, gòuwù háishi jiāoliú, rénmen dōu yuèláiyuè yīlài gè zhǒng shùzì gōngjù.",
      "Rán'ér, gōngjù yuè qiángdà, wǒmen yuè xūyào sīkǎo yí ge wèntí: nǎxiē shìqing yīnggāi jiāo gěi jìshù wánchéng, nǎxiē juédìng réngrán yīnggāi yóu rén zìjǐ chéngdān? Rúguǒ zhǐshì wèile tígāo xiàolǜ, bǎ suǒyǒu nénggòu zìdònghuà de guòchéng dōu jiāo gěi jīqì, wǒmen kěnéng huì zhújiàn shīqù mǒuxiē nénglì.",
      "Bǐrú dǎoháng ràng rén hěn shǎo jì lù, tuījiàn xìtǒng tì wǒmen xuǎnzé yīnyuè, diànyǐng shènzhì xīnwén. Chángqī xiàlái, wǒmen kěnéng huì yuèláiyuè xíguàn jiēshòu xìtǒng tígōng de dá'àn, ér jiǎnshǎo zhǔdòng xúnzhǎo hé pànduàn de guòchéng.",
      "Yīncǐ, wǒ juéde zhēnzhèng zhòngyào de bìng bú shì jùjué jìshù, ér shì bǎochí xuǎnzéquán. Kējì yīnggāi kuòdà rén de nénglì, ér bú shì ràng rén tíngzhǐ sīkǎo. Miànduì yuèláiyuè zhìnéng de gōngjù, wǒmen yěxǔ gèng xūyào xuéxí rúhé zuò yí ge yǒu pànduànlì de shǐyòngzhě.",
    ],

    myanmarParagraphs: [
      "နည်းပညာတိုးတက်မှုကြောင့် ကျွန်မတို့ဘဝမှာ မကြုံဖူးလောက်အောင်အဆင်ပြေမှုရလာတယ်။ အရင်က ရက်ပေါင်းများစွာ ဒါမှမဟုတ် အပတ်များစွာကြာတဲ့အလုပ်တွေကို အခု မိနစ်အနည်းငယ်နဲ့ပြီးနိုင်တယ်။ အလုပ်၊ စာသင်၊ ဈေးဝယ်၊ ဆက်သွယ်ရေးအရာအားလုံးမှာ digital tools ကိုပိုမိုမှီခိုလာကြတယ်။",
      "ဒါပေမယ့် tool ပိုအားကောင်းလာလေလေ ဘာကိုနည်းပညာကလုပ်ပေးသင့်လဲ၊ ဘာကိုလူကကိုယ်တိုင်ဆုံးဖြတ်သင့်လဲဆိုတာ ပိုစဉ်းစားဖို့လိုလာတယ်။ Efficiency အတွက်အရာအားလုံး automate လုပ်လိုက်ရင် တချို့စွမ်းရည်တွေ တဖြည်းဖြည်းပျောက်နိုင်တယ်။",
      "ဥပမာ navigation သုံးလာတော့ လမ်းမှတ်တာနည်းလာတယ်။ Recommendation system က သီချင်း၊ ရုပ်ရှင်၊ သတင်းအထိရွေးပေးတယ်။ ရေရှည်မှာ ကိုယ်တိုင်ရှာဖွေ၊ ခွဲခြမ်းဆုံးဖြတ်ခြင်းထက် system ပေးတာကိုပဲ လက်ခံလာနိုင်တယ်။",
      "ဒါကြောင့် နည်းပညာကိုငြင်းပယ်ဖို့မဟုတ်ဘဲ ရွေးချယ်ခွင့်ကို ထိန်းထားဖို့က အရေးကြီးတယ်လို့ထင်တယ်။ နည်းပညာက လူ့စွမ်းရည်ကိုချဲ့ပေးသင့်ပြီး စဉ်းစားမှုကိုရပ်စေဖို့မဟုတ်ဘူး။",
    ],

    keywords: [
      "科技",
      "前所未有",
      "依赖",
      "承担",
      "自动化",
      "导航",
      "推荐系统",
      "判断",
      "选择权",
      "使用者",
    ],

    audioUrl: null,
    audioText:
      "科技的发展给我们的生活带来了前所未有的便利。过去需要几天甚至几周才能完成的事情，现在可能几分钟就可以处理完。无论是工作、学习、购物还是交流，人们都越来越依赖各种数字工具。然而，工具越强大，我们越需要思考一个问题：哪些事情应该交给技术完成，哪些决定仍然应该由人自己承担？如果只是为了提高效率，把所有能够自动化的过程都交给机器，我们可能会逐渐失去某些能力。比如导航让人很少记路，推荐系统替我们选择音乐、电影甚至新闻。长期下来，我们可能会越来越习惯接受系统提供的答案，而减少主动寻找和判断的过程。因此，我觉得真正重要的并不是拒绝技术，而是保持选择权。科技应该扩大人的能力，而不是让人停止思考。面对越来越智能的工具，我们也许更需要学习如何做一个有判断力的使用者。",
  },

  {
    id: "hsk7-reading-002",
    level: 7,
    order: 2,
    title: "全球化时代的生活",
    pinyinTitle: "Quánqiúhuà shídài de shēnghuó",
    myanmarTitle: "ကမ္ဘာလုံးဆိုင်ရာခေတ်က ဘဝ",
    category: "travel",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "今天，一个人在一个国家出生，却可能在另一个国家学习，在第三个国家工作，并和来自世界各地的人合作。全球化让人与地方之间的关系变得比过去更复杂。",
      "这种变化给个人带来了更多选择。人们可以学习不同语言、接触不同文化，也可以根据职业机会决定在哪里生活。",
      "但全球化并不只是自由流动。离开熟悉环境以后，人也可能面对身份认同、文化差异和归属感的问题。一个人在国外生活多年以后，可能既不完全属于新的地方，也发现自己和原来的生活已经产生距离。",
      "我觉得现代人的归属感也许不必只建立在一个地方。语言、朋友、工作、记忆和日常习惯都可以成为“家”的一部分。全球化改变的不只是地图上的距离，也改变了我们对身份的理解。",
    ],

    pinyinParagraphs: [
      "Jīntiān, yí ge rén zài yí ge guójiā chūshēng, què kěnéng zài lìng yí ge guójiā xuéxí, zài dì sān ge guójiā gōngzuò, bìng hé láizì shìjiè gèdì de rén hézuò. Quánqiúhuà ràng rén yǔ dìfāng zhījiān de guānxì biàn de bǐ guòqù gèng fùzá.",
      "Zhè zhǒng biànhuà gěi gèrén dàilái le gèng duō xuǎnzé. Rénmen kěyǐ xuéxí bùtóng yǔyán, jiēchù bùtóng wénhuà, yě kěyǐ gēnjù zhíyè jīhuì juédìng zài nǎli shēnghuó.",
      "Dàn quánqiúhuà bìng bù zhǐshì zìyóu liúdòng. Líkāi shúxī huánjìng yǐhòu, rén yě kěnéng miànduì shēnfèn rèntóng, wénhuà chāyì hé guīshǔgǎn de wèntí. Yí ge rén zài guówài shēnghuó duō nián yǐhòu, kěnéng jì bù wánquán shǔyú xīn de dìfāng, yě fāxiàn zìjǐ hé yuánlái de shēnghuó yǐjīng chǎnshēng jùlí.",
      "Wǒ juéde xiàndài rén de guīshǔgǎn yěxǔ bùbì zhǐ jiànlì zài yí ge dìfāng. Yǔyán, péngyou, gōngzuò, jìyì hé rìcháng xíguàn dōu kěyǐ chéngwéi 'jiā' de yí bùfen. Quánqiúhuà gǎibiàn de bù zhǐshì dìtú shàng de jùlí, yě gǎibiàn le wǒmen duì shēnfèn de lǐjiě.",
    ],

    myanmarParagraphs: [
      "ဒီခေတ်မှာ လူတစ်ယောက်က နိုင်ငံတစ်ခုမှာမွေး၊ တစ်နိုင်ငံမှာပညာသင်၊ နောက်တစ်နိုင်ငံမှာအလုပ်လုပ်ပြီး ကမ္ဘာတစ်ဝန်းကလူတွေနဲ့အတူအလုပ်လုပ်နိုင်တယ်။ Globalization က လူနဲ့နေရာကြားဆက်ဆံရေးကို ပိုရှုပ်ထွေးလာစေတယ်။",
      "ဒီပြောင်းလဲမှုက ရွေးချယ်စရာပိုပေးတယ်။ ဘာသာစကားတွေသင်နိုင်၊ ယဉ်ကျေးမှုအသစ်တွေသိနိုင်ပြီး career opportunity အလိုက် ဘယ်မှာနေမလဲဆုံးဖြတ်နိုင်တယ်။",
      "ဒါပေမယ့် globalization က လွတ်လပ်စွာရွှေ့ပြောင်းတာပဲမဟုတ်ဘူး။ Identity, culture difference နဲ့ belonging ပြဿနာတွေရှိလာနိုင်တယ်။ နိုင်ငံခြားမှာနှစ်များစွာနေပြီးရင် နေရာအသစ်မှာလည်း အပြည့်အဝမဖြစ်သလို မူလနေရာနဲ့လည်း အကွာအဝေးရှိလာနိုင်တယ်။",
      "Modern life မှာ belonging ကို နေရာတစ်ခုတည်းနဲ့မသတ်မှတ်ဖို့လည်းဖြစ်နိုင်တယ်။ ဘာသာစကား၊ သူငယ်ချင်း၊ အလုပ်၊ အမှတ်တရနဲ့ အလေ့အကျင့်တွေကလည်း “အိမ်” ဖြစ်လာနိုင်တယ်။",
    ],

    keywords: [
      "全球化",
      "复杂",
      "接触",
      "流动",
      "身份认同",
      "文化差异",
      "归属感",
      "现代",
      "记忆",
      "理解",
    ],

    audioUrl: null,
    audioText:
      "今天，一个人在一个国家出生，却可能在另一个国家学习，在第三个国家工作，并和来自世界各地的人合作。全球化让人与地方之间的关系变得比过去更复杂。这种变化给个人带来了更多选择。人们可以学习不同语言、接触不同文化，也可以根据职业机会决定在哪里生活。但全球化并不只是自由流动。离开熟悉环境以后，人也可能面对身份认同、文化差异和归属感的问题。一个人在国外生活多年以后，可能既不完全属于新的地方，也发现自己和原来的生活已经产生距离。我觉得现代人的归属感也许不必只建立在一个地方。语言、朋友、工作、记忆和日常习惯都可以成为家的一个部分。全球化改变的不只是地图上的距离，也改变了我们对身份的理解。",
  },

  {
    id: "hsk7-reading-003",
    level: 7,
    order: 3,
    title: "传统与现代之间",
    pinyinTitle: "Chuántǒng yǔ xiàndài zhījiān",
    myanmarTitle: "ရိုးရာနဲ့ ခေတ်မီမှုကြား",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "社会发展越快，人们越容易讨论一个问题：传统应该保留多少，现代生活又应该改变多少？",
      "有些传统承载着历史、文化和共同记忆，如果完全消失，一个社会可能会失去重要的身份特征。但并不是所有传统都应该因为“历史悠久”而被无条件保留。",
      "社会价值、生活方式和人的需求都会改变。有些过去合理的做法，在新的时代可能已经不再适合。如果只是因为“以前一直这样”就拒绝改变，传统反而可能成为压力。",
      "我觉得比较健康的态度不是在传统和现代之间二选一，而是理解传统为什么存在，再判断哪些部分仍然有价值。真正有生命力的文化，并不是永远不变，而是能够在变化中继续保留核心。",
    ],

    pinyinParagraphs: [
      "Shèhuì fāzhǎn yuè kuài, rénmen yuè róngyì tǎolùn yí ge wèntí: chuántǒng yīnggāi bǎoliú duōshao, xiàndài shēnghuó yòu yīnggāi gǎibiàn duōshao?",
      "Yǒuxiē chuántǒng chéngzàizhe lìshǐ, wénhuà hé gòngtóng jìyì, rúguǒ wánquán xiāoshī, yí ge shèhuì kěnéng huì shīqù zhòngyào de shēnfèn tèzhēng. Dàn bìng bú shì suǒyǒu chuántǒng dōu yīnggāi yīnwèi 'lìshǐ yōujiǔ' ér bèi wútiáojiàn bǎoliú.",
      "Shèhuì jiàzhí, shēnghuó fāngshì hé rén de xūqiú dōu huì gǎibiàn. Yǒuxiē guòqù hélǐ de zuòfǎ, zài xīn de shídài kěnéng yǐjīng bú zài shìhé. Rúguǒ zhǐshì yīnwèi 'yǐqián yìzhí zhèyàng' jiù jùjué gǎibiàn, chuántǒng fǎn'ér kěnéng chéngwéi yālì.",
      "Wǒ juéde bǐjiào jiànkāng de tàidù bú shì zài chuántǒng hé xiàndài zhījiān èr xuǎn yī, ér shì lǐjiě chuántǒng wèishénme cúnzài, zài pànduàn nǎxiē bùfen réngrán yǒu jiàzhí. Zhēnzhèng yǒu shēngmìnglì de wénhuà, bìng bú shì yǒngyuǎn bú biàn, ér shì nénggòu zài biànhuà zhōng jìxù bǎoliú héxīn.",
    ],

    myanmarParagraphs: [
      "လူမှုအသိုင်းအဝိုင်းပိုမြန်မြန်တိုးတက်လာလေလေ ရိုးရာကိုဘယ်လောက်ထိန်းသင့်လဲ၊ ခေတ်မီဘဝက ဘယ်လောက်ပြောင်းသင့်လဲဆိုတဲ့မေးခွန်း ပိုများလာတယ်။",
      "ရိုးရာတချို့မှာ သမိုင်း၊ ယဉ်ကျေးမှုနဲ့ အတူတူရှိခဲ့တဲ့အမှတ်တရတွေပါလို့ အကုန်ပျောက်သွားရင် လူမှုအသိုင်းအဝိုင်းရဲ့ identity တချို့ပျောက်နိုင်တယ်။ ဒါပေမယ့် ရှေးကျလို့ဆိုပြီး ရိုးရာအားလုံးကို အခြေအနေမဲ့ထိန်းထားဖို့မလိုဘူး။",
      "လူမှုတန်ဖိုး၊ နေထိုင်ပုံနဲ့ လူတွေရဲ့လိုအပ်ချက်က ပြောင်းတယ်။ အရင်ကသင့်တော်တဲ့အရာတချို့ဟာ ဒီခေတ်မှာ မသင့်တော်တော့နိုင်ဘူး။ “အရင်ကဒီလိုပဲ” ဆိုပြီး မပြောင်းရင် ရိုးရာက ဖိအားတစ်ခုဖြစ်လာနိုင်တယ်။",
      "ကျွန်မအမြင်မှာ ရိုးရာနဲ့ခေတ်မီမှုထဲက တစ်ခုရွေးတာမဟုတ်ဘဲ ရိုးရာဘာကြောင့်ဖြစ်လာလဲနားလည်ပြီး ဘာကိုဆက်ထိန်းသင့်လဲဆုံးဖြတ်တာ ပိုကောင်းတယ်။",
    ],

    keywords: [
      "传统",
      "现代",
      "承载",
      "特征",
      "无条件",
      "合理",
      "时代",
      "态度",
      "生命力",
      "核心",
    ],

    audioUrl: null,
    audioText:
      "社会发展越快，人们越容易讨论一个问题：传统应该保留多少，现代生活又应该改变多少？有些传统承载着历史、文化和共同记忆，如果完全消失，一个社会可能会失去重要的身份特征。但并不是所有传统都应该因为历史悠久而被无条件保留。社会价值、生活方式和人的需求都会改变。有些过去合理的做法，在新的时代可能已经不再适合。如果只是因为以前一直这样就拒绝改变，传统反而可能成为压力。我觉得比较健康的态度不是在传统和现代之间二选一，而是理解传统为什么存在，再判断哪些部分仍然有价值。真正有生命力的文化，并不是永远不变，而是能够在变化中继续保留核心。",
  },

  {
    id: "hsk7-reading-004",
    level: 7,
    order: 4,
    title: "教育真正的价值",
    pinyinTitle: "Jiàoyù zhēnzhèng de jiàzhí",
    myanmarTitle: "ပညာရေးရဲ့ တကယ့်တန်ဖိုး",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "谈到教育时，人们常常首先想到考试成绩、学历和就业机会。这些当然重要，因为教育确实会影响一个人的职业发展。",
      "但如果教育的目标只是让学生得到更好的工作，那么很多无法直接带来收入的知识似乎就失去了价值。",
      "我更愿意认为，教育还应该帮助人形成判断能力。一个受过良好教育的人，不只是知道更多答案，也应该懂得如何提出问题、如何面对不同观点，以及如何判断信息是否可靠。",
      "在知识越来越容易获得的时代，记住多少事实可能已经不再是唯一重要的能力。教育真正的价值，也许是让一个人能够继续学习，并在面对未知时仍然知道如何思考。",
    ],

    pinyinParagraphs: [
      "Tándào jiàoyù shí, rénmen chángcháng shǒuxiān xiǎngdào kǎoshì chéngjì, xuélì hé jiùyè jīhuì. Zhèxiē dāngrán zhòngyào, yīnwèi jiàoyù quèshí huì yǐngxiǎng yí ge rén de zhíyè fāzhǎn.",
      "Dàn rúguǒ jiàoyù de mùbiāo zhǐshì ràng xuéshēng dédào gèng hǎo de gōngzuò, nàme hěn duō wúfǎ zhíjiē dàilái shōurù de zhīshi sìhū jiù shīqù le jiàzhí.",
      "Wǒ gèng yuànyì rènwéi, jiàoyù hái yīnggāi bāngzhù rén xíngchéng pànduàn nénglì. Yí ge shòuguo liánghǎo jiàoyù de rén, bù zhǐshì zhīdào gèng duō dá'àn, yě yīnggāi dǒngde rúhé tíchū wèntí, rúhé miànduì bùtóng guāndiǎn, yǐjí rúhé pànduàn xìnxī shìfǒu kěkào.",
      "Zài zhīshi yuèláiyuè róngyì huòdé de shídài, jìzhù duōshao shìshí kěnéng yǐjīng bú zài shì wéiyī zhòngyào de nénglì. Jiàoyù zhēnzhèng de jiàzhí, yěxǔ shì ràng yí ge rén nénggòu jìxù xuéxí, bìng zài miànduì wèizhī shí réngrán zhīdào rúhé sīkǎo.",
    ],

    myanmarParagraphs: [
      "ပညာရေးပြောရင် လူအများက စာမေးပွဲရလဒ်၊ ဘွဲ့နဲ့ အလုပ်အခွင့်အရေးကို အရင်စဉ်းစားတတ်တယ်။ ဒါတွေက career အပေါ်အကျိုးသက်ရောက်လို့ အရေးကြီးတယ်။",
      "ဒါပေမယ့် ပညာရေးရဲ့ရည်ရွယ်ချက်က အလုပ်ကောင်းရဖို့ပဲဆိုရင် ဝင်ငွေကိုတိုက်ရိုက်မပေးနိုင်တဲ့ knowledge တွေတန်ဖိုးမရှိသလိုဖြစ်သွားမယ်။",
      "ကျွန်မအမြင်မှာ ပညာရေးက judgment skill ကိုလည်းတည်ဆောက်ပေးသင့်တယ်။ ပညာတတ်သူတစ်ယောက်ဟာ အဖြေများများသိတာတင်မဟုတ်ဘဲ မေးခွန်းကောင်းမေးတတ်၊ မတူတဲ့အမြင်တွေကိုရင်ဆိုင်တတ်၊ information မှန်မမှန်ခွဲတတ်ဖို့လိုတယ်။",
      "Knowledge ကိုလွယ်လွယ်ရနိုင်တဲ့ခေတ်မှာ facts အများကြီးမှတ်ထားတာတစ်ခုတည်းက အရေးကြီးဆုံးမဟုတ်တော့ဘူး။ မသိသေးတဲ့အရာကြုံရင် ဘယ်လိုဆက်သင်၊ ဘယ်လိုစဉ်းစားမလဲဆိုတာက ပညာရေးတန်ဖိုးကြီးတယ်။",
    ],

    keywords: [
      "教育",
      "学历",
      "就业",
      "收入",
      "形成",
      "观点",
      "可靠",
      "事实",
      "未知",
      "价值",
    ],

    audioUrl: null,
    audioText:
      "谈到教育时，人们常常首先想到考试成绩、学历和就业机会。这些当然重要，因为教育确实会影响一个人的职业发展。但如果教育的目标只是让学生得到更好的工作，那么很多无法直接带来收入的知识似乎就失去了价值。我更愿意认为，教育还应该帮助人形成判断能力。一个受过良好教育的人，不只是知道更多答案，也应该懂得如何提出问题、如何面对不同观点，以及如何判断信息是否可靠。在知识越来越容易获得的时代，记住多少事实可能已经不再是唯一重要的能力。教育真正的价值，也许是让一个人能够继续学习，并在面对未知时仍然知道如何思考。",
  },

  {
    id: "hsk7-reading-005",
    level: 7,
    order: 5,
    title: "快速生活中的慢思考",
    pinyinTitle: "Kuàisù shēnghuó zhōng de màn sīkǎo",
    myanmarTitle: "မြန်ဆန်တဲ့ဘဝထဲက ဖြည်းဖြည်းစဉ်းစားခြင်း",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "现代生活越来越强调速度。消息要马上回复，工作要尽快完成，新闻不断更新，就连休息也常常被安排成一个又一个活动。",
      "速度确实能够提高效率，但并不是所有问题都适合快速解决。越复杂的决定，往往越需要时间。",
      "我以前收到重要消息以后常常马上作出反应。后来发现，情绪最强烈的时候做出的决定不一定最合理。",
      "现在遇到重要问题时，我会尽量给自己一点时间。慢并不等于犹豫，也不等于效率低。有时候，真正的慢思考只是让信息、情绪和现实都有机会被看见，再作决定。",
    ],

    pinyinParagraphs: [
      "Xiàndài shēnghuó yuèláiyuè qiángdiào sùdù. Xiāoxi yào mǎshàng huífù, gōngzuò yào jǐnkuài wánchéng, xīnwén bùduàn gēngxīn, jiù lián xiūxi yě chángcháng bèi ānpái chéng yí ge yòu yí ge huódòng.",
      "Sùdù quèshí nénggòu tígāo xiàolǜ, dàn bìng bú shì suǒyǒu wèntí dōu shìhé kuàisù jiějué. Yuè fùzá de juédìng, wǎngwǎng yuè xūyào shíjiān.",
      "Wǒ yǐqián shōudào zhòngyào xiāoxi yǐhòu chángcháng mǎshàng zuòchū fǎnyìng. Hòulái fāxiàn, qíngxù zuì qiángliè de shíhou zuòchū de juédìng bù yídìng zuì hélǐ.",
      "Xiànzài yùdào zhòngyào wèntí shí, wǒ huì jǐnliàng gěi zìjǐ yìdiǎn shíjiān. Màn bìng bù děngyú yóuyù, yě bù děngyú xiàolǜ dī. Yǒu shíhou, zhēnzhèng de màn sīkǎo zhǐshì ràng xìnxī, qíngxù hé xiànshí dōu yǒu jīhuì bèi kànjiàn, zài zuò juédìng.",
    ],

    myanmarParagraphs: [
      "ခေတ်သစ်ဘဝက မြန်နှုန်းကိုပိုအလေးထားလာတယ်။ Message ချက်ချင်းပြန်၊ အလုပ်မြန်မြန်ပြီး၊ သတင်းအမြဲ update ဖြစ်ပြီး နားချိန်တောင် activity တွေနဲ့ပြည့်နေတတ်တယ်။",
      "မြန်တာက efficiency တိုးပေမယ့် ပြဿနာတိုင်းကို အမြန်ဖြေရှင်းလို့မရဘူး။ ရှုပ်ထွေးတဲ့ဆုံးဖြတ်ချက်ပိုဖြစ်လေလေ အချိန်ပိုလိုတတ်တယ်။",
      "အရင်က အရေးကြီး message ရရင် ချက်ချင်းတုံ့ပြန်တတ်တယ်။ နောက်မှ emotion အပြင်းဆုံးအချိန်ကဆုံးဖြတ်ချက်ဟာ အကောင်းဆုံးမဖြစ်နိုင်တာသိလာတယ်။",
      "အခုတော့ အရေးကြီးတာကြုံရင် ကိုယ့်ကိုအချိန်နည်းနည်းပေးတယ်။ ဖြည်းတာက တွန့်ဆုတ်တာမဟုတ်သလို efficiency နည်းတာလည်းမဟုတ်ဘူး။ Information, emotion နဲ့ reality အကုန်မြင်ပြီးမှဆုံးဖြတ်တာဖြစ်တယ်။",
    ],

    keywords: [
      "强调",
      "速度",
      "更新",
      "复杂",
      "反应",
      "强烈",
      "合理",
      "犹豫",
      "现实",
      "决定",
    ],

    audioUrl: null,
    audioText:
      "现代生活越来越强调速度。消息要马上回复，工作要尽快完成，新闻不断更新，就连休息也常常被安排成一个又一个活动。速度确实能够提高效率，但并不是所有问题都适合快速解决。越复杂的决定，往往越需要时间。我以前收到重要消息以后常常马上作出反应。后来发现，情绪最强烈的时候做出的决定不一定最合理。现在遇到重要问题时，我会尽量给自己一点时间。慢并不等于犹豫，也不等于效率低。有时候，真正的慢思考只是让信息、情绪和现实都有机会被看见，再作决定。",
  },

  {
    id: "hsk7-reading-006",
    level: 7,
    order: 6,
    title: "人工智能与未来工作",
    pinyinTitle: "Réngōng zhìnéng yǔ wèilái gōngzuò",
    myanmarTitle: "AI နဲ့ အနာဂတ်အလုပ်အကိုင်",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "人工智能快速发展以后，人们开始担心很多工作是否会被机器取代。这种担心并不是完全没有理由，因为一些重复、标准化程度高的任务确实越来越容易自动完成。",
      "但是从历史来看，新技术通常不只是消灭工作，也会改变工作的内容，并创造新的职业。",
      "真正困难的问题也许不是“哪些职业会消失”，而是“哪些能力会越来越重要”。当机器能够快速处理大量信息时，人可能更需要判断、沟通、创造以及理解复杂情境的能力。",
      "因此，与其试图预测几十年以后有哪些具体职位，不如建立持续学习的能力。未来工作的稳定，也许不再来自一辈子掌握同一套技能，而是来自不断适应变化。",
    ],

    pinyinParagraphs: [
      "Réngōng zhìnéng kuàisù fāzhǎn yǐhòu, rénmen kāishǐ dānxīn hěn duō gōngzuò shìfǒu huì bèi jīqì qǔdài. Zhè zhǒng dānxīn bìng bú shì wánquán méiyǒu lǐyóu, yīnwèi yìxiē chóngfù, biāozhǔnhuà chéngdù gāo de rènwu quèshí yuèláiyuè róngyì zìdòng wánchéng.",
      "Dànshì cóng lìshǐ lái kàn, xīn jìshù tōngcháng bù zhǐshì xiāomiè gōngzuò, yě huì gǎibiàn gōngzuò de nèiróng, bìng chuàngzào xīn de zhíyè.",
      "Zhēnzhèng kùnnan de wèntí yěxǔ bú shì 'nǎxiē zhíyè huì xiāoshī', ér shì 'nǎxiē nénglì huì yuèláiyuè zhòngyào'. Dāng jīqì nénggòu kuàisù chǔlǐ dàliàng xìnxī shí, rén kěnéng gèng xūyào pànduàn, gōutōng, chuàngzào yǐjí lǐjiě fùzá qíngjìng de nénglì.",
      "Yīncǐ, yǔqí shìtú yùcè jǐshí nián yǐhòu yǒu nǎxiē jùtǐ zhíwèi, bùrú jiànlì chíxù xuéxí de nénglì. Wèilái gōngzuò de wěndìng, yěxǔ bú zài láizì yíbèizi zhǎngwò tóng yí tào jìnéng, ér shì láizì bùduàn shìyìng biànhuà.",
    ],

    myanmarParagraphs: [
      "AI မြန်မြန်တိုးတက်လာတော့ အလုပ်အများကြီးကို machine အစားထိုးမလားဆိုပြီး လူတွေစိုးရိမ်လာကြတယ်။ Repetitive နဲ့ standardized task တချို့ automate ဖြစ်လွယ်တာက တကယ်ပါ။",
      "ဒါပေမယ့် သမိုင်းကြည့်ရင် နည်းပညာအသစ်က အလုပ်ပျောက်စေတင်မဟုတ်ဘဲ အလုပ်ရဲ့ content ကိုပြောင်းပြီး career အသစ်တွေလည်းဖန်တီးတတ်တယ်။",
      "အဓိကမေးခွန်းက ဘယ်အလုပ်ပျောက်မလဲထက် ဘယ် skill ပိုတန်ဖိုးရှိလာမလဲဖြစ်နိုင်တယ်။ Machine က information အများကြီးကိုမြန်မြန်လုပ်နိုင်ရင် လူမှာ judgment, communication, creativity နဲ့ complex context နားလည်မှု ပိုလိုလာတယ်။",
      "ဒါကြောင့် ဆယ်စုနှစ်နောက် ဘယ် job ရှိမလဲကြိုခန့်မှန်းတာထက် lifelong learning ability တည်ဆောက်တာ ပိုအရေးကြီးတယ်။",
    ],

    keywords: [
      "人工智能",
      "取代",
      "标准化",
      "自动",
      "消灭",
      "创造",
      "情境",
      "预测",
      "持续",
      "适应",
    ],

    audioUrl: null,
    audioText:
      "人工智能快速发展以后，人们开始担心很多工作是否会被机器取代。这种担心并不是完全没有理由，因为一些重复、标准化程度高的任务确实越来越容易自动完成。但是从历史来看，新技术通常不只是消灭工作，也会改变工作的内容，并创造新的职业。真正困难的问题也许不是哪些职业会消失，而是哪些能力会越来越重要。当机器能够快速处理大量信息时，人可能更需要判断、沟通、创造以及理解复杂情境的能力。因此，与其试图预测几十年以后有哪些具体职位，不如建立持续学习的能力。未来工作的稳定，也许不再来自一辈子掌握同一套技能，而是来自不断适应变化。",
  },

  {
    id: "hsk7-reading-007",
    level: 7,
    order: 7,
    title: "人与自然的关系",
    pinyinTitle: "Rén yǔ zìrán de guānxì",
    myanmarTitle: "လူသားနဲ့သဘာဝဆက်ဆံရေး",
    category: "travel",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "现代城市让人类生活越来越方便，但也让很多人和自然之间的距离越来越远。我们习惯了空调、交通工具和大型商场，有时候很少注意天气、季节和环境本身。",
      "当自然只被看成可以利用的资源时，人们很容易忽略长期后果。森林、河流、空气和土地并不是无限的。",
      "环境问题最复杂的地方在于，个人生活和社会发展常常互相影响。人们希望生活方便，企业希望降低成本，城市希望快速发展，而这些目标有时候会和环境保护发生冲突。",
      "真正可持续的生活并不是要求所有人回到过去，而是寻找一种既满足现代需求，又不过度消耗自然资源的方式。人与自然并不是彼此独立的两个系统。",
    ],

    pinyinParagraphs: [
      "Xiàndài chéngshì ràng rénlèi shēnghuó yuèláiyuè fāngbiàn, dàn yě ràng hěn duō rén hé zìrán zhījiān de jùlí yuèláiyuè yuǎn. Wǒmen xíguàn le kōngtiáo, jiāotōng gōngjù hé dàxíng shāngchǎng, yǒu shíhou hěn shǎo zhùyì tiānqì, jìjié hé huánjìng běnshēn.",
      "Dāng zìrán zhǐ bèi kàn chéng kěyǐ lìyòng de zīyuán shí, rénmen hěn róngyì hūlüè chángqī hòuguǒ. Sēnlín, héliú, kōngqì hé tǔdì bìng bú shì wúxiàn de.",
      "Huánjìng wèntí zuì fùzá de dìfang zàiyú, gèrén shēnghuó hé shèhuì fāzhǎn chángcháng hùxiāng yǐngxiǎng. Rénmen xīwàng shēnghuó fāngbiàn, qǐyè xīwàng jiàngdī chéngběn, chéngshì xīwàng kuàisù fāzhǎn, ér zhèxiē mùbiāo yǒu shíhou huì hé huánjìng bǎohù fāshēng chōngtū.",
      "Zhēnzhèng kě chíxù de shēnghuó bìng bú shì yāoqiú suǒyǒu rén huídào guòqù, ér shì xúnzhǎo yì zhǒng jì mǎnzú xiàndài xūqiú, yòu bú guòdù xiāohào zìrán zīyuán de fāngshì. Rén yǔ zìrán bìng bú shì bǐcǐ dúlì de liǎng ge xìtǒng.",
    ],

    myanmarParagraphs: [
      "ခေတ်မီမြို့တွေက ဘဝပိုအဆင်ပြေစေပေမယ့် လူနဲ့သဘာဝကြားအကွာအဝေးလည်းတိုးလာတယ်။ Air-con, transport, shopping mall ကိုအလေ့အကျင့်ဖြစ်ပြီး ရာသီ၊ ရာသီဥတု၊ ပတ်ဝန်းကျင်ကို သတိထားမှုနည်းတတ်တယ်။",
      "သဘာဝကို အသုံးချရမယ့် resource ပဲလို့မြင်ရင် ရေရှည်အကျိုးဆက်ကို မမြင်လွယ်ဘူး။ သစ်တော၊ မြစ်၊ လေ၊ မြေဟာ အကန့်အသတ်မရှိတာမဟုတ်ဘူး။",
      "Environment problem ရှုပ်ထွေးတာက လူ့ဘဝနဲ့ society development ဆက်စပ်နေလို့ပါ။ လူတွေ convenience လိုတယ်၊ company က cost လျှော့ချင်တယ်၊ city က မြန်မြန်တိုးတက်ချင်တယ်။ ဒါတွေက environmental protection နဲ့ ထိပ်တိုက်ဖြစ်နိုင်တယ်။",
      "Sustainable life ဆိုတာ အတိတ်ဘဝကိုပြန်သွားဖို့မဟုတ်ဘဲ modern needs ဖြည့်ရင်း natural resources ကိုအလွန်အကျွံမသုံးတဲ့နည်းရှာတာပါ။",
    ],

    keywords: [
      "自然",
      "资源",
      "后果",
      "森林",
      "企业",
      "降低",
      "保护",
      "冲突",
      "可持续",
      "消耗",
    ],

    audioUrl: null,
    audioText:
      "现代城市让人类生活越来越方便，但也让很多人和自然之间的距离越来越远。我们习惯了空调、交通工具和大型商场，有时候很少注意天气、季节和环境本身。当自然只被看成可以利用的资源时，人们很容易忽略长期后果。森林、河流、空气和土地并不是无限的。环境问题最复杂的地方在于，个人生活和社会发展常常互相影响。人们希望生活方便，企业希望降低成本，城市希望快速发展，而这些目标有时候会和环境保护发生冲突。真正可持续的生活并不是要求所有人回到过去，而是寻找一种既满足现代需求，又不过度消耗自然资源的方式。人与自然并不是彼此独立的两个系统。",
  },

  {
    id: "hsk7-reading-008",
    level: 7,
    order: 8,
    title: "社交媒体改变了什么",
    pinyinTitle: "Shèjiāo méitǐ gǎibiàn le shénme",
    myanmarTitle: "Social media က ဘာတွေပြောင်းလဲစေသလဲ",
    category: "friends",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "社交媒体让人与人保持联系变得前所未有地容易。即使住在不同国家，我们也可以随时知道朋友最近去了哪里、吃了什么、正在做什么。",
      "但这种“知道”并不一定等于真正了解。我们看到的往往是别人选择展示出来的部分，而不是生活的全部。",
      "长期观看经过挑选的生活片段，也容易让人产生比较。别人看起来总是在旅行、成功、庆祝，而自己的普通生活似乎显得没有那么精彩。",
      "社交媒体本身并没有要求我们比较，是人的使用方式决定了它的影响。也许更健康的方式，是把它当作沟通工具，而不是衡量自己生活价值的标准。",
    ],

    pinyinParagraphs: [
      "Shèjiāo méitǐ ràng rén yǔ rén bǎochí liánxì biàn de qiánsuǒwèiyǒu de róngyì. Jíshǐ zhù zài bùtóng guójiā, wǒmen yě kěyǐ suíshí zhīdào péngyou zuìjìn qù le nǎli, chī le shénme, zhèngzài zuò shénme.",
      "Dàn zhè zhǒng 'zhīdào' bìng bù yídìng děngyú zhēnzhèng liǎojiě. Wǒmen kàndào de wǎngwǎng shì biérén xuǎnzé zhǎnshì chūlái de bùfen, ér bú shì shēnghuó de quánbù.",
      "Chángqī guānkàn jīngguò tiāoxuǎn de shēnghuó piànduàn, yě róngyì ràng rén chǎnshēng bǐjiào. Biérén kàn qǐlái zǒng shì zài lǚxíng, chénggōng, qìngzhù, ér zìjǐ de pǔtōng shēnghuó sìhū xiǎnde méiyǒu nàme jīngcǎi.",
      "Shèjiāo méitǐ běnshēn bìng méiyǒu yāoqiú wǒmen bǐjiào, shì rén de shǐyòng fāngshì juédìng le tā de yǐngxiǎng. Yěxǔ gèng jiànkāng de fāngshì, shì bǎ tā dàngzuò gōutōng gōngjù, ér bú shì héngliáng zìjǐ shēnghuó jiàzhí de biāozhǔn.",
    ],

    myanmarParagraphs: [
      "Social media ကြောင့် နိုင်ငံမတူနေရင်တောင် သူငယ်ချင်းဘယ်သွား၊ ဘာစား၊ ဘာလုပ်နေသလဲ ချက်ချင်းသိနိုင်တယ်။",
      "ဒါပေမယ့် “သိတာ” က “တကယ်နားလည်တာ” နဲ့မတူဘူး။ ကျွန်မတို့မြင်တာက လူတွေရွေးပြီးပြချင်တဲ့အပိုင်းပဲဖြစ်တတ်တယ်။",
      "ရွေးထားတဲ့ life highlights တွေကိုအမြဲကြည့်ရင် ကိုယ့်ဘဝနဲ့နှိုင်းယှဉ်လာနိုင်တယ်။ သူများက ခရီးသွား၊ အောင်မြင်၊ ပျော်နေသလိုမြင်ရပြီး ကိုယ့်ရိုးရိုးဘဝက မထူးခြားသလိုဖြစ်တယ်။",
      "Social media ကိုယ်တိုင်က comparison လုပ်ခိုင်းတာမဟုတ်ဘူး။ အသုံးပြုပုံက အကျိုးသက်ရောက်မှုကိုဆုံးဖြတ်တယ်။ Communication tool အနေနဲ့သုံးပြီး ကိုယ့်ဘဝတန်ဖိုးတိုင်းတဲ့ standard မလုပ်တာပိုကောင်းမယ်။",
    ],

    keywords: [
      "社交媒体",
      "展示",
      "挑选",
      "片段",
      "比较",
      "庆祝",
      "精彩",
      "影响",
      "衡量",
      "标准",
    ],

    audioUrl: null,
    audioText:
      "社交媒体让人与人保持联系变得前所未有地容易。即使住在不同国家，我们也可以随时知道朋友最近去了哪里、吃了什么、正在做什么。但这种知道并不一定等于真正了解。我们看到的往往是别人选择展示出来的部分，而不是生活的全部。长期观看经过挑选的生活片段，也容易让人产生比较。别人看起来总是在旅行、成功、庆祝，而自己的普通生活似乎显得没有那么精彩。社交媒体本身并没有要求我们比较，是人的使用方式决定了它的影响。也许更健康的方式，是把它当作沟通工具，而不是衡量自己生活价值的标准。",
  },

  {
    id: "hsk7-reading-009",
    level: 7,
    order: 9,
    title: "竞争与合作",
    pinyinTitle: "Jìngzhēng yǔ hézuò",
    myanmarTitle: "ယှဉ်ပြိုင်မှုနဲ့ ပူးပေါင်းမှု",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "在学校和工作中，我们经常同时面对竞争和合作。一方面，我们希望自己的成绩、职位或表现比别人更好；另一方面，又必须依靠团队完成复杂任务。",
      "竞争本身并不一定是坏事。适当的竞争可以给人目标，也可能推动一个人提高能力。",
      "但如果所有关系都被理解成竞争，人就很容易把别人的成功看成自己的损失。这样的环境虽然可能短期提高表现，却会慢慢破坏信任。",
      "真正成熟的合作并不是没有竞争，而是知道哪些事情可以比较，哪些目标必须共同完成。一个健康的团队应该允许个人发展，同时也让成员意识到，有些成果只有合作才能实现。",
    ],

    pinyinParagraphs: [
      "Zài xuéxiào hé gōngzuò zhōng, wǒmen jīngcháng tóngshí miànduì jìngzhēng hé hézuò. Yì fāngmiàn, wǒmen xīwàng zìjǐ de chéngjì, zhíwèi huò biǎoxiàn bǐ biérén gèng hǎo; lìng yì fāngmiàn, yòu bìxū yīkào tuánduì wánchéng fùzá rènwu.",
      "Jìngzhēng běnshēn bìng bù yídìng shì huài shì. Shìdàng de jìngzhēng kěyǐ gěi rén mùbiāo, yě kěnéng tuīdòng yí ge rén tígāo nénglì.",
      "Dàn rúguǒ suǒyǒu guānxì dōu bèi lǐjiě chéng jìngzhēng, rén jiù hěn róngyì bǎ biérén de chénggōng kàn chéng zìjǐ de sǔnshī. Zhèyàng de huánjìng suīrán kěnéng duǎnqī tígāo biǎoxiàn, què huì mànmàn pòhuài xìnrèn.",
      "Zhēnzhèng chéngshú de hézuò bìng bú shì méiyǒu jìngzhēng, ér shì zhīdào nǎxiē shìqing kěyǐ bǐjiào, nǎxiē mùbiāo bìxū gòngtóng wánchéng. Yí ge jiànkāng de tuánduì yīnggāi yǔnxǔ gèrén fāzhǎn, tóngshí yě ràng chéngyuán yìshí dào, yǒuxiē chéngguǒ zhǐyǒu hézuò cái néng shíxiàn.",
    ],

    myanmarParagraphs: [
      "ကျောင်းနဲ့အလုပ်မှာ competition နဲ့ cooperation နှစ်ခုလုံးကြုံရတယ်။ တစ်ဖက်က သူများထက် result ကောင်းချင်၊ position ကောင်းချင်ပေမယ့် တစ်ဖက်က complex task တွေကို team နဲ့ပဲပြီးနိုင်တယ်။",
      "Competition ကိုယ်တိုင်က မကောင်းတာမဟုတ်ဘူး။ သင့်တော်တဲ့ပြိုင်ဆိုင်မှုက goal ပေးပြီး skill တိုးလာစေနိုင်တယ်။",
      "ဒါပေမယ့် relationship အားလုံးကို competition လို့မြင်ရင် သူများအောင်မြင်တာကို ကိုယ်ရှုံးတာလိုခံစားလာနိုင်တယ်။ Short term performance တက်ပေမယ့် trust ကိုဖျက်နိုင်တယ်။",
      "Mature cooperation ဆိုတာ competition လုံးဝမရှိတာမဟုတ်ဘဲ ဘာကိုယှဉ်နိုင်လဲ၊ ဘာကိုအတူလုပ်မှရမလဲသိတာပါ။ Healthy team က individual growth နဲ့ collective result နှစ်ခုလုံးထိန်းထားသင့်တယ်။",
    ],

    keywords: [
      "竞争",
      "合作",
      "依靠",
      "适当",
      "推动",
      "损失",
      "短期",
      "破坏",
      "团队",
      "成果",
    ],

    audioUrl: null,
    audioText:
      "在学校和工作中，我们经常同时面对竞争和合作。一方面，我们希望自己的成绩、职位或表现比别人更好；另一方面，又必须依靠团队完成复杂任务。竞争本身并不一定是坏事。适当的竞争可以给人目标，也可能推动一个人提高能力。但如果所有关系都被理解成竞争，人就很容易把别人的成功看成自己的损失。这样的环境虽然可能短期提高表现，却会慢慢破坏信任。真正成熟的合作并不是没有竞争，而是知道哪些事情可以比较，哪些目标必须共同完成。一个健康的团队应该允许个人发展，同时也让成员意识到，有些成果只有合作才能实现。",
  },

  {
    id: "hsk7-reading-010",
    level: 7,
    order: 10,
    title: "独立思考的重要性",
    pinyinTitle: "Dúlì sīkǎo de zhòngyàoxìng",
    myanmarTitle: "ကိုယ်တိုင်စဉ်းစားနိုင်မှုရဲ့ အရေးပါမှု",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "互联网让信息传播得越来越快，但速度越快，错误的信息也可能传播得越广。",
      "如果我们只看标题、转发次数或者评论数量，就很容易把“很多人相信”误认为“这件事是真的”。",
      "独立思考并不意味着永远不相信别人，而是知道在接受一个观点以前，应该问几个问题：信息来自哪里？证据是什么？有没有其他解释？",
      "真正的独立思考也包括愿意改变自己的看法。如果新的证据比原来的理由更有说服力，坚持旧观点并不能证明一个人独立，反而可能只是固执。",
    ],

    pinyinParagraphs: [
      "Hùliánwǎng ràng xìnxī chuánbō de yuèláiyuè kuài, dàn sùdù yuè kuài, cuòwù de xìnxī yě kěnéng chuánbō de yuè guǎng.",
      "Rúguǒ wǒmen zhǐ kàn biāotí, zhuǎnfā cìshù huòzhě pínglùn shùliàng, jiù hěn róngyì bǎ 'hěn duō rén xiāngxìn' wùrènwéi 'zhè jiàn shì shì zhēnde'.",
      "Dúlì sīkǎo bìng bù yìwèizhe yǒngyuǎn bù xiāngxìn biérén, ér shì zhīdào zài jiēshòu yí ge guāndiǎn yǐqián, yīnggāi wèn jǐ ge wèntí: xìnxī láizì nǎli? Zhèngjù shì shénme? Yǒu méiyǒu qítā jiěshì?",
      "Zhēnzhèng de dúlì sīkǎo yě bāokuò yuànyì gǎibiàn zìjǐ de kànfǎ. Rúguǒ xīn de zhèngjù bǐ yuánlái de lǐyóu gèng yǒu shuōfúlì, jiānchí jiù guāndiǎn bìng bù néng zhèngmíng yí ge rén dúlì, fǎn'ér kěnéng zhǐshì gùzhí.",
    ],

    myanmarParagraphs: [
      "Internet က information ပျံ့နှံ့မှုကိုအရမ်းမြန်စေပေမယ့် မှားတဲ့ information လည်း အများကြီးပျံ့နိုင်တယ်။",
      "Headline, share count, comment count ပဲကြည့်ရင် “လူအများယုံတာ” ကို “အမှန်” လို့ မှားယူနိုင်တယ်။",
      "Independent thinking ဆိုတာ သူများကိုဘယ်တော့မှမယုံတာမဟုတ်ဘဲ viewpoint တစ်ခုလက်ခံမယ့်အရင် source ဘာလဲ၊ evidence ဘာရှိလဲ၊ explanation တခြားရှိလားဆိုတာမေးတာပါ။",
      "တကယ့် independent thinking ထဲမှာ ကိုယ့်အမြင်ကိုပြောင်းနိုင်မှုလည်းပါတယ်။ Evidence အသစ်ကပိုခိုင်လုံရင် အမြင်ဟောင်းကိုပဲကိုင်ထားတာက independent ဖြစ်တာမဟုတ်ဘဲ stubborn ဖြစ်တာဖြစ်နိုင်တယ်။",
    ],

    keywords: [
      "传播",
      "标题",
      "转发",
      "观点",
      "证据",
      "解释",
      "说服力",
      "坚持",
      "固执",
      "独立",
    ],

    audioUrl: null,
    audioText:
      "互联网让信息传播得越来越快，但速度越快，错误的信息也可能传播得越广。如果我们只看标题、转发次数或者评论数量，就很容易把很多人相信误认为这件事是真的。独立思考并不意味着永远不相信别人，而是知道在接受一个观点以前，应该问几个问题：信息来自哪里？证据是什么？有没有其他解释？真正的独立思考也包括愿意改变自己的看法。如果新的证据比原来的理由更有说服力，坚持旧观点并不能证明一个人独立，反而可能只是固执。",
  },

  {
    id: "hsk7-reading-011",
    level: 7,
    order: 11,
    title: "城市化带来的改变",
    pinyinTitle: "Chéngshìhuà dàilái de gǎibiàn",
    myanmarTitle: "မြို့ပြဖြစ်ထွန်းမှုက ယူလာတဲ့ပြောင်းလဲမှု",
    category: "travel",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "随着越来越多的人从乡村进入城市，城市化已经成为许多国家发展的重要过程。",
      "城市能够提供更多工作机会、教育资源和公共服务，因此吸引年轻人不断进入。",
      "然而，当人口增长速度超过基础设施的发展速度时，住房、交通、环境和公共空间都会出现压力。",
      "城市化也会改变家庭结构和社区关系。过去几代人可能生活在同一个地方，而现在年轻人常常为了工作远离家乡。城市的发展不仅是建筑数量增加，也意味着人与生活方式的重新组织。",
    ],

    pinyinParagraphs: [
      "Suízhe yuèláiyuè duō de rén cóng xiāngcūn jìnrù chéngshì, chéngshìhuà yǐjīng chéngwéi xǔduō guójiā fāzhǎn de zhòngyào guòchéng.",
      "Chéngshì nénggòu tígōng gèng duō gōngzuò jīhuì, jiàoyù zīyuán hé gōnggòng fúwù, yīncǐ xīyǐn niánqīngrén bùduàn jìnrù.",
      "Rán'ér, dāng rénkǒu zēngzhǎng sùdù chāoguò jīchǔ shèshī de fāzhǎn sùdù shí, zhùfáng, jiāotōng, huánjìng hé gōnggòng kōngjiān dōu huì chūxiàn yālì.",
      "Chéngshìhuà yě huì gǎibiàn jiātíng jiégòu hé shèqū guānxì. Guòqù jǐ dài rén kěnéng shēnghuó zài tóng yí ge dìfang, ér xiànzài niánqīngrén chángcháng wèile gōngzuò yuǎnlí jiāxiāng. Chéngshì de fāzhǎn bù jǐn shì jiànzhù shùliàng zēngjiā, yě yìwèizhe rén yǔ shēnghuó fāngshì de chóngxīn zǔzhī.",
    ],

    myanmarParagraphs: [
      "ကျေးလက်ကနေ မြို့ကိုရွှေ့လာသူများလာတာနဲ့ urbanization က နိုင်ငံအများကြီးအတွက် အရေးကြီး development process ဖြစ်လာတယ်။",
      "မြို့မှာ အလုပ်၊ ပညာရေး၊ public service ပိုများလို့ လူငယ်တွေကို ဆွဲဆောင်တယ်။",
      "ဒါပေမယ့် လူဦးရေတိုးနှုန်းက infrastructure ထက်မြန်ရင် housing, traffic, environment နဲ့ public space တွေမှာ ဖိအားဖြစ်လာတယ်။",
      "Urbanization က family structure နဲ့ community relationship ကိုလည်းပြောင်းတယ်။ အရင်က မျိုးဆက်များစွာ တစ်နေရာတည်းနေကြပေမယ့် အခုလူငယ်တွေက အလုပ်ကြောင့်မွေးရပ်မြေကနေဝေးတတ်တယ်။",
    ],

    keywords: [
      "城市化",
      "过程",
      "资源",
      "吸引",
      "人口",
      "基础设施",
      "结构",
      "社区",
      "远离",
      "组织",
    ],

    audioUrl: null,
    audioText:
      "随着越来越多的人从乡村进入城市，城市化已经成为许多国家发展的重要过程。城市能够提供更多工作机会、教育资源和公共服务，因此吸引年轻人不断进入。然而，当人口增长速度超过基础设施的发展速度时，住房、交通、环境和公共空间都会出现压力。城市化也会改变家庭结构和社区关系。过去几代人可能生活在同一个地方，而现在年轻人常常为了工作远离家乡。城市的发展不仅是建筑数量增加，也意味着人与生活方式的重新组织。",
  },

  {
    id: "hsk7-reading-012",
    level: 7,
    order: 12,
    title: "消费与真正的需要",
    pinyinTitle: "Xiāofèi yǔ zhēnzhèng de xūyào",
    myanmarTitle: "သုံးစွဲမှုနဲ့ တကယ့်လိုအပ်ချက်",
    category: "shopping",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "现代消费环境不断提醒我们需要新的东西。新的手机、新的衣服、新的设备，好像每一种商品都在告诉我们：拥有它以后，生活会变得更好。",
      "广告最有效的地方，往往不是让人买原本需要的东西，而是让人产生新的需要。",
      "我以前购物时很少区分“想要”和“需要”。后来才发现，很多当时特别想买的东西，过几个月以后几乎没有使用。",
      "现在买价格比较高的东西以前，我会故意等几天。如果几天以后仍然觉得有必要，再考虑购买。消费当然可以带来快乐，但如果每一次情绪变化都通过购物解决，人就很容易把短暂满足误认为长期幸福。",
    ],

    pinyinParagraphs: [
      "Xiàndài xiāofèi huánjìng bùduàn tíxǐng wǒmen xūyào xīn de dōngxi. Xīn de shǒujī, xīn de yīfu, xīn de shèbèi, hǎoxiàng měi yì zhǒng shāngpǐn dōu zài gàosu wǒmen: yōngyǒu tā yǐhòu, shēnghuó huì biàn de gèng hǎo.",
      "Guǎnggào zuì yǒuxiào de dìfang, wǎngwǎng bú shì ràng rén mǎi yuánběn xūyào de dōngxi, ér shì ràng rén chǎnshēng xīn de xūyào.",
      "Wǒ yǐqián gòuwù shí hěn shǎo qūfēn 'xiǎng yào' hé 'xūyào'. Hòulái cái fāxiàn, hěn duō dāngshí tèbié xiǎng mǎi de dōngxi, guò jǐ ge yuè yǐhòu jīhū méiyǒu shǐyòng.",
      "Xiànzài mǎi jiàgé bǐjiào gāo de dōngxi yǐqián, wǒ huì gùyì děng jǐ tiān. Rúguǒ jǐ tiān yǐhòu réngrán juéde yǒu bìyào, zài kǎolǜ gòumǎi. Xiāofèi dāngrán kěyǐ dàilái kuàilè, dàn rúguǒ měi yí cì qíngxù biànhuà dōu tōngguò gòuwù jiějué, rén jiù hěn róngyì bǎ duǎnzàn mǎnzú wùrènwéi chángqī xìngfú.",
    ],

    myanmarParagraphs: [
      "Modern consumer environment က အသစ်တွေလိုတယ်လို့ အမြဲပြောနေတယ်။ ဖုန်းအသစ်၊ အဝတ်အသစ်၊ device အသစ်ရရင် ဘဝပိုကောင်းမယ်လို့ထင်စေတယ်။",
      "Advertising ရဲ့အားကောင်းဆုံးအပိုင်းက ရှိပြီးသားလိုအပ်ချက်ကိုဖြည့်တာမဟုတ်ဘဲ လိုအပ်ချက်အသစ်ဖန်တီးတာဖြစ်တတ်တယ်။",
      "အရင်က “လိုချင်တာ” နဲ့ “လိုအပ်တာ” မခွဲတတ်ဘူး။ နောက်မှ အရမ်းဝယ်ချင်ခဲ့တဲ့အရာတွေ လအနည်းငယ်ကြာရင် လုံးဝမသုံးတာရှိတယ်ဆိုတာသိလာတယ်။",
      "အခု ဈေးကြီးတဲ့ပစ္စည်းဝယ်မယ့်အရင် ရက်အနည်းငယ်စောင့်တယ်။ စိတ်ခံစားချက်တိုင်းကို shopping နဲ့ဖြေရှင်းရင် short-term satisfaction ကို long-term happiness လို့မှားနိုင်တယ်။",
    ],

    keywords: [
      "消费",
      "设备",
      "商品",
      "广告",
      "产生",
      "区分",
      "故意",
      "购买",
      "短暂",
      "满足",
    ],

    audioUrl: null,
    audioText:
      "现代消费环境不断提醒我们需要新的东西。新的手机、新的衣服、新的设备，好像每一种商品都在告诉我们：拥有它以后，生活会变得更好。广告最有效的地方，往往不是让人买原本需要的东西，而是让人产生新的需要。我以前购物时很少区分想要和需要。后来才发现，很多当时特别想买的东西，过几个月以后几乎没有使用。现在买价格比较高的东西以前，我会故意等几天。如果几天以后仍然觉得有必要，再考虑购买。消费当然可以带来快乐，但如果每一次情绪变化都通过购物解决，人就很容易把短暂满足误认为长期幸福。",
  },

  {
    id: "hsk7-reading-013",
    level: 7,
    order: 13,
    title: "成功背后的代价",
    pinyinTitle: "Chénggōng bèihòu de dàijià",
    myanmarTitle: "အောင်မြင်မှုနောက်က ပေးဆပ်ရမှု",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "我们看到一个人成功时，通常先看到结果：高职位、好收入、优秀的成绩或者令人羡慕的生活。",
      "但结果很少告诉我们一个人为了得到这些东西付出了什么。可能是时间、健康、关系，也可能是很多次失败和长期的不确定。",
      "这并不是说成功一定需要痛苦，而是提醒我们，每一种选择通常都有成本。",
      "因此，在羡慕别人拥有的东西以前，也许应该问自己：如果需要承担同样的代价，我还想要同样的结果吗？真正适合自己的成功，不只是喜欢结果，也能够接受通往结果的过程。",
    ],

    pinyinParagraphs: [
      "Wǒmen kàndào yí ge rén chénggōng shí, tōngcháng xiān kàndào jiéguǒ: gāo zhíwèi, hǎo shōurù, yōuxiù de chéngjì huòzhě lìng rén xiànmù de shēnghuó.",
      "Dàn jiéguǒ hěn shǎo gàosu wǒmen yí ge rén wèile dédào zhèxiē dōngxi fùchū le shénme. Kěnéng shì shíjiān, jiànkāng, guānxì, yě kěnéng shì hěn duō cì shībài hé chángqī de bù quèdìng.",
      "Zhè bìng bú shì shuō chénggōng yídìng xūyào tòngkǔ, ér shì tíxǐng wǒmen, měi yì zhǒng xuǎnzé tōngcháng dōu yǒu chéngběn.",
      "Yīncǐ, zài xiànmù biérén yōngyǒu de dōngxi yǐqián, yěxǔ yīnggāi wèn zìjǐ: rúguǒ xūyào chéngdān tóngyàng de dàijià, wǒ hái xiǎng yào tóngyàng de jiéguǒ ma? Zhēnzhèng shìhé zìjǐ de chénggōng, bù zhǐshì xǐhuan jiéguǒ, yě nénggòu jiēshòu tōngwǎng jiéguǒ de guòchéng.",
    ],

    myanmarParagraphs: [
      "သူတစ်ယောက်အောင်မြင်တာမြင်ရင် position, income, result နဲ့ lifestyle ကိုအရင်မြင်တတ်တယ်။",
      "ဒါပေမယ့် အဲဒီresult ရဖို့ ဘာပေးဆပ်ခဲ့လဲကို မမြင်ရဘူး။ အချိန်၊ ကျန်းမာရေး၊ relationship, failure တွေနဲ့ uncertainty ဖြစ်နိုင်တယ်။",
      "ဒါက success ရဖို့နာကျင်ရမယ်လို့မဆိုလိုဘူး။ Choice တိုင်းမှာ cost တစ်ခုရှိတတ်တယ်လို့ သတိပေးတာပါ။",
      "ဒါကြောင့် သူများရလဒ်ကိုမနာလိုခင် “ဒီ result ရဖို့ သူပေးခဲ့တဲ့ cost တူတူကို ငါလည်းပေးချင်သလား” ဆိုတာမေးသင့်တယ်။ ကိုယ့်နဲ့ကိုက်တဲ့ success ဆိုတာ result ကိုကြိုက်ရုံတင်မဟုတ်ဘဲ process ကိုလည်းလက်ခံနိုင်တာပါ။",
    ],

    keywords: [
      "代价",
      "职位",
      "羡慕",
      "付出",
      "长期",
      "成本",
      "承担",
      "通往",
      "过程",
      "结果",
    ],

    audioUrl: null,
    audioText:
      "我们看到一个人成功时，通常先看到结果：高职位、好收入、优秀的成绩或者令人羡慕的生活。但结果很少告诉我们一个人为了得到这些东西付出了什么。可能是时间、健康、关系，也可能是很多次失败和长期的不确定。这并不是说成功一定需要痛苦，而是提醒我们，每一种选择通常都有成本。因此，在羡慕别人拥有的东西以前，也许应该问自己：如果需要承担同样的代价，我还想要同样的结果吗？真正适合自己的成功，不只是喜欢结果，也能够接受通往结果的过程。",
  },

  {
    id: "hsk7-reading-014",
    level: 7,
    order: 14,
    title: "面对不确定的未来",
    pinyinTitle: "Miànduì bù quèdìng de wèilái",
    myanmarTitle: "မသေချာတဲ့အနာဂတ်ကို ရင်ဆိုင်ခြင်း",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "人往往希望未来是可以预测的。我们做计划、存钱、学习技能，很大一部分原因都是希望减少不确定感。",
      "但生活中有些变化无法提前知道。行业可能改变，公司可能调整，关系可能变化，人的兴趣也可能和以前不同。",
      "以前我遇到不确定的时候，总想尽快找到一个确定答案。后来才发现，有些答案只有时间过去以后才会出现。",
      "现在我更关注自己能控制的部分：保持学习能力、准备一定的储蓄、建立可靠的关系，并训练自己面对变化的能力。我们无法让未来完全确定，但可以让自己更有能力面对不确定。",
    ],

    pinyinParagraphs: [
      "Rén wǎngwǎng xīwàng wèilái shì kěyǐ yùcè de. Wǒmen zuò jìhuà, cún qián, xuéxí jìnéng, hěn dà yí bùfen yuányīn dōu shì xīwàng jiǎnshǎo bù quèdìnggǎn.",
      "Dàn shēnghuó zhōng yǒuxiē biànhuà wúfǎ tíqián zhīdào. Hángyè kěnéng gǎibiàn, gōngsī kěnéng tiáozhěng, guānxì kěnéng biànhuà, rén de xìngqù yě kěnéng hé yǐqián bùtóng.",
      "Yǐqián wǒ yùdào bù quèdìng de shíhou, zǒng xiǎng jǐnkuài zhǎodào yí ge quèdìng dá'àn. Hòulái cái fāxiàn, yǒuxiē dá'àn zhǐyǒu shíjiān guòqù yǐhòu cái huì chūxiàn.",
      "Xiànzài wǒ gèng guānzhù zìjǐ néng kòngzhì de bùfen: bǎochí xuéxí nénglì, zhǔnbèi yídìng de chǔxù, jiànlì kěkào de guānxì, bìng xùnliàn zìjǐ miànduì biànhuà de nénglì. Wǒmen wúfǎ ràng wèilái wánquán quèdìng, dàn kěyǐ ràng zìjǐ gèng yǒu nénglì miànduì bù quèdìng.",
    ],

    myanmarParagraphs: [
      "လူတွေက အနာဂတ်ကိုကြိုခန့်မှန်းနိုင်ချင်တယ်။ Plan ဆွဲ၊ ငွေစု၊ skill သင်တာတွေက uncertainty လျော့ချချင်လို့လည်းဖြစ်တယ်။",
      "ဒါပေမယ့် ပြောင်းလဲမှုတချို့ကို ကြိုမသိနိုင်ဘူး။ Industry, company, relationship နဲ့ ကိုယ့်စိတ်ဝင်စားမှုတောင် ပြောင်းနိုင်တယ်။",
      "အရင်က မသေချာတာတွေ့ရင် အဖြေတိတိကျကျမြန်မြန်ရှာချင်တယ်။ နောက်မှ အဖြေတချို့က အချိန်ကြာမှပဲပေါ်လာတယ်ဆိုတာနားလည်တယ်။",
      "အခု ကိုယ်ထိန်းနိုင်တာကို ပိုအာရုံစိုက်တယ်။ ဆက်သင်နိုင်မှု၊ savings, reliable relationships နဲ့ change ကိုရင်ဆိုင်နိုင်တဲ့ ability တွေပါ။ အနာဂတ်ကိုသေချာမလုပ်နိုင်ပေမယ့် ကိုယ့်ကိုပိုပြင်ဆင်နိုင်တယ်။",
    ],

    keywords: [
      "预测",
      "减少",
      "不确定感",
      "行业",
      "调整",
      "储蓄",
      "可靠",
      "训练",
      "控制",
      "变化",
    ],

    audioUrl: null,
    audioText:
      "人往往希望未来是可以预测的。我们做计划、存钱、学习技能，很大一部分原因都是希望减少不确定感。但生活中有些变化无法提前知道。行业可能改变，公司可能调整，关系可能变化，人的兴趣也可能和以前不同。以前我遇到不确定的时候，总想尽快找到一个确定答案。后来才发现，有些答案只有时间过去以后才会出现。现在我更关注自己能控制的部分：保持学习能力、准备一定的储蓄、建立可靠的关系，并训练自己面对变化的能力。我们无法让未来完全确定，但可以让自己更有能力面对不确定。",
  },

  {
    id: "hsk7-reading-015",
    level: 7,
    order: 15,
    title: "文化差异带来的理解",
    pinyinTitle: "Wénhuà chāyì dàilái de lǐjiě",
    myanmarTitle: "ယဉ်ကျေးမှုကွာခြားမှုကပေးတဲ့ နားလည်မှု",
    category: "travel",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "第一次长期生活在不同文化环境里时，我常常把一些行为理解成“奇怪”。后来我才意识到，所谓奇怪，只是和自己习惯的方式不同。",
      "不同文化对时间、礼貌、个人空间、家庭关系和沟通方式都有不同期待。",
      "如果只用自己熟悉的标准判断别人，就很容易产生误会。真正理解文化差异并不是认为所有做法都一样正确，而是先知道行为背后的背景。",
      "当我们接触更多文化以后，也会开始重新看自己的习惯。有些以前觉得理所当然的事情，其实只是我们从小习惯的一种方式而已。",
    ],

    pinyinParagraphs: [
      "Dì yī cì chángqī shēnghuó zài bùtóng wénhuà huánjìng lǐ shí, wǒ chángcháng bǎ yìxiē xíngwéi lǐjiě chéng 'qíguài'. Hòulái wǒ cái yìshí dào, suǒwèi qíguài, zhǐshì hé zìjǐ xíguàn de fāngshì bùtóng.",
      "Bùtóng wénhuà duì shíjiān, lǐmào, gèrén kōngjiān, jiātíng guānxì hé gōutōng fāngshì dōu yǒu bùtóng qīdài.",
      "Rúguǒ zhǐ yòng zìjǐ shúxī de biāozhǔn pànduàn biérén, jiù hěn róngyì chǎnshēng wùhuì. Zhēnzhèng lǐjiě wénhuà chāyì bìng bú shì rènwéi suǒyǒu zuòfǎ dōu yíyàng zhèngquè, ér shì xiān zhīdào xíngwéi bèihòu de bèijǐng.",
      "Dāng wǒmen jiēchù gèng duō wénhuà yǐhòu, yě huì kāishǐ chóngxīn kàn zìjǐ de xíguàn. Yǒuxiē yǐqián juéde lǐsuǒdāngrán de shìqing, qíshí zhǐshì wǒmen cóngxiǎo xíguàn de yì zhǒng fāngshì éryǐ.",
    ],

    myanmarParagraphs: [
      "မတူတဲ့ယဉ်ကျေးမှုထဲမှာ ပထမဆုံးရေရှည်နေတုန်းက တချို့အပြုအမူတွေကို “ထူးဆန်းတယ်” လို့မြင်တတ်တယ်။ နောက်မှ ကိုယ်သိနေကျနည်းနဲ့မတူတာပဲဆိုတာသိလာတယ်။",
      "ယဉ်ကျေးမှုမတူရင် အချိန်၊ ယဉ်ကျေးမှု၊ personal space, family relationship နဲ့ communication အပေါ်မျှော်လင့်ချက်မတူတတ်တယ်။",
      "ကိုယ့် standard နဲ့ပဲ သူများကိုတိုင်းရင် misunderstanding ဖြစ်လွယ်တယ်။ Culture difference နားလည်တာက အရာအားလုံးမှန်တယ်လို့ပြောတာမဟုတ်ဘဲ နောက်ခံအကြောင်းရင်းကို အရင်နားလည်တာပါ။",
      "ယဉ်ကျေးမှုများများတွေ့ရင် ကိုယ့်habit ကိုလည်း ပြန်ကြည့်လာတယ်။ အရင်က obvious လို့ထင်တာတွေက ကိုယ်ငယ်ငယ်ကတည်းက ရင်းနှီးထားတဲ့နည်းတစ်ခုသာဖြစ်နိုင်တယ်။",
    ],

    keywords: [
      "文化差异",
      "行为",
      "个人空间",
      "期待",
      "标准",
      "误会",
      "背景",
      "接触",
      "理所当然",
      "习惯",
    ],

    audioUrl: null,
    audioText:
      "第一次长期生活在不同文化环境里时，我常常把一些行为理解成奇怪。后来我才意识到，所谓奇怪，只是和自己习惯的方式不同。不同文化对时间、礼貌、个人空间、家庭关系和沟通方式都有不同期待。如果只用自己熟悉的标准判断别人，就很容易产生误会。真正理解文化差异并不是认为所有做法都一样正确，而是先知道行为背后的背景。当我们接触更多文化以后，也会开始重新看自己的习惯。有些以前觉得理所当然的事情，其实只是我们从小习惯的一种方式而已。",
  },

  {
    id: "hsk7-reading-016",
    level: 7,
    order: 16,
    title: "现代人的孤独",
    pinyinTitle: "Xiàndài rén de gūdú",
    myanmarTitle: "ခေတ်သစ်လူသားရဲ့ အထီးကျန်မှု",
    category: "friends",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "现代人似乎比过去更容易联系到别人。手机里有大量联系人，社交平台上也可能有很多朋友。",
      "但是能够联系并不一定等于拥有真正的关系。有些人每天收到很多消息，却没有一个可以认真谈心的人。",
      "孤独也不只是一个人待着。一个人可能生活在人群中，却觉得没有人真正理解自己。",
      "因此，减少孤独不一定意味着认识更多人，而可能意味着建立更深的关系。真正的连接需要时间、信任和愿意展示不完美的一面，而这些东西都很难通过快速交流得到。",
    ],

    pinyinParagraphs: [
      "Xiàndài rén sìhū bǐ guòqù gèng róngyì liánxì dào biérén. Shǒujī lǐ yǒu dàliàng liánxìrén, shèjiāo píngtái shàng yě kěnéng yǒu hěn duō péngyou.",
      "Dànshì nénggòu liánxì bìng bù yídìng děngyú yōngyǒu zhēnzhèng de guānxì. Yǒuxiē rén měitiān shōudào hěn duō xiāoxi, què méiyǒu yí ge kěyǐ rènzhēn tánxīn de rén.",
      "Gūdú yě bù zhǐshì yí ge rén dāizhe. Yí ge rén kěnéng shēnghuó zài rénqún zhōng, què juéde méiyǒu rén zhēnzhèng lǐjiě zìjǐ.",
      "Yīncǐ, jiǎnshǎo gūdú bù yídìng yìwèizhe rènshi gèng duō rén, ér kěnéng yìwèizhe jiànlì gèng shēn de guānxì. Zhēnzhèng de liánjiē xūyào shíjiān, xìnrèn hé yuànyì zhǎnshì bù wánměi de yí miàn, ér zhèxiē dōngxi dōu hěn nán tōngguò kuàisù jiāoliú dédào.",
    ],

    myanmarParagraphs: [
      "ခေတ်သစ်မှာ လူတစ်ယောက်ကိုဆက်သွယ်ဖို့ အရင်ထက်လွယ်တယ်။ ဖုန်းထဲ contact အများကြီး၊ social platform မှာ friend အများကြီးရှိနိုင်တယ်။",
      "ဒါပေမယ့် ဆက်သွယ်နိုင်တာနဲ့ deep relationship ရှိတာမတူဘူး။ နေ့တိုင်း message အများကြီးရပေမယ့် ရင်ဖွင့်ပြောနိုင်တဲ့သူတစ်ယောက်မှမရှိတာလည်းဖြစ်နိုင်တယ်။",
      "Loneliness ဆိုတာ တစ်ယောက်တည်းနေခြင်းတင်မဟုတ်ဘူး။ လူအများကြားမှာနေရင်း ကိုယ့်ကိုဘယ်သူမှတကယ်နားမလည်ဘူးလို့ခံစားတာလည်းဖြစ်တယ်။",
      "ဒါကြောင့် loneliness လျော့ဖို့ လူပိုများများသိဖို့မဟုတ်ဘဲ relationship ပိုနက်ရှိုင်းဖို့လိုနိုင်တယ်။ Deep connection က time, trust နဲ့ imperfect ဖြစ်တာကိုပြနိုင်ခြင်းလိုတယ်။",
    ],

    keywords: [
      "孤独",
      "平台",
      "联系人",
      "谈心",
      "人群",
      "连接",
      "信任",
      "展示",
      "不完美",
      "交流",
    ],

    audioUrl: null,
    audioText:
      "现代人似乎比过去更容易联系到别人。手机里有大量联系人，社交平台上也可能有很多朋友。但是能够联系并不一定等于拥有真正的关系。有些人每天收到很多消息，却没有一个可以认真谈心的人。孤独也不只是一个人待着。一个人可能生活在人群中，却觉得没有人真正理解自己。因此，减少孤独不一定意味着认识更多人，而可能意味着建立更深的关系。真正的连接需要时间、信任和愿意展示不完美的一面，而这些东西都很难通过快速交流得到。",
  },

  {
    id: "hsk7-reading-017",
    level: 7,
    order: 17,
    title: "知识与经验哪个更重要",
    pinyinTitle: "Zhīshi yǔ jīngyàn nǎge gèng zhòngyào",
    myanmarTitle: "ဗဟုသုတနဲ့ အတွေ့အကြုံ ဘယ်ဟာပိုအရေးကြီးလဲ",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "有人认为知识最重要，因为没有理论基础，经验很容易只是重复过去的做法。也有人认为实际经验比书本知识更有价值。",
      "我觉得这两个观点其实并不冲突。知识可以帮助我们理解为什么，经验则让我们知道现实中会发生什么。",
      "只有知识而缺少经验，一个人可能知道很多理论，却不知道如何处理复杂情况。只有经验而缺少知识，也可能一直重复有效但无法解释的方法。",
      "最理想的学习过程，是让知识和经验不断互相修正。理论给经验提供方向，经验又让理论变得更接近现实。",
    ],

    pinyinParagraphs: [
      "Yǒurén rènwéi zhīshi zuì zhòngyào, yīnwèi méiyǒu lǐlùn jīchǔ, jīngyàn hěn róngyì zhǐshì chóngfù guòqù de zuòfǎ. Yě yǒurén rènwéi shíjì jīngyàn bǐ shūběn zhīshi gèng yǒu jiàzhí.",
      "Wǒ juéde zhè liǎng ge guāndiǎn qíshí bìng bù chōngtū. Zhīshi kěyǐ bāngzhù wǒmen lǐjiě wèishénme, jīngyàn zé ràng wǒmen zhīdào xiànshí zhōng huì fāshēng shénme.",
      "Zhǐyǒu zhīshi ér quēshǎo jīngyàn, yí ge rén kěnéng zhīdào hěn duō lǐlùn, què bù zhīdào rúhé chǔlǐ fùzá qíngkuàng. Zhǐyǒu jīngyàn ér quēshǎo zhīshi, yě kěnéng yìzhí chóngfù yǒuxiào dàn wúfǎ jiěshì de fāngfǎ.",
      "Zuì lǐxiǎng de xuéxí guòchéng, shì ràng zhīshi hé jīngyàn bùduàn hùxiāng xiūzhèng. Lǐlùn gěi jīngyàn tígōng fāngxiàng, jīngyàn yòu ràng lǐlùn biàn de gèng jiējìn xiànshí.",
    ],

    myanmarParagraphs: [
      "တချို့က theory foundation မရှိရင် experience က အရင်နည်းကိုထပ်လုပ်တာပဲဖြစ်မယ်လို့ပြောပြီး knowledge အရေးကြီးတယ်လို့ယူဆတယ်။ တချို့က practical experience ပိုတန်ဖိုးရှိတယ်လို့ပြောတယ်။",
      "ကျွန်မအမြင်မှာ နှစ်ခုက မဆန့်ကျင်ဘူး။ Knowledge က “ဘာကြောင့်” ကိုနားလည်စေပြီး experience က “တကယ်ဖြစ်တဲ့အခါ ဘာဖြစ်မလဲ” ကိုသိစေတယ်။",
      "Knowledge ပဲရှိပြီး experience မရှိရင် theory သိပေမယ့် complex situation ကိုမဖြေရှင်းတတ်နိုင်ဘူး။ Experience ပဲရှိရင်လည်း အလုပ်ဖြစ်ပေမယ့် ဘာကြောင့်အလုပ်ဖြစ်လဲ မရှင်းနိုင်တတ်ဘူး။",
      "အကောင်းဆုံး learning process က knowledge နဲ့ experience တစ်ခုကိုတစ်ခု ပြန်ပြင်ပေးတာပါ။",
    ],

    keywords: [
      "知识",
      "经验",
      "理论",
      "基础",
      "实际",
      "冲突",
      "缺少",
      "修正",
      "提供",
      "接近",
    ],

    audioUrl: null,
    audioText:
      "有人认为知识最重要，因为没有理论基础，经验很容易只是重复过去的做法。也有人认为实际经验比书本知识更有价值。我觉得这两个观点其实并不冲突。知识可以帮助我们理解为什么，经验则让我们知道现实中会发生什么。只有知识而缺少经验，一个人可能知道很多理论，却不知道如何处理复杂情况。只有经验而缺少知识，也可能一直重复有效但无法解释的方法。最理想的学习过程，是让知识和经验不断互相修正。理论给经验提供方向，经验又让理论变得更接近现实。",
  },

  {
    id: "hsk7-reading-018",
    level: 7,
    order: 18,
    title: "变化中的职业世界",
    pinyinTitle: "Biànhuà zhōng de zhíyè shìjiè",
    myanmarTitle: "ပြောင်းလဲနေတဲ့ အလုပ်အကိုင်ကမ္ဘာ",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "过去很多人进入一个行业以后，会在同一个领域工作几十年。但今天，职业道路越来越少是一条直线。",
      "技术变化、经济环境和个人兴趣都可能让一个人在职业生涯中多次转换方向。",
      "这种变化让职业规划变得更困难，但也提供了更多可能。过去的经验不一定因为换行业就完全失去价值，很多能力可以被带到新的领域。",
      "未来也许更重要的不是找到一份“永远不会变化”的工作，而是建立可以转移的能力，例如学习、沟通、分析和解决问题。职业稳定的定义本身正在改变。",
    ],

    pinyinParagraphs: [
      "Guòqù hěn duō rén jìnrù yí ge hángyè yǐhòu, huì zài tóng yí ge lǐngyù gōngzuò jǐshí nián. Dàn jīntiān, zhíyè dàolù yuèláiyuè shǎo shì yì tiáo zhíxiàn.",
      "Jìshù biànhuà, jīngjì huánjìng hé gèrén xìngqù dōu kěnéng ràng yí ge rén zài zhíyè shēngyá zhōng duō cì zhuǎnhuàn fāngxiàng.",
      "Zhè zhǒng biànhuà ràng zhíyè guīhuà biàn de gèng kùnnan, dàn yě tígōng le gèng duō kěnéng. Guòqù de jīngyàn bù yídìng yīnwèi huàn hángyè jiù wánquán shīqù jiàzhí, hěn duō nénglì kěyǐ bèi dài dào xīn de lǐngyù.",
      "Wèilái yěxǔ gèng zhòngyào de bú shì zhǎodào yí fèn 'yǒngyuǎn bú huì biànhuà' de gōngzuò, ér shì jiànlì kěyǐ zhuǎnyí de nénglì, lìrú xuéxí, gōutōng, fēnxī hé jiějué wèntí. Zhíyè wěndìng de dìngyì běnshēn zhèngzài gǎibiàn.",
    ],

    myanmarParagraphs: [
      "အရင်က industry တစ်ခုဝင်ပြီး နယ်ပယ်တစ်ခုတည်းမှာ ဆယ်စုနှစ်တွေကြာလုပ်တာများတယ်။ အခု career path က straight line မဟုတ်တော့ဘူး။",
      "Technology, economy နဲ့ personal interest ကြောင့် career တစ်လျှောက် direction အကြိမ်ကြိမ်ပြောင်းနိုင်တယ်။",
      "ဒါက career planning ကိုခက်စေပေမယ့် possibility ပိုပေးတယ်။ Industry ပြောင်းတာနဲ့ အရင် experience အကုန်တန်ဖိုးမပျောက်ဘူး။ Transferable skill တွေရှိတယ်။",
      "အနာဂတ်မှာ “ဘယ်တော့မှမပြောင်းတဲ့အလုပ်” ရဖို့ထက် learning, communication, analysis နဲ့ problem-solving လို transferable abilities တည်ဆောက်တာပိုအရေးကြီးလာနိုင်တယ်။",
    ],

    keywords: [
      "职业",
      "直线",
      "生涯",
      "转换",
      "规划",
      "领域",
      "转移",
      "分析",
      "定义",
      "稳定",
    ],

    audioUrl: null,
    audioText:
      "过去很多人进入一个行业以后，会在同一个领域工作几十年。但今天，职业道路越来越少是一条直线。技术变化、经济环境和个人兴趣都可能让一个人在职业生涯中多次转换方向。这种变化让职业规划变得更困难，但也提供了更多可能。过去的经验不一定因为换行业就完全失去价值，很多能力可以被带到新的领域。未来也许更重要的不是找到一份永远不会变化的工作，而是建立可以转移的能力，例如学习、沟通、分析和解决问题。职业稳定的定义本身正在改变。",
  },

  {
    id: "hsk7-reading-019",
    level: 7,
    order: 19,
    title: "我们为什么需要阅读",
    pinyinTitle: "Wǒmen wèishénme xūyào yuèdú",
    myanmarTitle: "ဘာကြောင့် စာဖတ်ဖို့လိုအပ်သလဲ",
    category: "school",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "短视频和快速信息越来越普遍以后，有人开始问：既然几分钟就可以知道一本书的主要内容，我们为什么还需要花几个小时阅读？",
      "如果阅读的目标只是获得结论，那么摘要当然效率更高。",
      "但一本书的价值常常不只在结论。作者如何一步一步建立观点、提供例子、处理反对意见，这个过程本身也是思考训练。",
      "长时间阅读还要求注意力持续停留在同一个主题上。在信息不断打断我们的时代，这种能力本身可能越来越珍贵。阅读并不是最快获得信息的方式，却可能是训练深度思考的一种方式。",
    ],

    pinyinParagraphs: [
      "Duǎn shìpín hé kuàisù xìnxī yuèláiyuè pǔbiàn yǐhòu, yǒurén kāishǐ wèn: jìrán jǐ fēnzhōng jiù kěyǐ zhīdào yì běn shū de zhǔyào nèiróng, wǒmen wèishénme hái xūyào huā jǐ ge xiǎoshí yuèdú?",
      "Rúguǒ yuèdú de mùbiāo zhǐshì huòdé jiélùn, nàme zhāiyào dāngrán xiàolǜ gèng gāo.",
      "Dàn yì běn shū de jiàzhí chángcháng bù zhǐ zài jiélùn. Zuòzhě rúhé yí bù yí bù jiànlì guāndiǎn, tígōng lìzi, chǔlǐ fǎnduì yìjiàn, zhège guòchéng běnshēn yě shì sīkǎo xùnliàn.",
      "Cháng shíjiān yuèdú hái yāoqiú zhùyìlì chíxù tíngliú zài tóng yí ge zhǔtí shàng. Zài xìnxī bùduàn dǎduàn wǒmen de shídài, zhè zhǒng nénglì běnshēn kěnéng yuèláiyuè zhēnguì. Yuèdú bìng bú shì zuì kuài huòdé xìnxī de fāngshì, què kěnéng shì xùnliàn shēndù sīkǎo de yì zhǒng fāngshì.",
    ],

    myanmarParagraphs: [
      "Short video နဲ့ quick information များလာတော့ စာအုပ်တစ်အုပ်ရဲ့ summary ကို မိနစ်နည်းနည်းနဲ့သိနိုင်ရင် ဘာကြောင့် နာရီများများဖတ်ရမလဲဆိုတာ လူတွေမေးလာတယ်။",
      "Reading ရဲ့ရည်ရွယ်ချက်က conclusion သိဖို့ပဲဆိုရင် summary က ပိုမြန်တယ်။",
      "ဒါပေမယ့် စာအုပ်တန်ဖိုးက conclusion တင်မဟုတ်ဘူး။ Author က argument ဘယ်လိုတည်ဆောက်လဲ၊ example ဘယ်လိုပေးလဲ၊ opposing view ကိုဘယ်လိုဖြေရှင်းလဲဆိုတဲ့ process ကလည်း thinking training ဖြစ်တယ်။",
      "Long-form reading က attention ကို topic တစ်ခုတည်းပေါ်အချိန်ကြာကြာထားဖို့လိုတယ်။ Information အမြဲ interrupt လုပ်နေတဲ့ခေတ်မှာ ဒီ skill ကပိုတန်ဖိုးရှိလာနိုင်တယ်။",
    ],

    keywords: [
      "阅读",
      "摘要",
      "结论",
      "作者",
      "反对",
      "训练",
      "持续",
      "打断",
      "珍贵",
      "深度",
    ],

    audioUrl: null,
    audioText:
      "短视频和快速信息越来越普遍以后，有人开始问：既然几分钟就可以知道一本书的主要内容，我们为什么还需要花几个小时阅读？如果阅读的目标只是获得结论，那么摘要当然效率更高。但一本书的价值常常不只在结论。作者如何一步一步建立观点、提供例子、处理反对意见，这个过程本身也是思考训练。长时间阅读还要求注意力持续停留在同一个主题上。在信息不断打断我们的时代，这种能力本身可能越来越珍贵。阅读并不是最快获得信息的方式，却可能是训练深度思考的一种方式。",
  },

  {
    id: "hsk7-reading-020",
    level: 7,
    order: 20,
    title: "如何定义更好的生活",
    pinyinTitle: "Rúhé dìngyì gèng hǎo de shēnghuó",
    myanmarTitle: "ပိုကောင်းတဲ့ဘဝကို ဘယ်လိုသတ်မှတ်မလဲ",
    category: "daily-life",
    difficulty: "hard",
    estimatedMinutes: 8,

    paragraphs: [
      "我们很容易用可以比较的东西来判断生活好不好：收入多少、房子多大、职位多高、去了多少国家。",
      "这些标准并不是完全没有意义，因为物质条件确实会影响生活质量。",
      "但当基本需要已经得到满足以后，更多并不一定永远等于更好。一个人也许拥有更高收入，却没有时间；拥有更大的房子，却很少和重要的人一起生活。",
      "因此，我现在更愿意从几个方面看生活：身体是否健康，时间是否有一定自由，关系是否稳定，做的事情是否和自己的价值观接近。更好的生活可能不是拥有越来越多，而是越来越清楚哪些东西值得留下。",
    ],

    pinyinParagraphs: [
      "Wǒmen hěn róngyì yòng kěyǐ bǐjiào de dōngxi lái pànduàn shēnghuó hǎo bù hǎo: shōurù duōshao, fángzi duō dà, zhíwèi duō gāo, qù le duōshao guójiā.",
      "Zhèxiē biāozhǔn bìng bú shì wánquán méiyǒu yìyì, yīnwèi wùzhì tiáojiàn quèshí huì yǐngxiǎng shēnghuó zhìliàng.",
      "Dàn dāng jīběn xūyào yǐjīng dédào mǎnzú yǐhòu, gèng duō bìng bù yídìng yǒngyuǎn děngyú gèng hǎo. Yí ge rén yěxǔ yōngyǒu gèng gāo shōurù, què méiyǒu shíjiān; yōngyǒu gèng dà de fángzi, què hěn shǎo hé zhòngyào de rén yìqǐ shēnghuó.",
      "Yīncǐ, wǒ xiànzài gèng yuànyì cóng jǐ ge fāngmiàn kàn shēnghuó: shēntǐ shìfǒu jiànkāng, shíjiān shìfǒu yǒu yídìng zìyóu, guānxì shìfǒu wěndìng, zuò de shìqing shìfǒu hé zìjǐ de jiàzhíguān jiējìn. Gèng hǎo de shēnghuó kěnéng bú shì yōngyǒu yuèláiyuè duō, ér shì yuèláiyuè qīngchu nǎxiē dōngxi zhíde liúxià.",
    ],

    myanmarParagraphs: [
      "ဘဝကောင်းမကောင်းကို ဝင်ငွေ၊ အိမ်အရွယ်အစား၊ position, သွားဖူးတဲ့နိုင်ငံအရေအတွက်လို တိုင်းလို့ရတာတွေနဲ့ဆုံးဖြတ်လွယ်တယ်။",
      "ဒီ standard တွေက လုံးဝအဓိပ္ပာယ်မရှိတာမဟုတ်ဘူး။ Material condition က quality of life ကိုတကယ်သက်ရောက်တယ်။",
      "ဒါပေမယ့် basic needs ပြည့်ပြီးနောက် “ပိုများတာ” က “ပိုကောင်းတာ” နဲ့အမြဲမတူဘူး။ ဝင်ငွေများပေမယ့် အချိန်မရှိနိုင်တယ်။ အိမ်ကြီးပေမယ့် အရေးကြီးတဲ့လူတွေနဲ့အချိန်မကုန်နိုင်တယ်။",
      "ဒါကြောင့် အခုတော့ ကျန်းမာရေး၊ အချိန်လွတ်လပ်မှု၊ relationship stability နဲ့ ကိုယ့်တန်ဖိုးတွေနဲ့ ကိုက်ညီတဲ့အလုပ်လုပ်နေလားကို ပိုကြည့်တယ်။ Better life ဆိုတာ ပိုများလာခြင်းထက် ဘာကိုထိန်းထားသင့်လဲ ပိုရှင်းလာခြင်းဖြစ်နိုင်တယ်။",
    ],

    keywords: [
      "定义",
      "物质",
      "条件",
      "质量",
      "满足",
      "自由",
      "稳定",
      "价值观",
      "接近",
      "留下",
    ],

    audioUrl: null,
    audioText:
      "我们很容易用可以比较的东西来判断生活好不好：收入多少、房子多大、职位多高、去了多少国家。这些标准并不是完全没有意义，因为物质条件确实会影响生活质量。但当基本需要已经得到满足以后，更多并不一定永远等于更好。一个人也许拥有更高收入，却没有时间；拥有更大的房子，却很少和重要的人一起生活。因此，我现在更愿意从几个方面看生活：身体是否健康，时间是否有一定自由，关系是否稳定，做的事情是否和自己的价值观接近。更好的生活可能不是拥有越来越多，而是越来越清楚哪些东西值得留下。",
  },
];

export function getHsk7ReadingSourceStories() {
  return [...HSK7_READING_STORIES].sort(
    (a, b) => a.order - b.order,
  );
}