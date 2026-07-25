export interface HskLevel {
  level: number;
  title: string;
  description: string;
  color: string;
  vocabularyCount: string;
}

export const hskLevels: HskLevel[] = [
  {
    level: 1,
    title: "Beginner",
    description:
      "အခြေခံစကားလုံးနှင့် နေ့စဉ်သုံးဝါကျများ",
    color: "from-emerald-600 to-teal-600",
    vocabularyCount: "500 words",
  },
  {
    level: 2,
    title: "Elementary",
    description:
      "အခြေခံ conversation နှင့် အသုံးအနှုန်းများ",
    color: "from-green-600 to-emerald-600",
    vocabularyCount: "772 words",
  },
  {
    level: 3,
    title: "Intermediate",
    description:
      "နေ့စဉ်ဘဝနှင့် အလုပ်ခွင်ဆိုင်ရာ စကားလုံးများ",
    color: "from-cyan-600 to-blue-600",
    vocabularyCount: "973 words",
  },
  {
    level: 4,
    title: "Upper Intermediate",
    description:
      "ပိုမိုရှုပ်ထွေးသော စာကြောင်းနှင့် အကြောင်းအရာများ",
    color: "from-blue-600 to-indigo-600",
    vocabularyCount: "1,000 words",
  },
  {
    level: 5,
    title: "Advanced",
    description:
      "စာပေ၊ သတင်းနှင့် နက်ရှိုင်းသော conversation",
    color: "from-indigo-600 to-violet-600",
    vocabularyCount: "1,071 words",
  },
  {
    level: 6,
    title: "Advanced Plus",
    description:
      "အဆင့်မြင့် reading နှင့် formal language",
    color: "from-violet-600 to-purple-600",
    vocabularyCount: "1,140 words",
  },
  {
    level: 7,
    title: "High Advanced",
    description:
      "Academic နှင့် professional Chinese",
    color: "from-purple-600 to-fuchsia-600",
    vocabularyCount: "Advanced vocabulary",
  },
  {
    level: 8,
    title: "Proficient",
    description:
      "အဆင့်မြင့်စာပေနှင့် သဘောတရားများ",
    color: "from-fuchsia-600 to-pink-600",
    vocabularyCount: "Advanced vocabulary",
  },
  {
    level: 9,
    title: "Mastery",
    description:
      "Native-level academic Chinese skills",
    color: "from-pink-600 to-rose-600",
    vocabularyCount: "Mastery vocabulary",
  },
];

export function getHskLevel(level: number) {
  return hskLevels.find(
    (item) => item.level === level
  );
}