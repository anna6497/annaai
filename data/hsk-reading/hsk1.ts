export type HskReadingStory = {
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

  /*
   * Later we will upload one MP3 file
   * for each story.
   *
   * Keep null for now so the page
   * does not request a missing file.
   */
  audioUrl: string | null;

  /*
   * Full Chinese text used for
   * TTS fallback / future audio generation.
   */
  audioText: string;
};

export const HSK1_READING_STORIES:
  HskReadingStory[] = [
  {
    id: "hsk1-reading-001",
    level: 1,
    order: 1,

    title: "我的一天",
    pinyinTitle:
      "Wǒ de yì tiān",
    myanmarTitle:
      "ကျွန်မရဲ့ တစ်နေ့တာ",

    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 3,

    paragraphs: [
      "我每天早上六点起床。起床以后，我先喝水，然后洗脸。七点的时候，我和爸爸妈妈一起吃早饭。我们常常吃面包、鸡蛋，也喝牛奶。吃完早饭以后，我准备去学校。",

      "我的学校离家不远，所以我常常走路去学校。上午我们上中文课，也上别的课。我喜欢中文课，因为老师很好。我不明白的时候，可以问老师，老师会告诉我。",

      "中午，我和同学一起吃午饭。下午放学以后，我回家做作业。做完以后，我有时候看电视，有时候听中文。晚上我们一家人一起吃晚饭，也会说说今天的事。十点左右，我就睡觉了。每天有一点忙，但是我很高兴。",
    ],

    pinyinParagraphs: [
      "Wǒ měitiān zǎoshang liù diǎn qǐchuáng. Qǐchuáng yǐhòu, wǒ xiān hē shuǐ, ránhòu xǐliǎn. Qī diǎn de shíhou, wǒ hé bàba māma yìqǐ chī zǎofàn. Wǒmen chángcháng chī miànbāo, jīdàn, yě hē niúnǎi. Chī wán zǎofàn yǐhòu, wǒ zhǔnbèi qù xuéxiào.",

      "Wǒ de xuéxiào lí jiā bù yuǎn, suǒyǐ wǒ chángcháng zǒulù qù xuéxiào. Shàngwǔ wǒmen shàng Zhōngwén kè, yě shàng bié de kè. Wǒ xǐhuan Zhōngwén kè, yīnwèi lǎoshī hěn hǎo. Wǒ bù míngbai de shíhou, kěyǐ wèn lǎoshī, lǎoshī huì gàosu wǒ.",

      "Zhōngwǔ, wǒ hé tóngxué yìqǐ chī wǔfàn. Xiàwǔ fàngxué yǐhòu, wǒ huí jiā zuò zuòyè. Zuò wán yǐhòu, wǒ yǒu shíhou kàn diànshì, yǒu shíhou tīng Zhōngwén. Wǎnshang wǒmen yì jiā rén yìqǐ chī wǎnfàn, yě huì shuōshuo jīntiān de shì. Shí diǎn zuǒyòu, wǒ jiù shuìjiào le. Měitiān yǒu yìdiǎn máng, dànshì wǒ hěn gāoxìng.",
    ],

    myanmarParagraphs: [
      "ကျွန်မက နေ့တိုင်း မနက် ၆ နာရီမှာ အိပ်ရာထတယ်။ အိပ်ရာထပြီးရင် အရင်ရေသောက်ပြီး မျက်နှာသစ်တယ်။ ၇ နာရီလောက်မှာ အဖေ၊ အမေနဲ့အတူ မနက်စာစားတယ်။ ပေါင်မုန့်၊ ကြက်ဥစားပြီး နွားနို့လည်း သောက်တတ်တယ်။ မနက်စာစားပြီးရင် ကျောင်းသွားဖို့ ပြင်ဆင်တယ်။",

      "ကျွန်မရဲ့ကျောင်းက အိမ်နဲ့မဝေးလို့ လမ်းလျှောက်ပြီး ကျောင်းသွားတတ်တယ်။ မနက်ပိုင်းမှာ တရုတ်စာအတန်းနဲ့ တခြားဘာသာတွေတက်တယ်။ ကျွန်မက တရုတ်စာအတန်းကို ကြိုက်တယ်၊ ဘာလို့လဲဆိုတော့ ဆရာက အရမ်းကောင်းတယ်။ နားမလည်တဲ့အခါ ဆရာကို မေးလို့ရပြီး ဆရာက ရှင်းပြပေးတယ်။",

      "နေ့လယ်မှာ အတန်းဖော်တွေနဲ့အတူ နေ့လယ်စာစားတယ်။ ကျောင်းဆင်းပြီးရင် အိမ်ပြန်ပြီး အိမ်စာလုပ်တယ်။ ပြီးသွားရင် တစ်ခါတလေ TV ကြည့်တယ်၊ တစ်ခါတလေ တရုတ်စာနားထောင်တယ်။ ညဘက်မှာ မိသားစုနဲ့အတူ ညစာစားပြီး ဒီနေ့ဖြစ်ခဲ့တာတွေ ပြောကြတယ်။ ၁၀ နာရီလောက်ဆို အိပ်တယ်။ နေ့တိုင်း နည်းနည်းအလုပ်များပေမယ့် ကျွန်မပျော်တယ်။",
    ],

    keywords: [
      "每天",
      "早上",
      "起床",
      "早饭",
      "学校",
      "中文",
      "老师",
      "同学",
      "午饭",
      "放学",
      "晚上",
      "睡觉",
    ],

    audioUrl: null,

    audioText:
      "我每天早上六点起床。起床以后，我先喝水，然后洗脸。七点的时候，我和爸爸妈妈一起吃早饭。我们常常吃面包、鸡蛋，也喝牛奶。吃完早饭以后，我准备去学校。我的学校离家不远，所以我常常走路去学校。上午我们上中文课，也上别的课。我喜欢中文课，因为老师很好。我不明白的时候，可以问老师，老师会告诉我。中午，我和同学一起吃午饭。下午放学以后，我回家做作业。做完以后，我有时候看电视，有时候听中文。晚上我们一家人一起吃晚饭，也会说说今天的事。十点左右，我就睡觉了。每天有一点忙，但是我很高兴。",
  },

  {
    id: "hsk1-reading-002",
    level: 1,
    order: 2,

    title: "下雨的一天",
    pinyinTitle:
      "Xiàyǔ de yì tiān",
    myanmarTitle:
      "မိုးရွာတဲ့ တစ်နေ့",

    category: "daily-life",
    difficulty: "easy",
    estimatedMinutes: 3,

    paragraphs: [
      "今天早上我起床以后，看到外边正在下雨。天气很冷，风也很大。我本来想走路去学校，但是妈妈说：“今天下雨，你不要走路去，坐车吧。”我看了看时间，马上拿上书包出门了。",

      "我到了车站以后，那里已经有很多人。大家都在等车。过了一会儿，车来了。我上车以后找到一个地方坐下。车上有学生，也有去上班的人。因为路上的车很多，所以我们走得有一点慢。",

      "我到学校的时候已经快上课了。我马上跑进教室。老师看到我以后笑着说：“今天没有迟到，很好！”我也笑了。虽然今天一直下雨，但是我觉得这一天还是很好。",
    ],

    pinyinParagraphs: [
      "Jīntiān zǎoshang wǒ qǐchuáng yǐhòu, kàndào wàibian zhèngzài xiàyǔ. Tiānqì hěn lěng, fēng yě hěn dà. Wǒ běnlái xiǎng zǒulù qù xuéxiào, dànshì māma shuō: “Jīntiān xiàyǔ, nǐ búyào zǒulù qù, zuò chē ba.” Wǒ kàn le kan shíjiān, mǎshàng ná shàng shūbāo chūmén le.",

      "Wǒ dào le chēzhàn yǐhòu, nàli yǐjīng yǒu hěn duō rén. Dàjiā dōu zài děng chē. Guò le yíhuìr, chē lái le. Wǒ shàng chē yǐhòu zhǎodào yí ge dìfang zuòxià. Chē shàng yǒu xuésheng, yě yǒu qù shàngbān de rén. Yīnwèi lùshang de chē hěn duō, suǒyǐ wǒmen zǒu de yǒu yìdiǎn màn.",

      "Wǒ dào xuéxiào de shíhou yǐjīng kuài shàngkè le. Wǒ mǎshàng pǎo jìn jiàoshì. Lǎoshī kàndào wǒ yǐhòu xiàozhe shuō: “Jīntiān méiyǒu chídào, hěn hǎo!” Wǒ yě xiào le. Suīrán jīntiān yìzhí xiàyǔ, dànshì wǒ juéde zhè yì tiān háishi hěn hǎo.",
    ],

    myanmarParagraphs: [
      "ဒီနေ့မနက် အိပ်ရာထပြီး အပြင်ကိုကြည့်လိုက်တော့ မိုးရွာနေတယ်။ ရာသီဥတုအေးပြီး လေလည်းတိုက်တယ်။ မူလက ကျောင်းကို လမ်းလျှောက်သွားမလို့ပေမယ့် အမေက မိုးရွာလို့ ကားစီးသွားဖို့ ပြောတယ်။ အချိန်ကြည့်ပြီး စာအိတ်ယူကာ ချက်ချင်းအိမ်ကထွက်လာတယ်။",

      "ကားမှတ်တိုင်ရောက်တော့ လူအများကြီး ကားစောင့်နေကြတယ်။ ခဏကြာတော့ ကားရောက်လာတယ်။ ကားပေါ်တက်ပြီး ထိုင်စရာနေရာတစ်ခု ရှာတွေ့တယ်။ ကားပေါ်မှာ ကျောင်းသားတွေရော အလုပ်သွားသူတွေရောရှိတယ်။ လမ်းမှာကားများလို့ နည်းနည်းနှေးတယ်။",

      "ကျောင်းရောက်တဲ့အချိန် အတန်းစတော့မလို ဖြစ်နေပြီ။ ကျွန်မချက်ချင်း စာသင်ခန်းထဲပြေးဝင်လိုက်တယ်။ ဆရာက ကျွန်မကိုတွေ့တော့ “ဒီနေ့နောက်မကျဘူး၊ ကောင်းတယ်” လို့ပြုံးပြီးပြောတယ်။ ကျွန်မလည်းပြုံးလိုက်တယ်။ တစ်နေ့လုံးမိုးရွာပေမယ့် ကောင်းတဲ့နေ့တစ်နေ့လို့ ခံစားရတယ်။",
    ],

    keywords: [
      "下雨",
      "天气",
      "冷",
      "走路",
      "学校",
      "车站",
      "等",
      "上车",
      "学生",
      "上班",
      "时间",
      "老师",
    ],

    audioUrl: null,

    audioText:
      "今天早上我起床以后，看到外边正在下雨。天气很冷，风也很大。我本来想走路去学校，但是妈妈说，今天下雨，你不要走路去，坐车吧。我看了看时间，马上拿上书包出门了。我到了车站以后，那里已经有很多人。大家都在等车。过了一会儿，车来了。我上车以后找到一个地方坐下。车上有学生，也有去上班的人。因为路上的车很多，所以我们走得有一点慢。我到学校的时候已经快上课了。我马上跑进教室。老师看到我以后笑着说，今天没有迟到，很好。我也笑了。虽然今天一直下雨，但是我觉得这一天还是很好。",
  },

  {
    id: "hsk1-reading-003",
    level: 1,
    order: 3,

    title: "去书店买书",
    pinyinTitle:
      "Qù shūdiàn mǎi shū",
    myanmarTitle:
      "စာအုပ်ဆိုင်သွားပြီး စာအုပ်ဝယ်ခြင်း",

    category: "shopping",
    difficulty: "easy",
    estimatedMinutes: 3,

    paragraphs: [
      "星期天上午，我没有上课，所以我想去书店买一本中文书。我最近很喜欢学习中文，也想认识更多汉字。吃完早饭以后，我拿上钱包和手机，一个人去了书店。",

      "书店很大，里边有很多书。我先看中文课本，然后又看了一些故事书。有一本书很好看，但是有一点贵。我看了很长时间，最后还是决定买它。",

      "我拿着书去给钱的时候，看到旁边还有一本小书。我打开看了一下，里边的中文很简单。我想：“这本书也很适合我。”所以最后我买了两本书。回家的路上，我很高兴，想马上开始读。",
    ],

    pinyinParagraphs: [
      "Xīngqītiān shàngwǔ, wǒ méiyǒu shàngkè, suǒyǐ wǒ xiǎng qù shūdiàn mǎi yì běn Zhōngwén shū. Wǒ zuìjìn hěn xǐhuan xuéxí Zhōngwén, yě xiǎng rènshi gèng duō Hànzì. Chī wán zǎofàn yǐhòu, wǒ ná shàng qiánbāo hé shǒujī, yí ge rén qù le shūdiàn.",

      "Shūdiàn hěn dà, lǐbian yǒu hěn duō shū. Wǒ xiān kàn Zhōngwén kèběn, ránhòu yòu kàn le yìxiē gùshì shū. Yǒu yì běn shū hěn hǎokàn, dànshì yǒu yìdiǎn guì. Wǒ kàn le hěn cháng shíjiān, zuìhòu háishi juédìng mǎi tā.",

      "Wǒ názhe shū qù gěi qián de shíhou, kàndào pángbiān hái yǒu yì běn xiǎo shū. Wǒ dǎkāi kàn le yíxià, lǐbian de Zhōngwén hěn jiǎndān. Wǒ xiǎng: “Zhè běn shū yě hěn shìhé wǒ.” Suǒyǐ zuìhòu wǒ mǎi le liǎng běn shū. Huí jiā de lùshang, wǒ hěn gāoxìng, xiǎng mǎshàng kāishǐ dú.",
    ],

    myanmarParagraphs: [
      "တနင်္ဂနွေနေ့ မနက်ပိုင်းမှာ အတန်းမရှိလို့ တရုတ်စာအုပ်တစ်အုပ်ဝယ်ဖို့ စာအုပ်ဆိုင်သွားချင်ခဲ့တယ်။ အခုတလော တရုတ်စာလေ့လာရတာ အရမ်းကြိုက်ပြီး တရုတ်အက္ခရာတွေ ပိုသိချင်တယ်။ မနက်စာစားပြီး ပိုက်ဆံအိတ်နဲ့ဖုန်းယူကာ စာအုပ်ဆိုင်သွားတယ်။",

      "စာအုပ်ဆိုင်က ကြီးပြီး စာအုပ်တွေအများကြီးရှိတယ်။ အရင်တရုတ်စာသင်စာအုပ်တွေကြည့်ပြီး နောက်တော့ ပုံပြင်စာအုပ်တွေကို ကြည့်တယ်။ စာအုပ်တစ်အုပ်က အရမ်းစိတ်ဝင်စားဖို့ကောင်းပေမယ့် နည်းနည်းဈေးကြီးတယ်။ အချိန်တော်တော်ကြာကြည့်ပြီး နောက်ဆုံးဝယ်ဖို့ဆုံးဖြတ်လိုက်တယ်။",

      "ပိုက်ဆံရှင်းဖို့သွားတဲ့အချိန် ဘေးမှာ စာအုပ်သေးသေးတစ်အုပ် ထပ်တွေ့တယ်။ ဖွင့်ကြည့်တော့ အထဲကတရုတ်စာက လွယ်တယ်။ ကိုယ့်အတွက်သင့်တော်တယ်လို့ထင်ပြီး နောက်ဆုံး စာအုပ်နှစ်အုပ်ဝယ်ခဲ့တယ်။ အိမ်ပြန်လမ်းမှာ အရမ်းပျော်ပြီး ချက်ချင်းဖတ်ချင်နေတယ်။",
    ],

    keywords: [
      "星期天",
      "书店",
      "买",
      "中文",
      "学习",
      "汉字",
      "钱包",
      "手机",
      "课本",
      "打开",
      "回家",
      "高兴",
    ],

    audioUrl: null,

    audioText:
      "星期天上午，我没有上课，所以我想去书店买一本中文书。我最近很喜欢学习中文，也想认识更多汉字。吃完早饭以后，我拿上钱包和手机，一个人去了书店。书店很大，里边有很多书。我先看中文课本，然后又看了一些故事书。有一本书很好看，但是有一点贵。我看了很长时间，最后还是决定买它。我拿着书去给钱的时候，看到旁边还有一本小书。我打开看了一下，里边的中文很简单。我想，这本书也很适合我。所以最后我买了两本书。回家的路上，我很高兴，想马上开始读。",
  },

  {
    id: "hsk1-reading-004",
    level: 1,
    order: 4,

    title: "我的新朋友",
    pinyinTitle:
      "Wǒ de xīn péngyou",
    myanmarTitle:
      "ကျွန်မရဲ့ သူငယ်ချင်းအသစ်",

    category: "friends",
    difficulty: "medium",
    estimatedMinutes: 3,

    paragraphs: [
      "这个星期，我们班来了一个新同学。她叫小美，今年二十岁。第一天上课的时候，她坐在我旁边。老师让她介绍自己。她说她喜欢学习中文，也喜欢听歌、看电影。",

      "下课以后，我跟她说：“你好，我叫安娜。你刚来这里，如果有不明白的地方，可以问我。”她笑着说：“谢谢你！我还不认识很多人。”后来我们一起去吃午饭。",

      "吃饭的时候，我们说了很多话。我知道她家离学校很远，所以每天都要很早起床。她也告诉我，她最喜欢中文，但是觉得汉字有一点难。我说：“没关系，我们可以一起学习。”从那天以后，我们常常一起上课、吃饭和学习。现在我们已经是很好的朋友了。",
    ],

    pinyinParagraphs: [
      "Zhège xīngqī, wǒmen bān lái le yí ge xīn tóngxué. Tā jiào Xiǎoměi, jīnnián èrshí suì. Dì yī tiān shàngkè de shíhou, tā zuò zài wǒ pángbiān. Lǎoshī ràng tā jièshào zìjǐ. Tā shuō tā xǐhuan xuéxí Zhōngwén, yě xǐhuan tīng gē, kàn diànyǐng.",

      "Xiàkè yǐhòu, wǒ gēn tā shuō: “Nǐ hǎo, wǒ jiào Ānnà. Nǐ gāng lái zhèlǐ, rúguǒ yǒu bù míngbai de dìfang, kěyǐ wèn wǒ.” Tā xiàozhe shuō: “Xièxie nǐ! Wǒ hái bù rènshi hěn duō rén.” Hòulái wǒmen yìqǐ qù chī wǔfàn.",

      "Chīfàn de shíhou, wǒmen shuō le hěn duō huà. Wǒ zhīdào tā jiā lí xuéxiào hěn yuǎn, suǒyǐ měitiān dōu yào hěn zǎo qǐchuáng. Tā yě gàosu wǒ, tā zuì xǐhuan Zhōngwén, dànshì juéde Hànzì yǒu yìdiǎn nán. Wǒ shuō: “Méiguānxi, wǒmen kěyǐ yìqǐ xuéxí.” Cóng nà tiān yǐhòu, wǒmen chángcháng yìqǐ shàngkè, chīfàn hé xuéxí. Xiànzài wǒmen yǐjīng shì hěn hǎo de péngyou le.",
    ],

    myanmarParagraphs: [
      "ဒီအပတ်မှာ ကျွန်မတို့အတန်းကို အတန်းဖော်အသစ်တစ်ယောက် ရောက်လာတယ်။ သူ့နာမည်က Xiaomei ဖြစ်ပြီး အသက် ၂၀ ရှိပြီ။ ပထမဆုံးအတန်းတက်တဲ့နေ့မှာ ကျွန်မဘေးမှာထိုင်တယ်။ ဆရာက ကိုယ့်ကိုယ်ကိုမိတ်ဆက်ခိုင်းတော့ သူက တရုတ်စာလေ့လာရတာ၊ သီချင်းနားထောင်တာနဲ့ ရုပ်ရှင်ကြည့်တာကြိုက်တယ်လို့ ပြောတယ်။",

      "အတန်းပြီးတော့ ကျွန်မက သူ့ကို “မင်္ဂလာပါ၊ ကျွန်မနာမည် Anna ပါ။ အခုမှရောက်တာဆိုတော့ နားမလည်တာရှိရင် ကျွန်မကိုမေးလို့ရတယ်” လို့ပြောတယ်။ သူက “ကျေးဇူးတင်ပါတယ်။ ဒီမှာလူအများကြီးကို မသိသေးဘူး” လို့ပြန်ပြောတယ်။ နောက်တော့ နေ့လယ်စာအတူသွားစားကြတယ်။",

      "စားရင်းနဲ့ အကြောင်းအရာအများကြီးပြောဖြစ်တယ်။ သူ့အိမ်ကကျောင်းနဲ့ဝေးလို့ နေ့တိုင်းစောစောထရတယ်ဆိုတာ သိလာတယ်။ သူက တရုတ်စာအကြိုက်ဆုံးပေမယ့် Hanzi ကို နည်းနည်းခက်တယ်လို့လည်းပြောတယ်။ ကျွန်မက “ကိစ္စမရှိဘူး၊ အတူလေ့လာလို့ရတယ်” လို့ပြောလိုက်တယ်။ အဲဒီနေ့ကစပြီး အတူတန်းတက်၊ အတူစား၊ အတူလေ့လာဖြစ်ပြီး အခုတော့ သူငယ်ချင်းကောင်းတွေဖြစ်နေပြီ။",
    ],

    keywords: [
      "同学",
      "朋友",
      "老师",
      "介绍",
      "中文",
      "听",
      "电影",
      "认识",
      "午饭",
      "学校",
      "汉字",
      "一起",
    ],

    audioUrl: null,

    audioText:
      "这个星期，我们班来了一个新同学。她叫小美，今年二十岁。第一天上课的时候，她坐在我旁边。老师让她介绍自己。她说她喜欢学习中文，也喜欢听歌、看电影。下课以后，我跟她说，你好，我叫安娜。你刚来这里，如果有不明白的地方，可以问我。她笑着说，谢谢你，我还不认识很多人。后来我们一起去吃午饭。吃饭的时候，我们说了很多话。我知道她家离学校很远，所以每天都要很早起床。她也告诉我，她最喜欢中文，但是觉得汉字有一点难。我说，没关系，我们可以一起学习。从那天以后，我们常常一起上课、吃饭和学习。现在我们已经是很好的朋友了。",
  },

  {
    id: "hsk1-reading-005",
    level: 1,
    order: 5,

    title: "星期天去商场",
    pinyinTitle:
      "Xīngqītiān qù shāngchǎng",
    myanmarTitle:
      "တနင်္ဂနွေနေ့ Shopping Mall သွားခြင်း",

    category: "shopping",
    difficulty: "medium",
    estimatedMinutes: 3,

    paragraphs: [
      "星期天早上，天气很好。我和妈妈都没有事，所以我们决定一起去商场。妈妈想买衣服，我想买一个新的书包。我们吃完早饭以后就出门了。",

      "到了商场以后，我们先去看衣服。妈妈看了一件白色的衣服，又看了一件红色的。她问我：“你觉得哪一件好看？”我说：“白色的很好看。”妈妈试了一下，也觉得很好，所以就买了。",

      "后来我们去看书包。我看到一个黑色的书包，非常喜欢。但是妈妈问：“这个多少钱？”我一看，真的有一点贵。我们又看了几个，最后找到一个很好看，也不太贵的书包。我很高兴。买完东西以后，我们一起吃了午饭，然后坐车回家。",
    ],

    pinyinParagraphs: [
      "Xīngqītiān zǎoshang, tiānqì hěn hǎo. Wǒ hé māma dōu méiyǒu shì, suǒyǐ wǒmen juédìng yìqǐ qù shāngchǎng. Māma xiǎng mǎi yīfu, wǒ xiǎng mǎi yí ge xīn de shūbāo. Wǒmen chī wán zǎofàn yǐhòu jiù chūmén le.",

      "Dào le shāngchǎng yǐhòu, wǒmen xiān qù kàn yīfu. Māma kàn le yí jiàn báisè de yīfu, yòu kàn le yí jiàn hóngsè de. Tā wèn wǒ: “Nǐ juéde nǎ yí jiàn hǎokàn?” Wǒ shuō: “Báisè de hěn hǎokàn.” Māma shì le yíxià, yě juéde hěn hǎo, suǒyǐ jiù mǎi le.",

      "Hòulái wǒmen qù kàn shūbāo. Wǒ kàndào yí ge hēisè de shūbāo, fēicháng xǐhuan. Dànshì māma wèn: “Zhège duōshao qián?” Wǒ yí kàn, zhēnde yǒu yìdiǎn guì. Wǒmen yòu kàn le jǐ ge, zuìhòu zhǎodào yí ge hěn hǎokàn, yě bú tài guì de shūbāo. Wǒ hěn gāoxìng. Mǎi wán dōngxi yǐhòu, wǒmen yìqǐ chī le wǔfàn, ránhòu zuò chē huí jiā.",
    ],

    myanmarParagraphs: [
      "တနင်္ဂနွေနေ့မနက် ရာသီဥတုကောင်းတယ်။ အမေနဲ့ကျွန်မ နှစ်ယောက်စလုံး အလုပ်မရှိလို့ shopping mall ကိုအတူသွားဖို့ ဆုံးဖြတ်လိုက်တယ်။ အမေက အဝတ်အစားဝယ်ချင်ပြီး ကျွန်မက စာအိတ်အသစ်ဝယ်ချင်တယ်။ မနက်စာစားပြီး ချက်ချင်းထွက်လာခဲ့တယ်။",

      "Shopping mall ရောက်တော့ အရင်ဆုံး အဝတ်အစားသွားကြည့်တယ်။ အမေက အဖြူရောင်အဝတ်တစ်ထည်နဲ့ အနီရောင်တစ်ထည်ကြည့်ပြီး “ဘယ်ဟာပိုလှတယ်ထင်လဲ” လို့မေးတယ်။ ကျွန်မက အဖြူရောင်ပိုလှတယ်လို့ပြောတယ်။ အမေစမ်းဝတ်ကြည့်ပြီး ကြိုက်လို့ ဝယ်လိုက်တယ်။",

      "နောက်တော့ စာအိတ်သွားကြည့်တယ်။ အမည်းရောင်စာအိတ်တစ်လုံးကို ကျွန်မအရမ်းကြိုက်ပေမယ့် ဈေးနည်းနည်းကြီးတယ်။ တခြားဟာတွေထပ်ကြည့်ပြီး နောက်ဆုံး လှလည်းလှ၊ ဈေးလည်းသိပ်မကြီးတဲ့စာအိတ်တစ်လုံး ရှာတွေ့တယ်။ အရမ်းပျော်တယ်။ ပစ္စည်းဝယ်ပြီး နေ့လယ်စာစားကာ ကားစီးပြီးအိမ်ပြန်ခဲ့တယ်။",
    ],

    keywords: [
      "星期天",
      "天气",
      "商场",
      "衣服",
      "书包",
      "买",
      "好看",
      "觉得",
      "多少钱",
      "贵",
      "午饭",
      "回家",
    ],

    audioUrl: null,

    audioText:
      "星期天早上，天气很好。我和妈妈都没有事，所以我们决定一起去商场。妈妈想买衣服，我想买一个新的书包。我们吃完早饭以后就出门了。到了商场以后，我们先去看衣服。妈妈看了一件白色的衣服，又看了一件红色的。她问我，你觉得哪一件好看？我说，白色的很好看。妈妈试了一下，也觉得很好，所以就买了。后来我们去看书包。我看到一个黑色的书包，非常喜欢。但是妈妈问，这个多少钱？我一看，真的有一点贵。我们又看了几个，最后找到一个很好看，也不太贵的书包。我很高兴。买完东西以后，我们一起吃了午饭，然后坐车回家。",
  },
];

export function getHsk1ReadingStories() {
  return [
    ...HSK1_READING_STORIES,
  ].sort(
    (a, b) =>
      a.order - b.order,
  );
}

export function getHsk1ReadingStory(
  id: string,
) {
  return (
    HSK1_READING_STORIES.find(
      (story) =>
        story.id === id,
    ) ?? null
  );
}