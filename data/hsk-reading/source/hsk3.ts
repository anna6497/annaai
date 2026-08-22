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

export const HSK3_READING_STORIES:
  HskReadingStorySource[] = [
  {
    id: "hsk3-reading-001",
    level: 3,
    order: 1,
    title: "第一次参加中文活动",
    pinyinTitle: "Dì yī cì cānjiā Zhōngwén huódòng",
    myanmarTitle: "ပထမဆုံး တရုတ်စာလှုပ်ရှားမှုတက်ခြင်း",
    category: "school",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "上个星期，学校举行了一个中文活动。老师说参加活动可以练习口语，所以我和两个同学一起报名了。活动开始以前，我有一点紧张，因为这是我第一次在很多人面前说中文。",
      "活动里有很多不同的游戏。第一个游戏是用中文介绍自己，第二个游戏是两个人一起完成一个小任务。我开始的时候说得比较慢，但是后来发现大家都很友好，所以我慢慢放松了。",
      "最后，我们的小组还得到了一个小奖品。虽然我说中文的时候还有一些错误，但是老师说我比以前进步了很多。那天以后，我觉得参加这样的活动真的很有帮助。",
    ],

    pinyinParagraphs: [
      "Shàng ge xīngqī, xuéxiào jǔxíng le yí ge Zhōngwén huódòng. Lǎoshī shuō cānjiā huódòng kěyǐ liànxí kǒuyǔ, suǒyǐ wǒ hé liǎng ge tóngxué yìqǐ bàomíng le. Huódòng kāishǐ yǐqián, wǒ yǒu yìdiǎn jǐnzhāng, yīnwèi zhè shì wǒ dì yī cì zài hěn duō rén miànqián shuō Zhōngwén.",
      "Huódòng lǐ yǒu hěn duō bùtóng de yóuxì. Dì yī ge yóuxì shì yòng Zhōngwén jièshào zìjǐ, dì èr ge yóuxì shì liǎng ge rén yìqǐ wánchéng yí ge xiǎo rènwu. Wǒ kāishǐ de shíhou shuō de bǐjiào màn, dànshì hòulái fāxiàn dàjiā dōu hěn yǒuhǎo, suǒyǐ wǒ mànmàn fàngsōng le.",
      "Zuìhòu, wǒmen de xiǎozǔ hái dédào le yí ge xiǎo jiǎngpǐn. Suīrán wǒ shuō Zhōngwén de shíhou hái yǒu yìxiē cuòwù, dànshì lǎoshī shuō wǒ bǐ yǐqián jìnbù le hěn duō. Nà tiān yǐhòu, wǒ juéde cānjiā zhèyàng de huódòng zhēnde hěn yǒu bāngzhù.",
    ],

    myanmarParagraphs: [
      "ပြီးခဲ့တဲ့အပတ်က ကျောင်းမှာ တရုတ်စာလှုပ်ရှားမှုတစ်ခုလုပ်တယ်။ ဆရာက အဲဒီလှုပ်ရှားမှုမှာ ပါဝင်ရင် စကားပြောလေ့ကျင့်လို့ရတယ်လို့ပြောလို့ ကျွန်မက အတန်းဖော်နှစ်ယောက်နဲ့အတူ စာရင်းပေးခဲ့တယ်။ လူအများရှေ့မှာ ပထမဆုံး တရုတ်လိုပြောရမှာမို့ အစမှာ နည်းနည်းစိတ်လှုပ်ရှားတယ်။",
      "လှုပ်ရှားမှုထဲမှာ game အမျိုးမျိုးရှိတယ်။ ပထမ game က တရုတ်လို ကိုယ့်ကိုယ်ကိုမိတ်ဆက်ရတာဖြစ်ပြီး ဒုတိယ game က လူနှစ်ယောက်အတူ task သေးသေးတစ်ခုလုပ်ရတာပါ။ အစမှာ နှေးနှေးပြောပေမယ့် လူအားလုံးဖော်ရွေလို့ နောက်ပိုင်းတဖြည်းဖြည်း စိတ်လျော့သွားတယ်။",
      "နောက်ဆုံး ကျွန်မတို့အဖွဲ့က ဆုသေးသေးတစ်ခုရတယ်။ တရုတ်လိုပြောတဲ့အချိန် အမှားတချို့ရှိပေမယ့် ဆရာက အရင်ထက်တိုးတက်လာတယ်လို့ပြောတယ်။ အဲဒီနေ့နောက်ပိုင်း ဒီလိုလှုပ်ရှားမှုတွေက တကယ်အသုံးဝင်တယ်လို့ခံစားရတယ်။",
    ],

    keywords: [
      "参加",
      "活动",
      "练习",
      "口语",
      "报名",
      "紧张",
      "介绍",
      "完成",
      "任务",
      "进步",
      "帮助",
    ],

    audioUrl: null,
    audioText:
      "上个星期，学校举行了一个中文活动。老师说参加活动可以练习口语，所以我和两个同学一起报名了。活动开始以前，我有一点紧张，因为这是我第一次在很多人面前说中文。活动里有很多不同的游戏。第一个游戏是用中文介绍自己，第二个游戏是两个人一起完成一个小任务。我开始的时候说得比较慢，但是后来发现大家都很友好，所以我慢慢放松了。最后，我们的小组还得到了一个小奖品。虽然我说中文的时候还有一些错误，但是老师说我比以前进步了很多。那天以后，我觉得参加这样的活动真的很有帮助。",
  },

  {
    id: "hsk3-reading-002",
    level: 3,
    order: 2,
    title: "找新工作的经历",
    pinyinTitle: "Zhǎo xīn gōngzuò de jīnglì",
    myanmarTitle: "အလုပ်အသစ်ရှာခဲ့တဲ့အတွေ့အကြုံ",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "去年年底，我决定找一份新的工作。以前的工作虽然比较稳定，但是离家很远，而且每天都要加班，所以我想换一个更适合自己的工作。",
      "我先在网上看了很多工作信息，然后准备了一份新的简历。过了几天，有一家公司给我打电话，让我去参加面试。面试以前，我在家练习了很多次，也准备了一些常见的问题。",
      "面试那天，我还是有一点紧张，但是经理很友好。我们谈了我的工作经验，也谈了我以后想学习的东西。一个星期以后，公司通知我被录取了。那一刻，我觉得之前的准备都没有白做。",
    ],

    pinyinParagraphs: [
      "Qùnián niándǐ, wǒ juédìng zhǎo yí fèn xīn de gōngzuò. Yǐqián de gōngzuò suīrán bǐjiào wěndìng, dànshì lí jiā hěn yuǎn, érqiě měitiān dōu yào jiābān, suǒyǐ wǒ xiǎng huàn yí ge gèng shìhé zìjǐ de gōngzuò.",
      "Wǒ xiān zài wǎngshàng kàn le hěn duō gōngzuò xìnxī, ránhòu zhǔnbèi le yí fèn xīn de jiǎnlì. Guò le jǐ tiān, yǒu yì jiā gōngsī gěi wǒ dǎ diànhuà, ràng wǒ qù cānjiā miànshì. Miànshì yǐqián, wǒ zài jiā liànxí le hěn duō cì, yě zhǔnbèi le yìxiē chángjiàn de wèntí.",
      "Miànshì nà tiān, wǒ háishi yǒu yìdiǎn jǐnzhāng, dànshì jīnglǐ hěn yǒuhǎo. Wǒmen tán le wǒ de gōngzuò jīngyàn, yě tán le wǒ yǐhòu xiǎng xuéxí de dōngxi. Yí ge xīngqī yǐhòu, gōngsī tōngzhī wǒ bèi lùqǔ le. Nà yí kè, wǒ juéde zhīqián de zhǔnbèi dōu méiyǒu bái zuò.",
    ],

    myanmarParagraphs: [
      "မနှစ်ကုန်လောက်မှာ အလုပ်အသစ်ရှာဖို့ဆုံးဖြတ်တယ်။ အရင်အလုပ်က တည်ငြိမ်ပေမယ့် အိမ်နဲ့ဝေးပြီး နေ့တိုင်း overtime လုပ်ရလို့ ကိုယ့်အတွက်ပိုသင့်တော်တဲ့အလုပ်ကို ပြောင်းချင်လာတယ်။",
      "အရင် online မှာ အလုပ်အချက်အလက်တွေကြည့်ပြီး CV အသစ်ပြင်တယ်။ ရက်အနည်းငယ်ကြာတော့ ကုမ္ပဏီတစ်ခုက ဖုန်းခေါ်ပြီး interview လာဖို့ပြောတယ်။ Interview မတိုင်ခင် အိမ်မှာ အကြိမ်ကြိမ်လေ့ကျင့်ပြီး မေးလေ့ရှိတဲ့မေးခွန်းတွေကိုလည်းပြင်ဆင်ထားတယ်။",
      "Interview နေ့မှာ နည်းနည်းစိတ်လှုပ်ရှားပေမယ့် manager ကဖော်ရွေတယ်။ အလုပ်အတွေ့အကြုံနဲ့ နောက်ပိုင်းသင်ချင်တာတွေကိုပြောကြတယ်။ တစ်ပတ်ကြာတော့ အလုပ်ရပြီလို့ အကြောင်းကြားလာတယ်။ အရင်ပြင်ဆင်ခဲ့တာတွေ မပျက်စီးခဲ့ဘူးလို့ခံစားရတယ်။",
    ],

    keywords: [
      "工作",
      "稳定",
      "加班",
      "适合",
      "信息",
      "简历",
      "面试",
      "经理",
      "经验",
      "通知",
      "准备",
    ],

    audioUrl: null,
    audioText:
      "去年年底，我决定找一份新的工作。以前的工作虽然比较稳定，但是离家很远，而且每天都要加班，所以我想换一个更适合自己的工作。我先在网上看了很多工作信息，然后准备了一份新的简历。过了几天，有一家公司给我打电话，让我去参加面试。面试以前，我在家练习了很多次，也准备了一些常见的问题。面试那天，我还是有一点紧张，但是经理很友好。我们谈了我的工作经验，也谈了我以后想学习的东西。一个星期以后，公司通知我被录取了。那一刻，我觉得之前的准备都没有白做。",
  },

  {
    id: "hsk3-reading-003",
    level: 3,
    order: 3,
    title: "周末去郊外",
    pinyinTitle: "Zhōumò qù jiāowài",
    myanmarTitle: "ပိတ်ရက် မြို့ပြင်သွားခြင်း",
    category: "travel",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "这个周末天气很好，我和几个朋友决定去郊外走走。我们平时都在城市里工作，很少有机会看到山和河，所以大家都很期待这次短途旅行。",
      "早上七点，我们在车站见面，然后一起坐车出发。一个多小时以后，我们到了目的地。那里空气很新鲜，也很安静。我们先沿着小路走了一会儿，然后在河边休息。",
      "中午，我们拿出自己带的食物一起吃。下午，我们还拍了很多照片。回到城市的时候虽然有一点累，但是大家都说以后应该常常出来走走。",
    ],

    pinyinParagraphs: [
      "Zhège zhōumò tiānqì hěn hǎo, wǒ hé jǐ ge péngyou juédìng qù jiāowài zǒuzou. Wǒmen píngshí dōu zài chéngshì lǐ gōngzuò, hěn shǎo yǒu jīhuì kàndào shān hé hé, suǒyǐ dàjiā dōu hěn qīdài zhè cì duǎntú lǚxíng.",
      "Zǎoshang qī diǎn, wǒmen zài chēzhàn jiànmiàn, ránhòu yìqǐ zuò chē chūfā. Yí ge duō xiǎoshí yǐhòu, wǒmen dào le mùdìdì. Nàli kōngqì hěn xīnxiān, yě hěn ānjìng. Wǒmen xiān yánzhe xiǎolù zǒu le yíhuìr, ránhòu zài hébiān xiūxi.",
      "Zhōngwǔ, wǒmen ná chū zìjǐ dài de shíwù yìqǐ chī. Xiàwǔ, wǒmen hái pāi le hěn duō zhàopiàn. Huídào chéngshì de shíhou suīrán yǒu yìdiǎn lèi, dànshì dàjiā dōu shuō yǐhòu yīnggāi chángcháng chūlái zǒuzou.",
    ],

    myanmarParagraphs: [
      "ဒီပိတ်ရက် ရာသီဥတုကောင်းလို့ သူငယ်ချင်းတချို့နဲ့ မြို့ပြင်ထွက်လည်ဖို့ဆုံးဖြတ်တယ်။ နေ့တိုင်း မြို့ထဲမှာအလုပ်လုပ်ရလို့ တောင်တွေ၊ မြစ်တွေကြည့်ရတဲ့အခွင့်အရေးနည်းတယ်။ ဒါကြောင့် အားလုံးခရီးကို စိတ်လှုပ်ရှားနေကြတယ်။",
      "မနက် ၇ နာရီမှာ ဘူတာမှာတွေ့ပြီး အတူကားစီးထွက်ကြတယ်။ တစ်နာရီကျော်ကြာတော့ ရောက်တယ်။ အဲဒီနေရာက လေကောင်းပြီး တိတ်ဆိတ်တယ်။ လမ်းသေးသေးတစ်လျှောက် လမ်းလျှောက်ပြီး မြစ်ဘေးမှာ အနားယူကြတယ်။",
      "နေ့လယ်မှာ ကိုယ်စီယူလာတဲ့အစားအစာတွေ အတူစားတယ်။ ညနေပိုင်း ဓာတ်ပုံတွေလည်း အများကြီးရိုက်တယ်။ မြို့ပြန်ရောက်တော့ ပင်ပန်းပေမယ့် နောက်ပိုင်း ဒီလိုခရီးတွေ မကြာခဏသွားသင့်တယ်လို့ အားလုံးပြောကြတယ်။",
    ],

    keywords: [
      "周末",
      "郊外",
      "城市",
      "机会",
      "旅行",
      "车站",
      "出发",
      "空气",
      "安静",
      "河边",
      "照片",
    ],

    audioUrl: null,
    audioText:
      "这个周末天气很好，我和几个朋友决定去郊外走走。我们平时都在城市里工作，很少有机会看到山和河，所以大家都很期待这次短途旅行。早上七点，我们在车站见面，然后一起坐车出发。一个多小时以后，我们到了目的地。那里空气很新鲜，也很安静。我们先沿着小路走了一会儿，然后在河边休息。中午，我们拿出自己带的食物一起吃。下午，我们还拍了很多照片。回到城市的时候虽然有一点累，但是大家都说以后应该常常出来走走。",
  },

  {
    id: "hsk3-reading-004",
    level: 3,
    order: 4,
    title: "我的新邻居",
    pinyinTitle: "Wǒ de xīn línjū",
    myanmarTitle: "ကျွန်မရဲ့ အိမ်နီးချင်းအသစ်",
    category: "friends",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "上个月，我家旁边搬来了一位新邻居。她叫丽丽，和我年龄差不多。第一次见面的时候，她正在搬很多箱子，我就过去帮了她一下。",
      "后来我们慢慢熟悉了。她也喜欢喝咖啡和学习语言，所以周末有时候会来我家聊天。她刚搬来的时候不太认识附近的地方，我就带她去了市场、超市和车站。",
      "现在我们已经成了很好的朋友。有时候我工作忙，她还会帮我拿快递。我觉得有一个友好的邻居，生活真的方便很多。",
    ],

    pinyinParagraphs: [
      "Shàng ge yuè, wǒ jiā pángbiān bān lái le yí wèi xīn línjū. Tā jiào Lìli, hé wǒ niánlíng chàbuduō. Dì yī cì jiànmiàn de shíhou, tā zhèngzài bān hěn duō xiāngzi, wǒ jiù guòqù bāng le tā yíxià.",
      "Hòulái wǒmen mànmàn shúxī le. Tā yě xǐhuan hē kāfēi hé xuéxí yǔyán, suǒyǐ zhōumò yǒu shíhou huì lái wǒ jiā liáotiān. Tā gāng bān lái de shíhou bú tài rènshi fùjìn de dìfang, wǒ jiù dài tā qù le shìchǎng, chāoshì hé chēzhàn.",
      "Xiànzài wǒmen yǐjīng chéng le hěn hǎo de péngyou. Yǒu shíhou wǒ gōngzuò máng, tā hái huì bāng wǒ ná kuàidì. Wǒ juéde yǒu yí ge yǒuhǎo de línjū, shēnghuó zhēnde fāngbiàn hěn duō.",
    ],

    myanmarParagraphs: [
      "ပြီးခဲ့တဲ့လက ကျွန်မတို့အိမ်ဘေးကို အိမ်နီးချင်းအသစ်တစ်ယောက်ပြောင်းလာတယ်။ သူ့နာမည် Lili ဖြစ်ပြီး အသက်ကလည်းကျွန်မနဲ့မတိမ်းမယိမ်းပါ။ ပထမဆုံးတွေ့တုန်း ပစ္စည်းသေတ္တာတွေအများကြီးရွှေ့နေလို့ သွားကူပေးခဲ့တယ်။",
      "နောက်ပိုင်း တဖြည်းဖြည်းရင်းနှီးလာတယ်။ သူကလည်း ကော်ဖီသောက်တာနဲ့ ဘာသာစကားလေ့လာတာကြိုက်တယ်။ ပိတ်ရက်မှာ တစ်ခါတလေ အိမ်လာစကားပြောတယ်။ ဒီနေရာအသစ်ကို မသိသေးလို့ ဈေး၊ supermarket နဲ့ ဘူတာတွေကို လိုက်ပြခဲ့တယ်။",
      "အခုတော့ သူငယ်ချင်းကောင်းတွေဖြစ်နေပြီ။ တစ်ခါတလေ ကျွန်မအလုပ်များရင် package တွေတောင် ကူယူပေးတယ်။ ဖော်ရွေတဲ့အိမ်နီးချင်းတစ်ယောက်ရှိရင် နေ့စဉ်ဘဝက ပိုအဆင်ပြေတယ်လို့ ခံစားရတယ်။",
    ],

    keywords: [
      "邻居",
      "搬家",
      "年龄",
      "箱子",
      "熟悉",
      "语言",
      "附近",
      "市场",
      "快递",
      "方便",
    ],

    audioUrl: null,
    audioText:
      "上个月，我家旁边搬来了一位新邻居。她叫丽丽，和我年龄差不多。第一次见面的时候，她正在搬很多箱子，我就过去帮了她一下。后来我们慢慢熟悉了。她也喜欢喝咖啡和学习语言，所以周末有时候会来我家聊天。她刚搬来的时候不太认识附近的地方，我就带她去了市场、超市和车站。现在我们已经成了很好的朋友。有时候我工作忙，她还会帮我拿快递。我觉得有一个友好的邻居，生活真的方便很多。",
  },

  {
    id: "hsk3-reading-005",
    level: 3,
    order: 5,
    title: "忘记带钥匙",
    pinyinTitle: "Wàngjì dài yàoshi",
    myanmarTitle: "သော့ယူဖို့ မေ့သွားခြင်း",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "昨天下班以后，我回到家门口，准备开门的时候，突然发现包里没有钥匙。我把包里的东西全都拿出来找了一遍，还是没有找到。",
      "我想了很久，终于想起来早上换了一个包，钥匙可能还放在旧包里。可是家里没有人，我也进不去，只好给妹妹打电话。",
      "妹妹还要一个小时才能回来，所以我先去附近的咖啡店等她。虽然这件事有一点麻烦，但是也提醒了我，以后出门以前一定要检查手机、钱包和钥匙。",
    ],

    pinyinParagraphs: [
      "Zuótiān xiàbān yǐhòu, wǒ huídào jiā ménkǒu, zhǔnbèi kāimén de shíhou, tūrán fāxiàn bāo lǐ méiyǒu yàoshi. Wǒ bǎ bāo lǐ de dōngxi quán dōu ná chūlái zhǎo le yí biàn, háishi méiyǒu zhǎodào.",
      "Wǒ xiǎng le hěn jiǔ, zhōngyú xiǎng qǐlái zǎoshang huàn le yí ge bāo, yàoshi kěnéng hái fàng zài jiù bāo lǐ. Kěshì jiālǐ méiyǒu rén, wǒ yě jìn bú qù, zhǐhǎo gěi mèimei dǎ diànhuà.",
      "Mèimei hái yào yí ge xiǎoshí cái néng huílái, suǒyǐ wǒ xiān qù fùjìn de kāfēidiàn děng tā. Suīrán zhè jiàn shì yǒu yìdiǎn máfan, dànshì yě tíxǐng le wǒ, yǐhòu chūmén yǐqián yídìng yào jiǎnchá shǒujī, qiánbāo hé yàoshi.",
    ],

    myanmarParagraphs: [
      "မနေ့က အလုပ်ဆင်းပြီး အိမ်တံခါးရှေ့ရောက်တော့ သော့ယူမလို့ အိတ်ထဲရှာတဲ့အခါ မရှိတာသိတယ်။ အိတ်ထဲကပစ္စည်းအကုန်ထုတ်ပြီးရှာပေမယ့် မတွေ့ဘူး။",
      "တော်တော်ကြာစဉ်းစားပြီး မနက်က အိတ်ပြောင်းသုံးထားလို့ သော့က အိတ်အဟောင်းထဲကျန်ခဲ့တာဖြစ်နိုင်တယ်လို့ သတိရတယ်။ အိမ်မှာလည်း ဘယ်သူမှမရှိလို့ အထဲဝင်မရဘဲ ညီမကိုဖုန်းခေါ်ရတယ်။",
      "ညီမပြန်လာဖို့ တစ်နာရီလောက်ကြာမှာမို့ အနီးက ကော်ဖီဆိုင်မှာ စောင့်တယ်။ အနည်းငယ်ဒုက္ခပေးပေမယ့် နောက်တစ်ခါအပြင်မထွက်ခင် ဖုန်း၊ ပိုက်ဆံအိတ်နဲ့ သော့စစ်ဖို့ သတိပေးသလိုဖြစ်သွားတယ်။",
    ],

    keywords: [
      "钥匙",
      "门口",
      "发现",
      "东西",
      "找到",
      "可能",
      "进去",
      "妹妹",
      "附近",
      "麻烦",
      "提醒",
    ],

    audioUrl: null,
    audioText:
      "昨天下班以后，我回到家门口，准备开门的时候，突然发现包里没有钥匙。我把包里的东西全都拿出来找了一遍，还是没有找到。我想了很久，终于想起来早上换了一个包，钥匙可能还放在旧包里。可是家里没有人，我也进不去，只好给妹妹打电话。妹妹还要一个小时才能回来，所以我先去附近的咖啡店等她。虽然这件事有一点麻烦，但是也提醒了我，以后出门以前一定要检查手机、钱包和钥匙。",
  },

  {
    id: "hsk3-reading-006",
    level: 3,
    order: 6,
    title: "第一次一个人旅行",
    pinyinTitle: "Dì yī cì yí ge rén lǚxíng",
    myanmarTitle: "ပထမဆုံး တစ်ယောက်တည်းခရီးသွားခြင်း",
    category: "travel",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "以前我出去旅行的时候，总是和家人或者朋友一起。但是今年我想试一试一个人旅行，所以决定去一个不太远的城市住两天。",
      "出发以前，我先订好了酒店，也在手机里保存了地图和重要的信息。到了以后，我一个人坐车、吃饭、找地方。刚开始有一点不习惯，但是慢慢觉得其实很自由。",
      "第二天，我去了一个很安静的公园，还在一家小咖啡店坐了很久。回家以后，我发现一个人旅行并没有想象中那么可怕，反而让我更了解自己。",
    ],

    pinyinParagraphs: [
      "Yǐqián wǒ chūqù lǚxíng de shíhou, zǒng shì hé jiārén huòzhě péngyou yìqǐ. Dànshì jīnnián wǒ xiǎng shì yí shì yí ge rén lǚxíng, suǒyǐ juédìng qù yí ge bú tài yuǎn de chéngshì zhù liǎng tiān.",
      "Chūfā yǐqián, wǒ xiān dìng hǎo le jiǔdiàn, yě zài shǒujī lǐ bǎocún le dìtú hé zhòngyào de xìnxī. Dào le yǐhòu, wǒ yí ge rén zuò chē, chīfàn, zhǎo dìfang. Gāng kāishǐ yǒu yìdiǎn bù xíguàn, dànshì mànmàn juéde qíshí hěn zìyóu.",
      "Dì èr tiān, wǒ qù le yí ge hěn ānjìng de gōngyuán, hái zài yì jiā xiǎo kāfēidiàn zuò le hěn jiǔ. Huí jiā yǐhòu, wǒ fāxiàn yí ge rén lǚxíng bìng méiyǒu xiǎngxiàng zhōng nàme kěpà, fǎn'ér ràng wǒ gèng liǎojiě zìjǐ.",
    ],

    myanmarParagraphs: [
      "အရင်ခရီးသွားတိုင်း မိသားစု ဒါမှမဟုတ် သူငယ်ချင်းတွေနဲ့အတူသွားတတ်တယ်။ ဒီနှစ်တော့ တစ်ယောက်တည်းခရီးသွားကြည့်ချင်လို့ မဝေးတဲ့မြို့တစ်မြို့မှာ နှစ်ရက်နေရန်ဆုံးဖြတ်တယ်။",
      "မထွက်ခင် ဟိုတယ်ကိုကြို booking လုပ်ပြီး မြေပုံနဲ့ အရေးကြီးအချက်အလက်တွေကို ဖုန်းထဲသိမ်းထားတယ်။ ရောက်တော့ ကားစီးတာ၊ စားတာ၊ နေရာရှာတာတွေကို တစ်ယောက်တည်းလုပ်ရတယ်။ အစမှာ မရင်းနှီးပေမယ့် နောက်ပိုင်း တော်တော်လွတ်လပ်တယ်လို့ခံစားရတယ်။",
      "ဒုတိယနေ့မှာ တိတ်ဆိတ်တဲ့ပန်းခြံတစ်ခုသွားပြီး ကော်ဖီဆိုင်လေးတစ်ဆိုင်မှာလည်း ကြာကြာထိုင်တယ်။ အိမ်ပြန်တော့ တစ်ယောက်တည်းခရီးသွားတာ စိတ်ကူးထားသလောက် မကြောက်စရာမဟုတ်ဘဲ ကိုယ့်ကိုယ်ကို ပိုသိလာစေတယ်။",
    ],

    keywords: [
      "旅行",
      "决定",
      "城市",
      "酒店",
      "地图",
      "重要",
      "习惯",
      "自由",
      "公园",
      "了解",
    ],

    audioUrl: null,
    audioText:
      "以前我出去旅行的时候，总是和家人或者朋友一起。但是今年我想试一试一个人旅行，所以决定去一个不太远的城市住两天。出发以前，我先订好了酒店，也在手机里保存了地图和重要的信息。到了以后，我一个人坐车、吃饭、找地方。刚开始有一点不习惯，但是慢慢觉得其实很自由。第二天，我去了一个很安静的公园，还在一家小咖啡店坐了很久。回家以后，我发现一个人旅行并没有想象中那么可怕，反而让我更了解自己。",
  },

  {
    id: "hsk3-reading-007",
    level: 3,
    order: 7,
    title: "在网上买东西",
    pinyinTitle: "Zài wǎngshàng mǎi dōngxi",
    myanmarTitle: "အွန်လိုင်းက ပစ္စည်းဝယ်ခြင်း",
    category: "shopping",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "最近我想买一双新鞋，但是没有时间去商场，所以决定在网上看看。我看了很多不同的店，也比较了价格和大家的评价。",
      "最后，我找到了一双自己很喜欢的鞋。价格不太贵，颜色也很好看。我看了尺码以后就下单了。商店说三天左右可以送到。",
      "第三天下午，快递真的到了。我打开以后发现鞋子的颜色和照片差不多，大小也正好。这次买东西很顺利，不过我觉得以后在网上买东西还是要认真看评价。",
    ],

    pinyinParagraphs: [
      "Zuìjìn wǒ xiǎng mǎi yì shuāng xīn xié, dànshì méiyǒu shíjiān qù shāngchǎng, suǒyǐ juédìng zài wǎngshàng kànkan. Wǒ kàn le hěn duō bùtóng de diàn, yě bǐjiào le jiàgé hé dàjiā de píngjià.",
      "Zuìhòu, wǒ zhǎodào le yì shuāng zìjǐ hěn xǐhuan de xié. Jiàgé bú tài guì, yánsè yě hěn hǎokàn. Wǒ kàn le chǐmǎ yǐhòu jiù xiàdān le. Shāngdiàn shuō sān tiān zuǒyòu kěyǐ sòng dào.",
      "Dì sān tiān xiàwǔ, kuàidì zhēnde dào le. Wǒ dǎkāi yǐhòu fāxiàn xiézi de yánsè hé zhàopiàn chàbuduō, dàxiǎo yě zhènghǎo. Zhè cì mǎi dōngxi hěn shùnlì, búguò wǒ juéde yǐhòu zài wǎngshàng mǎi dōngxi háishi yào rènzhēn kàn píngjià.",
    ],

    myanmarParagraphs: [
      "အခုတလော ဖိနပ်အသစ်ဝယ်ချင်ပေမယ့် mall သွားဖို့အချိန်မရှိလို့ online မှာကြည့်ဖို့ဆုံးဖြတ်တယ်။ ဆိုင်အများကြီးကြည့်ပြီး ဈေးနှုန်းနဲ့ review တွေကို နှိုင်းယှဉ်တယ်။",
      "နောက်ဆုံး ကိုယ်အရမ်းကြိုက်တဲ့ဖိနပ်တစ်စုံတွေ့တယ်။ ဈေးမကြီးဘဲ အရောင်လည်းလှတယ်။ Size ကြည့်ပြီး order တင်လိုက်တယ်။ သုံးရက်လောက်နေရင်ရောက်မယ်လို့ ဆိုင်ကပြောတယ်။",
      "သုံးရက်မြောက်နေ့ ညနေပိုင်းမှာ package ရောက်လာတယ်။ ဖွင့်ကြည့်တော့ အရောင်ကဓာတ်ပုံနဲ့မကွာဘဲ size လည်းတော်တယ်။ ဒီတစ်ခေါက်အဆင်ပြေပေမယ့် online ဝယ်ရင် review ကိုသေချာကြည့်ဖို့လိုတယ်လို့ထင်တယ်။",
    ],

    keywords: [
      "网上",
      "商场",
      "比较",
      "价格",
      "评价",
      "颜色",
      "尺码",
      "下单",
      "快递",
      "顺利",
    ],

    audioUrl: null,
    audioText:
      "最近我想买一双新鞋，但是没有时间去商场，所以决定在网上看看。我看了很多不同的店，也比较了价格和大家的评价。最后，我找到了一双自己很喜欢的鞋。价格不太贵，颜色也很好看。我看了尺码以后就下单了。商店说三天左右可以送到。第三天下午，快递真的到了。我打开以后发现鞋子的颜色和照片差不多，大小也正好。这次买东西很顺利，不过我觉得以后在网上买东西还是要认真看评价。",
  },

  {
    id: "hsk3-reading-008",
    level: 3,
    order: 8,
    title: "和朋友发生误会",
    pinyinTitle: "Hé péngyou fāshēng wùhuì",
    myanmarTitle: "သူငယ်ချင်းနဲ့ နားလည်မှုလွဲခြင်း",
    category: "friends",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "上个星期，我和朋友约好星期六一起吃饭。可是星期六下午，我给她发消息的时候，她一直没有回答。我等了很久，觉得她可能忘了，所以有一点不高兴。",
      "晚上她终于给我打电话。原来她的手机下午突然坏了，不能收到消息。她也以为我没有联系她，所以我们两个人都误会了对方。",
      "我们把事情说清楚以后，都觉得有一点好笑。后来我们决定第二天见面。通过这件事，我觉得朋友之间有问题的时候，最好先问清楚，不要自己乱想。",
    ],

    pinyinParagraphs: [
      "Shàng ge xīngqī, wǒ hé péngyou yuē hǎo Xīngqīliù yìqǐ chīfàn. Kěshì Xīngqīliù xiàwǔ, wǒ gěi tā fā xiāoxi de shíhou, tā yìzhí méiyǒu huídá. Wǒ děng le hěn jiǔ, juéde tā kěnéng wàng le, suǒyǐ yǒu yìdiǎn bù gāoxìng.",
      "Wǎnshang tā zhōngyú gěi wǒ dǎ diànhuà. Yuánlái tā de shǒujī xiàwǔ tūrán huài le, bù néng shōudào xiāoxi. Tā yě yǐwéi wǒ méiyǒu liánxì tā, suǒyǐ wǒmen liǎng ge rén dōu wùhuì le duìfāng.",
      "Wǒmen bǎ shìqing shuō qīngchu yǐhòu, dōu juéde yǒu yìdiǎn hǎoxiào. Hòulái wǒmen juédìng dì èr tiān jiànmiàn. Tōngguò zhè jiàn shì, wǒ juéde péngyou zhījiān yǒu wèntí de shíhou, zuìhǎo xiān wèn qīngchu, búyào zìjǐ luàn xiǎng.",
    ],

    myanmarParagraphs: [
      "ပြီးခဲ့တဲ့အပတ်က စနေနေ့အတူစားဖို့ သူငယ်ချင်းနဲ့ ချိန်းထားတယ်။ စနေနေ့ညနေပိုင်း message ပို့တော့ တစ်ချိန်လုံးမပြန်ဘူး။ အချိန်တော်တော်ကြာစောင့်ပြီး သူမေ့သွားတယ်ထင်လို့ နည်းနည်းစိတ်မကောင်းဖြစ်တယ်။",
      "ညရောက်တော့ သူကဖုန်းခေါ်လာတယ်။ သူ့ဖုန်းက ညနေပိုင်းမှာ ရုတ်တရက်ပျက်သွားလို့ message မရတာဖြစ်တယ်။ သူကလည်း ကျွန်မမဆက်သွယ်ဘူးလို့ ထင်ထားလို့ နှစ်ယောက်လုံး နားလည်မှုလွဲနေတာပါ။",
      "အကုန်ရှင်းပြပြီးတော့ နှစ်ယောက်လုံး ရယ်ချင်သွားတယ်။ နောက်နေ့တွေ့ဖို့ဆုံးဖြတ်ကြတယ်။ ဒီဖြစ်ရပ်ကနေ သူငယ်ချင်းကြားပြဿနာရှိရင် ကိုယ့်ဘာသာမတွေးဘဲ အရင်မေးရှင်းတာကောင်းတယ်လို့ သိလာတယ်။",
    ],

    keywords: [
      "朋友",
      "约好",
      "消息",
      "回答",
      "可能",
      "手机",
      "联系",
      "误会",
      "对方",
      "清楚",
    ],

    audioUrl: null,
    audioText:
      "上个星期，我和朋友约好星期六一起吃饭。可是星期六下午，我给她发消息的时候，她一直没有回答。我等了很久，觉得她可能忘了，所以有一点不高兴。晚上她终于给我打电话。原来她的手机下午突然坏了，不能收到消息。她也以为我没有联系她，所以我们两个人都误会了对方。我们把事情说清楚以后，都觉得有一点好笑。后来我们决定第二天见面。通过这件事，我觉得朋友之间有问题的时候，最好先问清楚，不要自己乱想。",
  },

  {
    id: "hsk3-reading-009",
    level: 3,
    order: 9,
    title: "下班后的生活",
    pinyinTitle: "Xiàbān hòu de shēnghuó",
    myanmarTitle: "အလုပ်ဆင်းပြီးနောက် ဘဝ",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "以前我下班以后常常直接回家，然后躺在床上看手机。虽然身体在休息，但是每天晚上还是觉得很累，也觉得生活有一点无聊。",
      "后来我决定改变一下。现在星期一和星期三下班以后，我会去附近走路或者运动。星期二和星期四，我在家学习中文半个小时。",
      "周末的时候，我会和朋友见面，也会给自己留一点安静的时间。这样的生活虽然还是很忙，但是我觉得每天都更有意思了。",
    ],

    pinyinParagraphs: [
      "Yǐqián wǒ xiàbān yǐhòu chángcháng zhíjiē huí jiā, ránhòu tǎng zài chuáng shàng kàn shǒujī. Suīrán shēntǐ zài xiūxi, dànshì měitiān wǎnshang háishi juéde hěn lèi, yě juéde shēnghuó yǒu yìdiǎn wúliáo.",
      "Hòulái wǒ juédìng gǎibiàn yíxià. Xiànzài Xīngqīyī hé Xīngqīsān xiàbān yǐhòu, wǒ huì qù fùjìn zǒulù huòzhě yùndòng. Xīngqī'èr hé Xīngqīsì, wǒ zài jiā xuéxí Zhōngwén bàn ge xiǎoshí.",
      "Zhōumò de shíhou, wǒ huì hé péngyou jiànmiàn, yě huì gěi zìjǐ liú yìdiǎn ānjìng de shíjiān. Zhèyàng de shēnghuó suīrán háishi hěn máng, dànshì wǒ juéde měitiān dōu gèng yǒuyìsi le.",
    ],

    myanmarParagraphs: [
      "အရင်က အလုပ်ဆင်းရင် တိုက်ရိုက်အိမ်ပြန်ပြီး အိပ်ရာပေါ်လှဲကာ ဖုန်းကြည့်တတ်တယ်။ ကိုယ်က အနားယူနေပေမယ့် ညတိုင်းပင်ပန်းသလိုခံစားရပြီး ဘဝလည်းနည်းနည်းပျင်းစရာဖြစ်လာတယ်။",
      "နောက်တော့ အပြောင်းအလဲလုပ်ဖို့ဆုံးဖြတ်တယ်။ အခု တနင်္လာနဲ့ ဗုဒ္ဓဟူးမှာ အလုပ်ဆင်းပြီး လမ်းလျှောက် ဒါမှမဟုတ် လေ့ကျင့်ခန်းလုပ်တယ်။ အင်္ဂါနဲ့ ကြာသပတေးမှာ အိမ်မှာ တရုတ်စာနာရီဝက်လေ့လာတယ်။",
      "ပိတ်ရက်မှာ သူငယ်ချင်းတွေနဲ့တွေ့ပြီး ကိုယ့်အတွက် တိတ်တိတ်ဆိတ်ဆိတ်နေချိန်လည်းထားတယ်။ အလုပ်များနေသေးပေမယ့် နေ့တိုင်းပိုအဓိပ္ပာယ်ရှိလာတယ်။",
    ],

    keywords: [
      "下班",
      "直接",
      "休息",
      "生活",
      "无聊",
      "改变",
      "附近",
      "运动",
      "学习",
      "安静",
    ],

    audioUrl: null,
    audioText:
      "以前我下班以后常常直接回家，然后躺在床上看手机。虽然身体在休息，但是每天晚上还是觉得很累，也觉得生活有一点无聊。后来我决定改变一下。现在星期一和星期三下班以后，我会去附近走路或者运动。星期二和星期四，我在家学习中文半个小时。周末的时候，我会和朋友见面，也会给自己留一点安静的时间。这样的生活虽然还是很忙，但是我觉得每天都更有意思了。",
  },

  {
    id: "hsk3-reading-010",
    level: 3,
    order: 10,
    title: "第一次参加面试",
    pinyinTitle: "Dì yī cì cānjiā miànshì",
    myanmarTitle: "ပထမဆုံး အလုပ်အင်တာဗျူးဖြေခြင်း",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "大学毕业以后，我参加了人生中的第一次工作面试。面试以前，我非常紧张，不知道经理会问什么问题，所以每天都在家练习。",
      "面试当天，我提前二十分钟到了公司。工作人员让我先坐一下。轮到我的时候，经理先让我介绍自己，然后问我为什么想来这家公司。",
      "开始的时候我的声音有一点小，但是说了几分钟以后就自然多了。虽然最后我没有得到那份工作，但是这次经验让我知道下一次应该怎么准备。",
    ],

    pinyinParagraphs: [
      "Dàxué bìyè yǐhòu, wǒ cānjiā le rénshēng zhōng de dì yī cì gōngzuò miànshì. Miànshì yǐqián, wǒ fēicháng jǐnzhāng, bù zhīdào jīnglǐ huì wèn shénme wèntí, suǒyǐ měitiān dōu zài jiā liànxí.",
      "Miànshì dāngtiān, wǒ tíqián èrshí fēnzhōng dào le gōngsī. Gōngzuò rényuán ràng wǒ xiān zuò yíxià. Lúndào wǒ de shíhou, jīnglǐ xiān ràng wǒ jièshào zìjǐ, ránhòu wèn wǒ wèishénme xiǎng lái zhè jiā gōngsī.",
      "Kāishǐ de shíhou wǒ de shēngyīn yǒu yìdiǎn xiǎo, dànshì shuō le jǐ fēnzhōng yǐhòu jiù zìrán duō le. Suīrán zuìhòu wǒ méiyǒu dédào nà fèn gōngzuò, dànshì zhè cì jīngyàn ràng wǒ zhīdào xià yí cì yīnggāi zěnme zhǔnbèi.",
    ],

    myanmarParagraphs: [
      "တက္ကသိုလ်ပြီးတော့ ဘဝထဲက ပထမဆုံးအလုပ် interview ဝင်တယ်။ Interview မတိုင်ခင် အရမ်းစိတ်လှုပ်ရှားပြီး manager က ဘာမေးမလဲမသိလို့ နေ့တိုင်းအိမ်မှာလေ့ကျင့်တယ်။",
      "Interview နေ့မှာ ကုမ္ပဏီကို မိနစ် ၂၀ စောရောက်တယ်။ ဝန်ထမ်းက အရင်ထိုင်စောင့်ခိုင်းတယ်။ ကိုယ့်အလှည့်ရောက်တော့ manager က ကိုယ့်ကိုယ်ကိုမိတ်ဆက်ခိုင်းပြီး ဘာကြောင့်ဒီကုမ္ပဏီလာချင်လဲမေးတယ်။",
      "အစမှာ အသံနည်းနည်းတိုးပေမယ့် မိနစ်အနည်းငယ်ပြောပြီးတော့ ပိုသဘာဝကျလာတယ်။ နောက်ဆုံးအလုပ်မရပေမယ့် ဒီအတွေ့အကြုံက နောက်တစ်ခါဘယ်လိုပြင်ဆင်ရမလဲ သင်ပေးတယ်။",
    ],

    keywords: [
      "大学",
      "毕业",
      "面试",
      "紧张",
      "经理",
      "提前",
      "公司",
      "介绍",
      "声音",
      "经验",
      "准备",
    ],

    audioUrl: null,
    audioText:
      "大学毕业以后，我参加了人生中的第一次工作面试。面试以前，我非常紧张，不知道经理会问什么问题，所以每天都在家练习。面试当天，我提前二十分钟到了公司。工作人员让我先坐一下。轮到我的时候，经理先让我介绍自己，然后问我为什么想来这家公司。开始的时候我的声音有一点小，但是说了几分钟以后就自然多了。虽然最后我没有得到那份工作，但是这次经验让我知道下一次应该怎么准备。",
  },

  {
    id: "hsk3-reading-011",
    level: 3,
    order: 11,
    title: "学会管理时间",
    pinyinTitle: "Xuéhuì guǎnlǐ shíjiān",
    myanmarTitle: "အချိန်စီမံခန့်ခွဲတတ်လာခြင်း",
    category: "school",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "以前我总觉得一天的时间不够用。工作、学习、做家务以后，常常已经很晚了。我想做很多事情，但是最后什么都没有做好。",
      "后来老师建议我每天晚上写下第二天最重要的三件事。我开始按照重要程度安排时间，也尽量不要一边学习一边看手机。",
      "刚开始的时候有一点不习惯，但是几周以后，我发现自己做事情快了很多，也没有以前那么着急了。现在我还是很忙，但是时间安排得更清楚。",
    ],

    pinyinParagraphs: [
      "Yǐqián wǒ zǒng juéde yì tiān de shíjiān bú gòu yòng. Gōngzuò, xuéxí, zuò jiāwù yǐhòu, chángcháng yǐjīng hěn wǎn le. Wǒ xiǎng zuò hěn duō shìqing, dànshì zuìhòu shénme dōu méiyǒu zuò hǎo.",
      "Hòulái lǎoshī jiànyì wǒ měitiān wǎnshang xiě xià dì èr tiān zuì zhòngyào de sān jiàn shì. Wǒ kāishǐ ànzhào zhòngyào chéngdù ānpái shíjiān, yě jǐnliàng búyào yìbiān xuéxí yìbiān kàn shǒujī.",
      "Gāng kāishǐ de shíhou yǒu yìdiǎn bù xíguàn, dànshì jǐ zhōu yǐhòu, wǒ fāxiàn zìjǐ zuò shìqing kuài le hěn duō, yě méiyǒu yǐqián nàme zháojí le. Xiànzài wǒ háishi hěn máng, dànshì shíjiān ānpái de gèng qīngchu.",
    ],

    myanmarParagraphs: [
      "အရင်က တစ်နေ့မှာ အချိန်မလုံလောက်ဘူးလို့အမြဲထင်တယ်။ အလုပ်၊ စာလေ့လာ၊ အိမ်အလုပ်ပြီးရင် ညနောက်ကျနေပြီ။ အရာအများကြီးလုပ်ချင်ပေမယ့် နောက်ဆုံး ဘာမှကောင်းကောင်းမပြီးဘူး။",
      "နောက်တော့ ဆရာက ညတိုင်း နောက်နေ့အတွက် အရေးကြီးဆုံးအလုပ်သုံးခုရေးထားဖို့ အကြံပေးတယ်။ အရေးပါမှုအလိုက် အချိန်စီစဉ်ပြီး စာလေ့လာရင်း ဖုန်းမကြည့်ဖို့လည်း ကြိုးစားတယ်။",
      "အစမှာ မရင်းနှီးပေမယ့် ရက်သတ္တပတ်အနည်းငယ်ကြာတော့ အလုပ်လုပ်တာပိုမြန်လာပြီး အရင်လောက်မလောတော့ဘူး။ အခုလည်း အလုပ်များပေမယ့် အချိန်စီမံတာပိုရှင်းလာတယ်။",
    ],

    keywords: [
      "管理",
      "时间",
      "建议",
      "重要",
      "安排",
      "尽量",
      "习惯",
      "发现",
      "着急",
      "清楚",
    ],

    audioUrl: null,
    audioText:
      "以前我总觉得一天的时间不够用。工作、学习、做家务以后，常常已经很晚了。我想做很多事情，但是最后什么都没有做好。后来老师建议我每天晚上写下第二天最重要的三件事。我开始按照重要程度安排时间，也尽量不要一边学习一边看手机。刚开始的时候有一点不习惯，但是几周以后，我发现自己做事情快了很多，也没有以前那么着急了。现在我还是很忙，但是时间安排得更清楚。",
  },

  {
    id: "hsk3-reading-012",
    level: 3,
    order: 12,
    title: "去朋友家做客",
    pinyinTitle: "Qù péngyou jiā zuòkè",
    myanmarTitle: "သူငယ်ချင်းအိမ် အလည်သွားခြင်း",
    category: "friends",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "星期天，我第一次去朋友小美的新家做客。她上个月刚搬家，所以一直想请我们几个朋友去看看。",
      "我下午三点左右到了她家。她已经准备了水果、点心和茶。我们先参观了她的新房间，然后坐在客厅里聊天。",
      "晚上，小美还自己做了晚饭。我们一边吃一边聊以前在学校的事情。回家的时候已经很晚了，但是我觉得那天过得特别轻松。",
    ],

    pinyinParagraphs: [
      "Xīngqītiān, wǒ dì yī cì qù péngyou Xiǎoměi de xīn jiā zuòkè. Tā shàng ge yuè gāng bānjiā, suǒyǐ yìzhí xiǎng qǐng wǒmen jǐ ge péngyou qù kànkan.",
      "Wǒ xiàwǔ sān diǎn zuǒyòu dào le tā jiā. Tā yǐjīng zhǔnbèi le shuǐguǒ, diǎnxin hé chá. Wǒmen xiān cānguān le tā de xīn fángjiān, ránhòu zuò zài kètīng lǐ liáotiān.",
      "Wǎnshang, Xiǎoměi hái zìjǐ zuò le wǎnfàn. Wǒmen yìbiān chī yìbiān liáo yǐqián zài xuéxiào de shìqing. Huí jiā de shíhou yǐjīng hěn wǎn le, dànshì wǒ juéde nà tiān guò de tèbié qīngsōng.",
    ],

    myanmarParagraphs: [
      "တနင်္ဂနွေနေ့မှာ သူငယ်ချင်း Xiaomei ရဲ့အိမ်အသစ်ကို ပထမဆုံးအလည်သွားတယ်။ သူက ပြီးခဲ့တဲ့လမှအိမ်ပြောင်းထားလို့ သူငယ်ချင်းတွေကို ဖိတ်ချင်နေတာကြာပြီ။",
      "ညနေ ၃ နာရီလောက် သူ့အိမ်ရောက်တယ်။ အသီး၊ မုန့်နဲ့ လက်ဖက်ရည်ပြင်ထားပြီးသား။ အခန်းအသစ်ကို အရင်လိုက်ကြည့်ပြီး ဧည့်ခန်းမှာထိုင်စကားပြောကြတယ်။",
      "ညမှာ Xiaomei က ညစာတောင်ကိုယ်တိုင်ချက်ပေးတယ်။ စားရင်း ကျောင်းတုန်းကအကြောင်းတွေပြောကြတယ်။ အိမ်ပြန်တော့ နောက်ကျနေပြီပေမယ့် အဲဒီနေ့က အရမ်းပေါ့ပါးပျော်ရွှင်တယ်။",
    ],

    keywords: [
      "做客",
      "搬家",
      "准备",
      "点心",
      "参观",
      "房间",
      "客厅",
      "晚饭",
      "学校",
      "轻松",
    ],

    audioUrl: null,
    audioText:
      "星期天，我第一次去朋友小美的新家做客。她上个月刚搬家，所以一直想请我们几个朋友去看看。我下午三点左右到了她家。她已经准备了水果、点心和茶。我们先参观了她的新房间，然后坐在客厅里聊天。晚上，小美还自己做了晚饭。我们一边吃一边聊以前在学校的事情。回家的时候已经很晚了，但是我觉得那天过得特别轻松。",
  },

  {
    id: "hsk3-reading-013",
    level: 3,
    order: 13,
    title: "一次特别的购物经历",
    pinyinTitle: "Yí cì tèbié de gòuwù jīnglì",
    myanmarTitle: "ထူးခြားတဲ့ ဈေးဝယ်အတွေ့အကြုံ",
    category: "shopping",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "上个月，我去商场买生日礼物。我本来想买一个包，但是看了很多店以后还是没有找到合适的。",
      "后来我走进一家小店，看到一个手工做的杯子。老板告诉我，每个杯子的颜色和图案都不一样。我觉得这个礼物比普通的包更特别。",
      "我买下以后，还请老板帮我包装。朋友收到礼物的时候非常喜欢。那次以后，我发现买礼物不一定要贵，最重要的是适合对方。",
    ],

    pinyinParagraphs: [
      "Shàng ge yuè, wǒ qù shāngchǎng mǎi shēngrì lǐwù. Wǒ běnlái xiǎng mǎi yí ge bāo, dànshì kàn le hěn duō diàn yǐhòu háishi méiyǒu zhǎodào héshì de.",
      "Hòulái wǒ zǒu jìn yì jiā xiǎo diàn, kàndào yí ge shǒugōng zuò de bēizi. Lǎobǎn gàosu wǒ, měi ge bēizi de yánsè hé tú'àn dōu bù yíyàng. Wǒ juéde zhège lǐwù bǐ pǔtōng de bāo gèng tèbié.",
      "Wǒ mǎi xià yǐhòu, hái qǐng lǎobǎn bāng wǒ bāozhuāng. Péngyou shōudào lǐwù de shíhou fēicháng xǐhuan. Nà cì yǐhòu, wǒ fāxiàn mǎi lǐwù bù yídìng yào guì, zuì zhòngyào de shì shìhé duìfāng.",
    ],

    myanmarParagraphs: [
      "ပြီးခဲ့တဲ့လမှာ မွေးနေ့လက်ဆောင်ဝယ်ဖို့ mall သွားတယ်။ အစက အိတ်တစ်လုံးဝယ်ချင်ပေမယ့် ဆိုင်အများကြီးကြည့်ပြီးတောင် သင့်တော်တာမတွေ့ဘူး။",
      "နောက်တော့ ဆိုင်သေးသေးတစ်ဆိုင်ထဲဝင်ပြီး handmade ခွက်တစ်လုံးတွေ့တယ်။ ဆိုင်ရှင်က ခွက်တစ်လုံးချင်းစီ အရောင်နဲ့ပုံစံမတူဘူးလို့ပြောတယ်။ အဲဒီလက်ဆောင်က သာမန်အိတ်ထက်ပိုထူးခြားတယ်လို့ထင်တယ်။",
      "ဝယ်ပြီး ဆိုင်ရှင်ကို လက်ဆောင်ထုပ်ပေးခိုင်းတယ်။ သူငယ်ချင်းက လက်ဆောင်ရတော့ အရမ်းကြိုက်တယ်။ အဲဒီကနေ လက်ဆောင်ဆို ဈေးကြီးဖို့မလိုဘဲ ပေးမယ့်သူနဲ့သင့်တော်တာက ပိုအရေးကြီးတယ်လို့သိလာတယ်။",
    ],

    keywords: [
      "购物",
      "礼物",
      "合适",
      "手工",
      "杯子",
      "颜色",
      "图案",
      "包装",
      "收到",
      "对方",
    ],

    audioUrl: null,
    audioText:
      "上个月，我去商场买生日礼物。我本来想买一个包，但是看了很多店以后还是没有找到合适的。后来我走进一家小店，看到一个手工做的杯子。老板告诉我，每个杯子的颜色和图案都不一样。我觉得这个礼物比普通的包更特别。我买下以后，还请老板帮我包装。朋友收到礼物的时候非常喜欢。那次以后，我发现买礼物不一定要贵，最重要的是适合对方。",
  },

  {
    id: "hsk3-reading-014",
    level: 3,
    order: 14,
    title: "我的中文进步了",
    pinyinTitle: "Wǒ de Zhōngwén jìnbù le",
    myanmarTitle: "ကျွန်မရဲ့ တရုတ်စာ တိုးတက်လာပြီ",
    category: "school",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "我学习中文已经两年了。刚开始的时候，我只会说很简单的句子，而且别人说快一点我就听不懂。",
      "后来我改变了学习方法。每天除了背单词，我还会听中文、读短文，并且尽量用新学的词说句子。虽然每天只学习一个小时，但是我一直坚持。",
      "最近我发现自己看中文视频的时候能听懂更多了，跟老师说话的时候也没有以前那么紧张。进步虽然不是一下子看到的，但是坚持真的很重要。",
    ],

    pinyinParagraphs: [
      "Wǒ xuéxí Zhōngwén yǐjīng liǎng nián le. Gāng kāishǐ de shíhou, wǒ zhǐ huì shuō hěn jiǎndān de jùzi, érqiě biérén shuō kuài yìdiǎn wǒ jiù tīng bù dǒng.",
      "Hòulái wǒ gǎibiàn le xuéxí fāngfǎ. Měitiān chúle bèi dāncí, wǒ hái huì tīng Zhōngwén, dú duǎnwén, bìngqiě jǐnliàng yòng xīn xué de cí shuō jùzi. Suīrán měitiān zhǐ xuéxí yí ge xiǎoshí, dànshì wǒ yìzhí jiānchí.",
      "Zuìjìn wǒ fāxiàn zìjǐ kàn Zhōngwén shìpín de shíhou néng tīng dǒng gèng duō le, gēn lǎoshī shuōhuà de shíhou yě méiyǒu yǐqián nàme jǐnzhāng. Jìnbù suīrán bú shì yíxiàzi kàndào de, dànshì jiānchí zhēnde hěn zhòngyào.",
    ],

    myanmarParagraphs: [
      "တရုတ်စာလေ့လာတာ နှစ်နှစ်ရှိပြီ။ အစမှာ လွယ်တဲ့စာကြောင်းတွေပဲပြောတတ်ပြီး တစ်ဖက်လူက နည်းနည်းမြန်ပြောရင် နားမလည်ဘူး။",
      "နောက်တော့ လေ့လာနည်းပြောင်းတယ်။ Vocabulary ကျက်တာအပြင် တရုတ်စာနားထောင်၊ short reading ဖတ်ပြီး စကားလုံးအသစ်နဲ့ စာကြောင်းပြောကြည့်တယ်။ နေ့တိုင်း တစ်နာရီပဲလေ့လာပေမယ့် မပျက်မကွက်လုပ်တယ်။",
      "အခုတလော တရုတ် video ကြည့်ရင် ပိုနားလည်လာပြီး ဆရာနဲ့ပြောရင်လည်း အရင်လောက်မစိုးရိမ်တော့ဘူး။ တိုးတက်မှုက ချက်ချင်းမမြင်ရပေမယ့် ဆက်လုပ်တာက အရေးကြီးတယ်။",
    ],

    keywords: [
      "学习",
      "句子",
      "方法",
      "单词",
      "短文",
      "尽量",
      "坚持",
      "视频",
      "进步",
      "重要",
    ],

    audioUrl: null,
    audioText:
      "我学习中文已经两年了。刚开始的时候，我只会说很简单的句子，而且别人说快一点我就听不懂。后来我改变了学习方法。每天除了背单词，我还会听中文、读短文，并且尽量用新学的词说句子。虽然每天只学习一个小时，但是我一直坚持。最近我发现自己看中文视频的时候能听懂更多了，跟老师说话的时候也没有以前那么紧张。进步虽然不是一下子看到的，但是坚持真的很重要。",
  },

  {
    id: "hsk3-reading-015",
    level: 3,
    order: 15,
    title: "雨天里的帮助",
    pinyinTitle: "Yǔtiān lǐ de bāngzhù",
    myanmarTitle: "မိုးရွာတဲ့နေ့က အကူအညီ",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "昨天下午我下班的时候，外面突然下起了大雨。我没有带伞，只能站在公司门口等。",
      "过了一会儿，一个同事看到我还没有走，就问我是不是没有伞。她说她的伞比较大，可以一起走到车站。",
      "我们一路上聊了很多。到了车站以后，我一直跟她说谢谢。虽然只是一个很小的帮助，但是在下雨的时候，我觉得特别温暖。",
    ],

    pinyinParagraphs: [
      "Zuótiān xiàwǔ wǒ xiàbān de shíhou, wàimiàn tūrán xià qǐ le dàyǔ. Wǒ méiyǒu dài sǎn, zhǐ néng zhàn zài gōngsī ménkǒu děng.",
      "Guò le yíhuìr, yí ge tóngshì kàndào wǒ hái méiyǒu zǒu, jiù wèn wǒ shì bú shì méiyǒu sǎn. Tā shuō tā de sǎn bǐjiào dà, kěyǐ yìqǐ zǒu dào chēzhàn.",
      "Wǒmen yílù shàng liáo le hěn duō. Dào le chēzhàn yǐhòu, wǒ yìzhí gēn tā shuō xièxie. Suīrán zhǐshì yí ge hěn xiǎo de bāngzhù, dànshì zài xiàyǔ de shíhou, wǒ juéde tèbié wēnnuǎn.",
    ],

    myanmarParagraphs: [
      "မနေ့ညနေပိုင်း အလုပ်ဆင်းတော့ အပြင်မှာ မိုးကြီးရုတ်တရက်ရွာတယ်။ ထီးမပါလို့ ကုမ္ပဏီတံခါးရှေ့မှာပဲ စောင့်နေရတယ်။",
      "ခဏကြာတော့ လုပ်ဖော်ကိုင်ဖက်တစ်ယောက်က ကျွန်မမပြန်သေးတာတွေ့ပြီး ထီးမရှိဘူးလားမေးတယ်။ သူ့ထီးကကြီးလို့ ဘူတာအထိအတူသွားလို့ရတယ်လို့ပြောတယ်။",
      "လမ်းတစ်လျှောက် စကားတွေအများကြီးပြောကြတယ်။ ဘူတာရောက်တော့ အကြိမ်ကြိမ်ကျေးဇူးတင်ပါတယ်လို့ပြောတယ်။ အကူအညီသေးသေးလေးပေမယ့် မိုးရွာတဲ့နေ့မှာ အရမ်းနွေးထွေးတယ်လို့ခံစားရတယ်။",
    ],

    keywords: [
      "下班",
      "突然",
      "大雨",
      "雨伞",
      "门口",
      "同事",
      "车站",
      "一路",
      "帮助",
      "温暖",
    ],

    audioUrl: null,
    audioText:
      "昨天下午我下班的时候，外面突然下起了大雨。我没有带伞，只能站在公司门口等。过了一会儿，一个同事看到我还没有走，就问我是不是没有伞。她说她的伞比较大，可以一起走到车站。我们一路上聊了很多。到了车站以后，我一直跟她说谢谢。虽然只是一个很小的帮助，但是在下雨的时候，我觉得特别温暖。",
  },

  {
    id: "hsk3-reading-016",
    level: 3,
    order: 16,
    title: "一次坐错车的经历",
    pinyinTitle: "Yí cì zuò cuò chē de jīnglì",
    myanmarTitle: "ကားမှားစီးခဲ့တဲ့ အတွေ့အကြုံ",
    category: "travel",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "有一次我去一个新地方见朋友。因为我不太熟悉那边的交通，所以一直看着手机里的地图。",
      "到了车站以后，我看到一辆车来了，就马上上去了。坐了十几分钟以后，我发现车走的方向和地图完全不一样，这才知道自己坐错了车。",
      "我在下一站下车，然后问工作人员应该怎么走。虽然最后晚到了二十分钟，但是朋友没有生气。那次以后，我上车以前都会认真看清楚车的号码和方向。",
    ],

    pinyinParagraphs: [
      "Yǒu yí cì wǒ qù yí ge xīn dìfang jiàn péngyou. Yīnwèi wǒ bú tài shúxī nàbian de jiāotōng, suǒyǐ yìzhí kànzhe shǒujī lǐ de dìtú.",
      "Dào le chēzhàn yǐhòu, wǒ kàndào yí liàng chē lái le, jiù mǎshàng shàngqù le. Zuò le shí jǐ fēnzhōng yǐhòu, wǒ fāxiàn chē zǒu de fāngxiàng hé dìtú wánquán bù yíyàng, zhè cái zhīdào zìjǐ zuò cuò le chē.",
      "Wǒ zài xià yí zhàn xià chē, ránhòu wèn gōngzuò rényuán yīnggāi zěnme zǒu. Suīrán zuìhòu wǎn dào le èrshí fēnzhōng, dànshì péngyou méiyǒu shēngqì. Nà cì yǐhòu, wǒ shàng chē yǐqián dōu huì rènzhēn kàn qīngchu chē de hàomǎ hé fāngxiàng.",
    ],

    myanmarParagraphs: [
      "တစ်ခါက သူငယ်ချင်းတွေ့ဖို့ နေရာအသစ်တစ်ခုသွားတယ်။ အဲဒီနေရာရဲ့ သယ်ယူပို့ဆောင်ရေးကိုမသိလို့ ဖုန်းထဲကမြေပုံကိုပဲကြည့်နေတယ်။",
      "ဘူတာရောက်တော့ ကားတစ်စီးလာတာမြင်ပြီး ချက်ချင်းတက်လိုက်တယ်။ ၁၀ မိနစ်ကျော်စီးပြီးတော့ ကားသွားတဲ့ဦးတည်ချက်က မြေပုံနဲ့လုံးဝမတူတာသိရတယ်။ အဲဒီအခါမှ ကားမှားစီးထားတာသိတယ်။",
      "နောက်မှတ်တိုင်မှာဆင်းပြီး ဝန်ထမ်းကို ဘယ်လိုသွားရမလဲမေးတယ်။ နောက်ဆုံး မိနစ် ၂၀ နောက်ကျသွားပေမယ့် သူငယ်ချင်းကစိတ်မဆိုးဘူး။ အဲဒီနောက်ပိုင်း ကားမတက်ခင် နံပါတ်နဲ့ဦးတည်ချက်ကို သေချာကြည့်တယ်။",
    ],

    keywords: [
      "交通",
      "地图",
      "车站",
      "方向",
      "完全",
      "坐错",
      "工作人员",
      "号码",
      "清楚",
      "生气",
    ],

    audioUrl: null,
    audioText:
      "有一次我去一个新地方见朋友。因为我不太熟悉那边的交通，所以一直看着手机里的地图。到了车站以后，我看到一辆车来了，就马上上去了。坐了十几分钟以后，我发现车走的方向和地图完全不一样，这才知道自己坐错了车。我在下一站下车，然后问工作人员应该怎么走。虽然最后晚到了二十分钟，但是朋友没有生气。那次以后，我上车以前都会认真看清楚车的号码和方向。",
  },

  {
    id: "hsk3-reading-017",
    level: 3,
    order: 17,
    title: "我的学习计划",
    pinyinTitle: "Wǒ de xuéxí jìhuà",
    myanmarTitle: "ကျွန်မရဲ့ လေ့လာရေးအစီအစဉ်",
    category: "school",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "今年我给自己定了一个新的学习计划。我希望中文听力和口语都能进步，所以不能只看课本。",
      "每天早上，我会听十五分钟中文。晚上下班以后，我会复习当天学过的词，再读一篇短文。周末的时候，我会找朋友一起练习说话。",
      "为了知道自己有没有进步，我每个月都会录一段自己的中文。过几个月再听以前的录音，就能发现哪些地方已经变好了。",
    ],

    pinyinParagraphs: [
      "Jīnnián wǒ gěi zìjǐ dìng le yí ge xīn de xuéxí jìhuà. Wǒ xīwàng Zhōngwén tīnglì hé kǒuyǔ dōu néng jìnbù, suǒyǐ bù néng zhǐ kàn kèběn.",
      "Měitiān zǎoshang, wǒ huì tīng shíwǔ fēnzhōng Zhōngwén. Wǎnshang xiàbān yǐhòu, wǒ huì fùxí dāngtiān xué guo de cí, zài dú yì piān duǎnwén. Zhōumò de shíhou, wǒ huì zhǎo péngyou yìqǐ liànxí shuōhuà.",
      "Wèile zhīdào zìjǐ yǒu méiyǒu jìnbù, wǒ měi ge yuè dōu huì lù yí duàn zìjǐ de Zhōngwén. Guò jǐ ge yuè zài tīng yǐqián de lùyīn, jiù néng fāxiàn nǎxiē dìfang yǐjīng biàn hǎo le.",
    ],

    myanmarParagraphs: [
      "ဒီနှစ် ကိုယ့်အတွက် လေ့လာရေးအစီအစဉ်အသစ်တစ်ခုချတယ်။ တရုတ်စာ listening နဲ့ speaking နှစ်ခုလုံးတိုးတက်ချင်လို့ စာအုပ်ပဲကြည့်လို့မရဘူး။",
      "နေ့တိုင်းမနက် တရုတ်စာ ၁၅ မိနစ်နားထောင်တယ်။ ညအလုပ်ဆင်းပြီး အဲဒီနေ့သင်ထားတဲ့ စကားလုံးပြန်လေ့လာပြီး short reading တစ်ပုဒ်ဖတ်တယ်။ ပိတ်ရက်မှာ သူငယ်ချင်းနဲ့ စကားပြောလေ့ကျင့်တယ်။",
      "တိုးတက်မတိုးတက် သိဖို့ လစဉ် ကိုယ်တိုင်တရုတ်လိုပြောတဲ့အသံ record လုပ်တယ်။ လအနည်းငယ်ကြာပြီး အဟောင်းကိုပြန်နားထောင်ရင် ဘယ်နေရာတွေတိုးတက်လာလဲသိနိုင်တယ်။",
    ],

    keywords: [
      "计划",
      "希望",
      "听力",
      "口语",
      "进步",
      "课本",
      "复习",
      "短文",
      "练习",
      "录音",
    ],

    audioUrl: null,
    audioText:
      "今年我给自己定了一个新的学习计划。我希望中文听力和口语都能进步，所以不能只看课本。每天早上，我会听十五分钟中文。晚上下班以后，我会复习当天学过的词，再读一篇短文。周末的时候，我会找朋友一起练习说话。为了知道自己有没有进步，我每个月都会录一段自己的中文。过几个月再听以前的录音，就能发现哪些地方已经变好了。",
  },

  {
    id: "hsk3-reading-018",
    level: 3,
    order: 18,
    title: "帮助新同事",
    pinyinTitle: "Bāngzhù xīn tóngshì",
    myanmarTitle: "လုပ်ဖော်ကိုင်ဖက်အသစ်ကို ကူညီခြင်း",
    category: "friends",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "这个月，我们公司来了一个新同事。她刚开始工作，对公司的系统和工作方法都不太熟悉。",
      "经理让我带她几天。我先告诉她每天要做什么，也给她看了以前的文件。遇到不明白的地方，她会马上问我。",
      "几天以后，她已经可以自己完成很多工作了。她一直感谢我，其实我也觉得在教她的过程中，自己对工作了解得更清楚了。",
    ],

    pinyinParagraphs: [
      "Zhège yuè, wǒmen gōngsī lái le yí ge xīn tóngshì. Tā gāng kāishǐ gōngzuò, duì gōngsī de xìtǒng hé gōngzuò fāngfǎ dōu bú tài shúxī.",
      "Jīnglǐ ràng wǒ dài tā jǐ tiān. Wǒ xiān gàosu tā měitiān yào zuò shénme, yě gěi tā kàn le yǐqián de wénjiàn. Yùdào bù míngbai de dìfang, tā huì mǎshàng wèn wǒ.",
      "Jǐ tiān yǐhòu, tā yǐjīng kěyǐ zìjǐ wánchéng hěn duō gōngzuò le. Tā yìzhí gǎnxiè wǒ, qíshí wǒ yě juéde zài jiāo tā de guòchéng zhōng, zìjǐ duì gōngzuò liǎojiě de gèng qīngchu le.",
    ],

    myanmarParagraphs: [
      "ဒီလမှာ ကုမ္ပဏီကို လုပ်ဖော်ကိုင်ဖက်အသစ်တစ်ယောက်ဝင်လာတယ်။ အလုပ်အသစ်စတာမို့ ကုမ္ပဏီ system နဲ့ အလုပ်လုပ်ပုံတွေကို မရင်းနှီးသေးဘူး။",
      "Manager က ရက်အနည်းငယ် သူ့ကိုသင်ပေးဖို့ကျွန်မကိုပြောတယ်။ နေ့တိုင်းဘာလုပ်ရမလဲပြောပြီး အရင်ကဖိုင်တွေကိုပြတယ်။ နားမလည်တာရှိရင် သူကချက်ချင်းမေးတယ်။",
      "ရက်အနည်းငယ်ကြာတော့ သူ့ဘာသာ အလုပ်အများကြီးလုပ်နိုင်လာတယ်။ သူက အမြဲကျေးဇူးတင်တယ်လို့ပြောပေမယ့် ကျွန်မလည်း သူ့ကိုသင်ပေးရင်း ကိုယ့်အလုပ်ကို ပိုနားလည်လာတယ်။",
    ],

    keywords: [
      "同事",
      "系统",
      "方法",
      "熟悉",
      "经理",
      "文件",
      "完成",
      "感谢",
      "过程",
      "了解",
    ],

    audioUrl: null,
    audioText:
      "这个月，我们公司来了一个新同事。她刚开始工作，对公司的系统和工作方法都不太熟悉。经理让我带她几天。我先告诉她每天要做什么，也给她看了以前的文件。遇到不明白的地方，她会马上问我。几天以后，她已经可以自己完成很多工作了。她一直感谢我，其实我也觉得在教她的过程中，自己对工作了解得更清楚了。",
  },

  {
    id: "hsk3-reading-019",
    level: 3,
    order: 19,
    title: "第一次用中文打电话",
    pinyinTitle: "Dì yī cì yòng Zhōngwén dǎ diànhuà",
    myanmarTitle: "ပထမဆုံး တရုတ်လို ဖုန်းပြောခြင်း",
    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "有一天，我需要给一家中国公司打电话问一个问题。以前我只用中文发消息，从来没有正式打过电话，所以非常紧张。",
      "打电话以前，我先把要说的话写下来，还练习了几次。电话接通以后，对方说得比我想象中快，我有几个地方没有听懂，只好请他再说一遍。",
      "最后我们还是把问题说清楚了。挂电话以后，我非常高兴。虽然整个电话只有几分钟，但是这次经历让我更有信心用中文交流。",
    ],

    pinyinParagraphs: [
      "Yǒu yì tiān, wǒ xūyào gěi yì jiā Zhōngguó gōngsī dǎ diànhuà wèn yí ge wèntí. Yǐqián wǒ zhǐ yòng Zhōngwén fā xiāoxi, cónglái méiyǒu zhèngshì dǎ guo diànhuà, suǒyǐ fēicháng jǐnzhāng.",
      "Dǎ diànhuà yǐqián, wǒ xiān bǎ yào shuō de huà xiě xiàlái, hái liànxí le jǐ cì. Diànhuà jiētōng yǐhòu, duìfāng shuō de bǐ wǒ xiǎngxiàng zhōng kuài, wǒ yǒu jǐ ge dìfang méiyǒu tīng dǒng, zhǐhǎo qǐng tā zài shuō yí biàn.",
      "Zuìhòu wǒmen háishi bǎ wèntí shuō qīngchu le. Guà diànhuà yǐhòu, wǒ fēicháng gāoxìng. Suīrán zhěng ge diànhuà zhǐ yǒu jǐ fēnzhōng, dànshì zhè cì jīnglì ràng wǒ gèng yǒu xìnxīn yòng Zhōngwén jiāoliú.",
    ],

    myanmarParagraphs: [
      "တစ်နေ့မှာ တရုတ်ကုမ္ပဏီတစ်ခုကို မေးခွန်းတစ်ခုမေးဖို့ ဖုန်းခေါ်ရတယ်။ အရင်က တရုတ်လို message ပဲပို့ဖူးပြီး formal call မပြောဖူးလို့ အရမ်းစိတ်လှုပ်ရှားတယ်။",
      "မခေါ်ခင် ပြောချင်တာတွေကို အရင်ရေးပြီး အကြိမ်ကြိမ်လေ့ကျင့်တယ်။ ဖုန်းကိုင်တော့ တစ်ဖက်လူက ထင်ထားတာထက် မြန်မြန်ပြောလို့ နေရာတချို့နားမလည်ဘဲ ထပ်ပြောခိုင်းရတယ်။",
      "နောက်ဆုံးတော့ မေးချင်တာကိုရှင်းရှင်းလင်းလင်းပြောနိုင်ခဲ့တယ်။ ဖုန်းချပြီးတော့ အရမ်းပျော်တယ်။ မိနစ်အနည်းငယ်ပဲကြာပေမယ့် တရုတ်လိုဆက်သွယ်ဖို့ ယုံကြည်မှုပိုရှိလာတယ်။",
    ],

    keywords: [
      "公司",
      "正式",
      "紧张",
      "练习",
      "接通",
      "对方",
      "想象",
      "清楚",
      "信心",
      "交流",
    ],

    audioUrl: null,
    audioText:
      "有一天，我需要给一家中国公司打电话问一个问题。以前我只用中文发消息，从来没有正式打过电话，所以非常紧张。打电话以前，我先把要说的话写下来，还练习了几次。电话接通以后，对方说得比我想象中快，我有几个地方没有听懂，只好请他再说一遍。最后我们还是把问题说清楚了。挂电话以后，我非常高兴。虽然整个电话只有几分钟，但是这次经历让我更有信心用中文交流。",
  },

  {
    id: "hsk3-reading-020",
    level: 3,
    order: 20,
    title: "我开始喜欢阅读",
    pinyinTitle: "Wǒ kāishǐ xǐhuan yuèdú",
    myanmarTitle: "စာဖတ်ရတာ စကြိုက်လာခြင်း",
    category: "school",
    difficulty: "easy",
    estimatedMinutes: 4,

    paragraphs: [
      "以前我不太喜欢看书，因为觉得看书比较慢，而且没有看视频那么轻松。可是老师建议我每天读一点简单的中文文章。",
      "刚开始的时候，我读五分钟就觉得累，而且有很多词不认识。后来我不再每个词都查，只看重要的词，也试着根据前后的句子猜意思。",
      "慢慢地，我发现阅读变得没有那么难了。我现在每天晚上都会读十到二十分钟。除了学到新的词，我也觉得自己的注意力比以前好了。",
    ],

    pinyinParagraphs: [
      "Yǐqián wǒ bú tài xǐhuan kàn shū, yīnwèi juéde kàn shū bǐjiào màn, érqiě méiyǒu kàn shìpín nàme qīngsōng. Kěshì lǎoshī jiànyì wǒ měitiān dú yìdiǎn jiǎndān de Zhōngwén wénzhāng.",
      "Gāng kāishǐ de shíhou, wǒ dú wǔ fēnzhōng jiù juéde lèi, érqiě yǒu hěn duō cí bù rènshi. Hòulái wǒ bú zài měi ge cí dōu chá, zhǐ kàn zhòngyào de cí, yě shìzhe gēnjù qiánhòu de jùzi cāi yìsi.",
      "Mànmàn de, wǒ fāxiàn yuèdú biàn de méiyǒu nàme nán le. Wǒ xiànzài měitiān wǎnshang dōu huì dú shí dào èrshí fēnzhōng. Chúle xué dào xīn de cí, wǒ yě juéde zìjǐ de zhùyìlì bǐ yǐqián hǎo le.",
    ],

    myanmarParagraphs: [
      "အရင်က စာဖတ်တာသိပ်မကြိုက်ဘူး။ စာဖတ်တာနှေးပြီး video ကြည့်သလို မပေါ့ပါးဘူးလို့ထင်တယ်။ ဒါပေမယ့် ဆရာက နေ့တိုင်း လွယ်တဲ့တရုတ်စာဆောင်းပါးနည်းနည်းဖတ်ဖို့ အကြံပေးတယ်။",
      "အစမှာ ၅ မိနစ်ဖတ်တာနဲ့ပင်ပန်းပြီး စကားလုံးအများကြီးမသိဘူး။ နောက်တော့ စကားလုံးတိုင်းကို မရှာတော့ဘဲ အရေးကြီးတာပဲကြည့်ပြီး ရှေ့နောက်စာကြောင်းအရ အဓိပ္ပာယ်ခန့်မှန်းတယ်။",
      "တဖြည်းဖြည်းနဲ့ reading က အရင်လောက်မခက်တော့ဘူး။ အခုညတိုင်း ၁၀–၂၀ မိနစ်ဖတ်တယ်။ စကားလုံးအသစ်ရတာအပြင် concentration လည်း အရင်ထက်ကောင်းလာတယ်လို့ခံစားရတယ်။",
    ],

    keywords: [
      "阅读",
      "视频",
      "文章",
      "认识",
      "重要",
      "根据",
      "猜",
      "意思",
      "注意力",
      "以前",
    ],

    audioUrl: null,
    audioText:
      "以前我不太喜欢看书，因为觉得看书比较慢，而且没有看视频那么轻松。可是老师建议我每天读一点简单的中文文章。刚开始的时候，我读五分钟就觉得累，而且有很多词不认识。后来我不再每个词都查，只看重要的词，也试着根据前后的句子猜意思。慢慢地，我发现阅读变得没有那么难了。我现在每天晚上都会读十到二十分钟。除了学到新的词，我也觉得自己的注意力比以前好了。",
  },
];

export function getHsk3ReadingSourceStories() {
  return [...HSK3_READING_STORIES].sort(
    (a, b) => a.order - b.order,
  );
}