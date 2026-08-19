import fs from "node:fs";
import path from "node:path";

type Category =
  | "daily-life"
  | "school"
  | "friends"
  | "shopping"
  | "travel";

type Difficulty =
  | "easy"
  | "medium"
  | "hard";

type Topic = {
  title: string;
  pinyinTitle: string;
  myanmarTitle: string;
  category: Category;
};

const ROOT =
  process.cwd();

const SOURCE_DIR =
  path.join(
    ROOT,
    "data",
    "hsk-reading",
    "source",
  );

/*
 * -------------------------------------------------------
 * TOPICS
 * -------------------------------------------------------
 */

const TOPICS: Record<
  number,
  Topic[]
> = {
  3: [
    {
      title: "第一次参加中文活动",
      pinyinTitle:
        "Dì yī cì cānjiā Zhōngwén huódòng",
      myanmarTitle:
        "ပထမဆုံး တရုတ်စာလှုပ်ရှားမှုတက်ခြင်း",
      category: "school",
    },
    {
      title: "找新工作的经历",
      pinyinTitle:
        "Zhǎo xīn gōngzuò de jīnglì",
      myanmarTitle:
        "အလုပ်အသစ်ရှာခဲ့တဲ့အတွေ့အကြုံ",
      category: "daily-life",
    },
    {
      title: "周末去郊外",
      pinyinTitle:
        "Zhōumò qù jiāowài",
      myanmarTitle:
        "ပိတ်ရက် မြို့ပြင်သွားခြင်း",
      category: "travel",
    },
    {
      title: "我的新邻居",
      pinyinTitle:
        "Wǒ de xīn línjū",
      myanmarTitle:
        "ကျွန်မရဲ့ အိမ်နီးချင်းအသစ်",
      category: "friends",
    },
    {
      title: "忘记带钥匙",
      pinyinTitle:
        "Wàngjì dài yàoshi",
      myanmarTitle:
        "သော့ယူဖို့ မေ့သွားခြင်း",
      category: "daily-life",
    },
    {
      title: "第一次一个人旅行",
      pinyinTitle:
        "Dì yī cì yí ge rén lǚxíng",
      myanmarTitle:
        "ပထမဆုံး တစ်ယောက်တည်းခရီးသွားခြင်း",
      category: "travel",
    },
    {
      title: "在网上买东西",
      pinyinTitle:
        "Zài wǎngshàng mǎi dōngxi",
      myanmarTitle:
        "အွန်လိုင်းက ပစ္စည်းဝယ်ခြင်း",
      category: "shopping",
    },
    {
      title: "和朋友发生误会",
      pinyinTitle:
        "Hé péngyou fāshēng wùhuì",
      myanmarTitle:
        "သူငယ်ချင်းနဲ့ နားလည်မှုလွဲခြင်း",
      category: "friends",
    },
    {
      title: "下班后的生活",
      pinyinTitle:
        "Xiàbān hòu de shēnghuó",
      myanmarTitle:
        "အလုပ်ဆင်းပြီးနောက် ဘဝ",
      category: "daily-life",
    },
    {
      title: "第一次参加面试",
      pinyinTitle:
        "Dì yī cì cānjiā miànshì",
      myanmarTitle:
        "ပထမဆုံး အလုပ်အင်တာဗျူးဖြေခြင်း",
      category: "daily-life",
    },
    {
      title: "学会管理时间",
      pinyinTitle:
        "Xuéhuì guǎnlǐ shíjiān",
      myanmarTitle:
        "အချိန်စီမံခန့်ခွဲတတ်လာခြင်း",
      category: "school",
    },
    {
      title: "去朋友家做客",
      pinyinTitle:
        "Qù péngyou jiā zuòkè",
      myanmarTitle:
        "သူငယ်ချင်းအိမ် အလည်သွားခြင်း",
      category: "friends",
    },
    {
      title: "一次特别的购物经历",
      pinyinTitle:
        "Yí cì tèbié de gòuwù jīnglì",
      myanmarTitle:
        "ထူးခြားတဲ့ ဈေးဝယ်အတွေ့အကြုံ",
      category: "shopping",
    },
    {
      title: "我的中文进步了",
      pinyinTitle:
        "Wǒ de Zhōngwén jìnbù le",
      myanmarTitle:
        "ကျွန်မရဲ့ တရုတ်စာ တိုးတက်လာပြီ",
      category: "school",
    },
    {
      title: "雨天里的帮助",
      pinyinTitle:
        "Yǔtiān lǐ de bāngzhù",
      myanmarTitle:
        "မိုးရွာတဲ့နေ့က အကူအညီ",
      category: "daily-life",
    },
    {
      title: "一次坐错车的经历",
      pinyinTitle:
        "Yí cì zuò cuò chē de jīnglì",
      myanmarTitle:
        "ကားမှားစီးခဲ့တဲ့ အတွေ့အကြုံ",
      category: "travel",
    },
    {
      title: "我的学习计划",
      pinyinTitle:
        "Wǒ de xuéxí jìhuà",
      myanmarTitle:
        "ကျွန်မရဲ့ လေ့လာရေးအစီအစဉ်",
      category: "school",
    },
    {
      title: "帮助新同事",
      pinyinTitle:
        "Bāngzhù xīn tóngshì",
      myanmarTitle:
        "လုပ်ဖော်ကိုင်ဖက်အသစ်ကို ကူညီခြင်း",
      category: "friends",
    },
    {
      title: "第一次用中文打电话",
      pinyinTitle:
        "Dì yī cì yòng Zhōngwén dǎ diànhuà",
      myanmarTitle:
        "ပထမဆုံး တရုတ်လို ဖုန်းပြောခြင်း",
      category: "daily-life",
    },
    {
      title: "我开始喜欢阅读",
      pinyinTitle:
        "Wǒ kāishǐ xǐhuan yuèdú",
      myanmarTitle:
        "စာဖတ်ရတာ စကြိုက်လာခြင်း",
      category: "school",
    },
  ],

  4: [
    ["换工作的决定", "Huàn gōngzuò de juédìng", "အလုပ်ပြောင်းဖို့ ဆုံးဖြတ်ခြင်း", "daily-life"],
    ["一次难忘的旅行", "Yí cì nánwàng de lǚxíng", "မမေ့နိုင်တဲ့ ခရီးတစ်ခေါက်", "travel"],
    ["学习一门外语", "Xuéxí yì mén wàiyǔ", "နိုင်ငံခြားဘာသာတစ်ခုလေ့လာခြင်း", "school"],
    ["和父母的一次谈话", "Hé fùmǔ de yí cì tánhuà", "မိဘတွေနဲ့ စကားပြောခဲ့ခြင်း", "daily-life"],
    ["第一次独立生活", "Dì yī cì dúlì shēnghuó", "ပထမဆုံး ကိုယ့်ဘာသာနေထိုင်ခြင်း", "daily-life"],
    ["重新联系老朋友", "Chóngxīn liánxì lǎo péngyou", "သူငယ်ချင်းဟောင်းနဲ့ ပြန်ဆက်သွယ်ခြင်း", "friends"],
    ["一次工作上的错误", "Yí cì gōngzuò shàng de cuòwù", "အလုပ်မှာ မှားခဲ့ဖူးတဲ့အတွေ့အကြုံ", "daily-life"],
    ["搬家以后", "Bānjiā yǐhòu", "အိမ်ပြောင်းပြီးနောက်", "daily-life"],
    ["一次成功的演讲", "Yí cì chénggōng de yǎnjiǎng", "အောင်မြင်တဲ့ တင်ပြချက်တစ်ခု", "school"],
    ["旅行中的意外", "Lǚxíng zhōng de yìwài", "ခရီးထဲက မထင်မှတ်ထားတဲ့အဖြစ်", "travel"],
    ["如何安排周末", "Rúhé ānpái zhōumò", "ပိတ်ရက်ကို ဘယ်လိုစီစဉ်မလဲ", "daily-life"],
    ["我开始运动以后", "Wǒ kāishǐ yùndòng yǐhòu", "လေ့ကျင့်ခန်းစလုပ်ပြီးနောက်", "daily-life"],
    ["第一次参加会议", "Dì yī cì cānjiā huìyì", "ပထမဆုံး အစည်းအဝေးတက်ခြင်း", "daily-life"],
    ["网上学习的好处", "Wǎngshàng xuéxí de hǎochu", "Online learning ရဲ့ အကျိုးကျေးဇူး", "school"],
    ["朋友之间的信任", "Péngyou zhījiān de xìnrèn", "သူငယ်ချင်းကြား ယုံကြည်မှု", "friends"],
    ["一次特别的礼物", "Yí cì tèbié de lǐwù", "ထူးခြားတဲ့ လက်ဆောင်", "friends"],
    ["城市生活和乡村生活", "Chéngshì shēnghuó hé xiāngcūn shēnghuó", "မြို့ဘဝနဲ့ ကျေးလက်ဘဝ", "daily-life"],
    ["我学会了拒绝", "Wǒ xuéhuì le jùjué", "ငြင်းဆိုတတ်လာခြင်း", "daily-life"],
    ["一个改变我的老师", "Yí ge gǎibiàn wǒ de lǎoshī", "ကျွန်မကိုပြောင်းလဲစေခဲ့တဲ့ဆရာ", "school"],
    ["第一次解决大问题", "Dì yī cì jiějué dà wèntí", "ပထမဆုံး ပြဿနာကြီးဖြေရှင်းခြင်း", "daily-life"],
  ].map(toTopic),

  5: [
    ["选择适合自己的生活", "Xuǎnzé shìhé zìjǐ de shēnghuó", "ကိုယ့်နဲ့သင့်တော်တဲ့ ဘဝရွေးချယ်ခြင်း", "daily-life"],
    ["一次失败带来的改变", "Yí cì shībài dàilái de gǎibiàn", "ရှုံးနိမ့်မှုတစ်ခုက ယူလာတဲ့ပြောင်းလဲမှု", "daily-life"],
    ["我为什么坚持学习中文", "Wǒ wèishénme jiānchí xuéxí Zhōngwén", "တရုတ်စာကို ဘာကြောင့်ဆက်လေ့လာနေလဲ", "school"],
    ["陌生城市里的温暖", "Mòshēng chéngshì lǐ de wēnnuǎn", "မရင်းနှီးတဲ့မြို့က နွေးထွေးမှု", "travel"],
    ["重新开始并不晚", "Chóngxīn kāishǐ bìng bù wǎn", "ပြန်စဖို့ နောက်မကျသေးဘူး", "daily-life"],
    ["一次重要的职业选择", "Yí cì zhòngyào de zhíyè xuǎnzé", "အရေးကြီးတဲ့ အလုပ်အကိုင်ရွေးချယ်မှု", "daily-life"],
    ["与不同的人相处", "Yǔ bùtóng de rén xiāngchǔ", "မတူညီတဲ့လူတွေနဲ့ ပေါင်းသင်းခြင်း", "friends"],
    ["独自旅行让我学到的事", "Dúzì lǚxíng ràng wǒ xué dào de shì", "တစ်ယောက်တည်းခရီးက သင်ပေးခဲ့တာ", "travel"],
    ["改变一个习惯", "Gǎibiàn yí ge xíguàn", "အလေ့အကျင့်တစ်ခု ပြောင်းလဲခြင်း", "daily-life"],
    ["面对工作压力", "Miànduì gōngzuò yālì", "အလုပ်ဖိအားကို ရင်ဆိုင်ခြင်း", "daily-life"],
    ["真正的朋友", "Zhēnzhèng de péngyou", "တကယ့်သူငယ်ချင်း", "friends"],
    ["学习中的低谷", "Xuéxí zhōng de dīgǔ", "လေ့လာရေးအခက်အခဲကာလ", "school"],
    ["第一次公开表达自己", "Dì yī cì gōngkāi biǎodá zìjǐ", "ပထမဆုံး လူရှေ့မှာ ကိုယ့်အမြင်ပြောခြင်း", "school"],
    ["金钱和幸福", "Jīnqián hé xìngfú", "ငွေနဲ့ ပျော်ရွှင်မှု", "daily-life"],
    ["离开熟悉的环境", "Líkāi shúxī de huánjìng", "ရင်းနှီးတဲ့ပတ်ဝန်းကျင်က ထွက်ခွာခြင်း", "travel"],
    ["一次让我后悔的决定", "Yí cì ràng wǒ hòuhuǐ de juédìng", "နောင်တရစေခဲ့တဲ့ဆုံးဖြတ်ချက်", "daily-life"],
    ["如何建立自信", "Rúhé jiànlì zìxìn", "ကိုယ့်ကိုယ်ကို ယုံကြည်မှုတည်ဆောက်ခြင်း", "school"],
    ["帮助别人也帮助自己", "Bāngzhù biérén yě bāngzhù zìjǐ", "သူများကိုကူညီရင်း ကိုယ့်ကိုလည်းကူညီခြင်း", "friends"],
    ["改变计划的一天", "Gǎibiàn jìhuà de yì tiān", "အစီအစဉ်ပြောင်းခဲ့ရတဲ့နေ့", "daily-life"],
    ["我的未来计划", "Wǒ de wèilái jìhuà", "ကျွန်မရဲ့ အနာဂတ်အစီအစဉ်", "daily-life"],
  ].map(toTopic),

  6: [
    ["生活中的取舍", "Shēnghuó zhōng de qǔshě", "ဘဝထဲက ရွေးချယ်စွန့်လွှတ်မှု", "daily-life"],
    ["真正的成长是什么", "Zhēnzhèng de chéngzhǎng shì shénme", "တကယ့်တိုးတက်မှုဆိုတာဘာလဲ", "school"],
    ["一次改变人生方向的决定", "Yí cì gǎibiàn rénshēng fāngxiàng de juédìng", "ဘဝဦးတည်ချက်ပြောင်းစေတဲ့ ဆုံးဖြတ်ချက်", "daily-life"],
    ["陌生环境中的适应", "Mòshēng huánjìng zhōng de shìyìng", "မရင်းနှီးတဲ့ပတ်ဝန်းကျင်နဲ့ လိုက်လျောညီထွေခြင်း", "travel"],
    ["工作与生活的平衡", "Gōngzuò yǔ shēnghuó de pínghéng", "အလုပ်နဲ့ဘဝ အချိုးညီခြင်း", "daily-life"],
    ["失败并不可怕", "Shībài bìng bù kěpà", "ရှုံးနိမ့်မှုကို မကြောက်သင့်ခြင်း", "school"],
    ["信息时代的学习方式", "Xìnxī shídài de xuéxí fāngshì", "သတင်းအချက်အလက်ခေတ်က လေ့လာနည်း", "school"],
    ["人与人之间的距离", "Rén yǔ rén zhījiān de jùlí", "လူတွေအကြား အကွာအဝေး", "friends"],
    ["旅行的真正意义", "Lǚxíng de zhēnzhèng yìyì", "ခရီးသွားခြင်းရဲ့ တကယ့်အဓိပ္ပာယ်", "travel"],
    ["选择稳定还是梦想", "Xuǎnzé wěndìng háishi mèngxiǎng", "တည်ငြိမ်မှုနဲ့ အိပ်မက် ဘာရွေးမလဲ", "daily-life"],
    ["面对批评", "Miànduì pīpíng", "ဝေဖန်မှုကိုရင်ဆိုင်ခြင်း", "daily-life"],
    ["一个人的时间", "Yí ge rén de shíjiān", "တစ်ယောက်တည်းရှိတဲ့အချိန်", "daily-life"],
    ["网络改变了我们的生活", "Wǎngluò gǎibiàn le wǒmen de shēnghuó", "အင်တာနက်က ဘဝကိုပြောင်းလဲစေခြင်း", "school"],
    ["沟通比想象中更重要", "Gōutōng bǐ xiǎngxiàng zhōng gèng zhòngyào", "ဆက်သွယ်ပြောဆိုမှုရဲ့ အရေးပါမှု", "friends"],
    ["重新认识自己", "Chóngxīn rènshi zìjǐ", "ကိုယ့်ကိုယ်ကို ပြန်သိလာခြင်း", "daily-life"],
    ["机会总是留给有准备的人吗", "Jīhuì zǒng shì liú gěi yǒu zhǔnbèi de rén ma", "အခွင့်အရေးက အဆင်သင့်သူအတွက်ပဲလား", "school"],
    ["长期坚持的力量", "Chángqī jiānchí de lìliàng", "ရေရှည်စွဲမြဲမှုရဲ့ အင်အား", "school"],
    ["城市发展的另一面", "Chéngshì fāzhǎn de lìng yí miàn", "မြို့ဖွံ့ဖြိုးမှုရဲ့ တခြားဘက်", "travel"],
    ["当计划赶不上变化", "Dāng jìhuà gǎn bù shàng biànhuà", "အစီအစဉ်က အပြောင်းအလဲကို မမီတဲ့အခါ", "daily-life"],
    ["什么才是成功", "Shénme cái shì chénggōng", "အောင်မြင်မှုဆိုတာ ဘာလဲ", "daily-life"],
  ].map(toTopic),

  7: makeAdvancedTopics(7),
  8: makeAdvancedTopics(8),
  9: makeAdvancedTopics(9),
};

/*
 * -------------------------------------------------------
 * HELPERS
 * -------------------------------------------------------
 */

function toTopic(
  row:
    | string[]
    | readonly string[],
): Topic {
  return {
    title:
      String(row[0]),

    pinyinTitle:
      String(row[1]),

    myanmarTitle:
      String(row[2]),

    category:
      String(
        row[3],
      ) as Category,
  };
}

function makeAdvancedTopics(
  level: number,
): Topic[] {
  const base =
    [
      [
        "科技发展与人的选择",
        "Kējì fāzhǎn yǔ rén de xuǎnzé",
        "နည်းပညာတိုးတက်မှုနဲ့ လူသားရွေးချယ်မှု",
        "school",
      ],
      [
        "全球化时代的生活",
        "Quánqiúhuà shídài de shēnghuó",
        "ကမ္ဘာလုံးဆိုင်ရာခေတ်က ဘဝ",
        "travel",
      ],
      [
        "传统与现代之间",
        "Chuántǒng yǔ xiàndài zhījiān",
        "ရိုးရာနဲ့ ခေတ်မီမှုကြား",
        "daily-life",
      ],
      [
        "教育真正的价值",
        "Jiàoyù zhēnzhèng de jiàzhí",
        "ပညာရေးရဲ့ တကယ့်တန်ဖိုး",
        "school",
      ],
      [
        "快速生活中的慢思考",
        "Kuàisù shēnghuó zhōng de màn sīkǎo",
        "မြန်ဆန်တဲ့ဘဝထဲက ဖြည်းဖြည်းစဉ်းစားခြင်း",
        "daily-life",
      ],
      [
        "人工智能与未来工作",
        "Réngōng zhìnéng yǔ wèilái gōngzuò",
        "AI နဲ့ အနာဂတ်အလုပ်အကိုင်",
        "school",
      ],
      [
        "人与自然的关系",
        "Rén yǔ zìrán de guānxì",
        "လူသားနဲ့သဘာဝဆက်ဆံရေး",
        "travel",
      ],
      [
        "社交媒体改变了什么",
        "Shèjiāo méitǐ gǎibiàn le shénme",
        "Social media က ဘာတွေပြောင်းလဲစေသလဲ",
        "friends",
      ],
      [
        "竞争与合作",
        "Jìngzhēng yǔ hézuò",
        "ယှဉ်ပြိုင်မှုနဲ့ ပူးပေါင်းမှု",
        "daily-life",
      ],
      [
        "独立思考的重要性",
        "Dúlì sīkǎo de zhòngyàoxìng",
        "ကိုယ်တိုင်စဉ်းစားနိုင်မှုရဲ့ အရေးပါမှု",
        "school",
      ],
      [
        "城市化带来的改变",
        "Chéngshìhuà dàilái de gǎibiàn",
        "မြို့ပြဖြစ်ထွန်းမှုက ယူလာတဲ့ပြောင်းလဲမှု",
        "travel",
      ],
      [
        "消费与真正的需要",
        "Xiāofèi yǔ zhēnzhèng de xūyào",
        "သုံးစွဲမှုနဲ့ တကယ့်လိုအပ်ချက်",
        "shopping",
      ],
      [
        "成功背后的代价",
        "Chénggōng bèihòu de dàijià",
        "အောင်မြင်မှုနောက်က ပေးဆပ်ရမှု",
        "daily-life",
      ],
      [
        "面对不确定的未来",
        "Miànduì bù quèdìng de wèilái",
        "မသေချာတဲ့အနာဂတ်ကို ရင်ဆိုင်ခြင်း",
        "daily-life",
      ],
      [
        "文化差异带来的理解",
        "Wénhuà chāyì dàilái de lǐjiě",
        "ယဉ်ကျေးမှုကွာခြားမှုကပေးတဲ့နားလည်မှု",
        "travel",
      ],
      [
        "现代人的孤独",
        "Xiàndài rén de gūdú",
        "ခေတ်သစ်လူသားရဲ့ အထီးကျန်မှု",
        "friends",
      ],
      [
        "知识与经验哪个更重要",
        "Zhīshi yǔ jīngyàn nǎge gèng zhòngyào",
        "ဗဟုသုတနဲ့ အတွေ့အကြုံ ဘယ်ဟာပိုအရေးကြီးလဲ",
        "school",
      ],
      [
        "变化中的职业世界",
        "Biànhuà zhōng de zhíyè shìjiè",
        "ပြောင်းလဲနေတဲ့ အလုပ်အကိုင်ကမ္ဘာ",
        "daily-life",
      ],
      [
        "我们为什么需要阅读",
        "Wǒmen wèishénme xūyào yuèdú",
        "ဘာကြောင့် စာဖတ်ဖို့လိုအပ်သလဲ",
        "school",
      ],
      [
        "如何定义更好的生活",
        "Rúhé dìngyì gèng hǎo de shēnghuó",
        "ပိုကောင်းတဲ့ဘဝကို ဘယ်လိုသတ်မှတ်မလဲ",
        "daily-life",
      ],
    ];

  return base.map(
    (
      row,
      index,
    ) => ({
      ...toTopic(
        row,
      ),

      title:
        level === 7
          ? String(
              row[0],
            )
          : level === 8
            ? `${String(
                row[0],
              )}：新的思考`
            : `${String(
                row[0],
              )}：更深层的问题`,

      pinyinTitle:
        String(
          row[1],
        ),

      myanmarTitle:
        level === 7
          ? String(
              row[2],
            )
          : level === 8
            ? `${String(
                row[2],
              )} — အမြင်အသစ်`
            : `${String(
                row[2],
              )} — ပိုနက်ရှိုင်းတဲ့အမြင်`,
    }),
  );
}

function getDifficulty(
  level: number,
): Difficulty {
  if (
    level <= 3
  ) {
    return "easy";
  }

  if (
    level <= 6
  ) {
    return "medium";
  }

  return "hard";
}

function getEstimatedMinutes(
  level: number,
) {
  if (level <= 3) {
    return 4;
  }

  if (level <= 5) {
    return 5;
  }

  if (level === 6) {
    return 6;
  }

  if (level === 7) {
    return 7;
  }

  if (level === 8) {
    return 8;
  }

  return 9;
}

function buildTemplateFile(
  level: number,
  topics: Topic[],
) {
  const typeCode =
`export type HskReadingStorySource = {
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

`;

  const storyCode =
    topics
      .map(
        (
          topic,
          index,
        ) => {
          const order =
            index + 1;

          const id =
            `hsk${level}-reading-${String(
              order,
            ).padStart(
              3,
              "0",
            )}`;

          /*
           * These fields are deliberately empty.
           * We do NOT create fake production content.
           */

          return `  {
    id: ${JSON.stringify(id)},
    level: ${level},
    order: ${order},

    title: ${JSON.stringify(topic.title)},
    pinyinTitle: ${JSON.stringify(topic.pinyinTitle)},
    myanmarTitle: ${JSON.stringify(topic.myanmarTitle)},

    category: ${JSON.stringify(topic.category)},
    difficulty: ${JSON.stringify(getDifficulty(level))},
    estimatedMinutes: ${getEstimatedMinutes(level)},

    paragraphs: [],
    pinyinParagraphs: [],
    myanmarParagraphs: [],

    keywords: [],

    audioUrl: null,
    audioText: "",
  }`;
        },
      )
      .join(
        ",\n\n",
      );

  return `${typeCode}export const HSK${level}_READING_STORIES:
  HskReadingStorySource[] = [
${storyCode}
];

export function getHsk${level}ReadingSourceStories() {
  return [
    ...HSK${level}_READING_STORIES,
  ].sort(
    (a, b) =>
      a.order - b.order,
  );
}
`;
}

/*
 * -------------------------------------------------------
 * MAIN
 * -------------------------------------------------------
 */

function main() {
  fs.mkdirSync(
    SOURCE_DIR,
    {
      recursive: true,
    },
  );

  for (
    let level = 3;
    level <= 9;
    level += 1
  ) {
    const topics =
      TOPICS[level];

    if (
      !topics ||
      topics.length !== 20
    ) {
      throw new Error(
        `HSK ${level} must have exactly 20 topics.`,
      );
    }

    const outputPath =
      path.join(
        SOURCE_DIR,
        `hsk${level}.ts`,
      );

    /*
     * Safety:
     * don't overwrite files that already contain real story content.
     */

    const current =
      fs.existsSync(
        outputPath,
      )
        ? fs.readFileSync(
            outputPath,
            "utf8",
          )
        : "";

    const hasRealContent =
      current.includes(
        "paragraphs: [",
      ) &&
      !current.includes(
        "paragraphs: [],",
      );

    if (
      hasRealContent
    ) {
      console.log(
        `Skipped HSK ${level}: file appears to contain real content.`,
      );

      continue;
    }

    fs.writeFileSync(
      outputPath,
      buildTemplateFile(
        level,
        topics,
      ),
      "utf8",
    );

    console.log(
      `HSK ${level}: 20 story slots created.`,
    );
  }

  console.log(
    "HSK 3-9 content scaffold complete.",
  );
}

main();