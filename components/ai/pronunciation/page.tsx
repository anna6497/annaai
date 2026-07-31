import PronunciationPractice from "@/components/speaking-practice/PronunciationPractice";
import { getSpeakingPracticeSentences } from "@/lib/speaking-practice/loader";

export const metadata = {
  title: "Pronunciation Practice | Anna AI",
  description:
    "Listen to Chinese sentences, repeat them, and check your pronunciation.",
};

export default function PronunciationPracticePage() {
  const sentences = getSpeakingPracticeSentences(1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-950 px-4 py-10 sm:px-6 lg:px-8">
      <PronunciationPractice sentences={sentences} />
    </main>
  );
}