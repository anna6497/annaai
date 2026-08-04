import PronunciationPractice from "@/components/speaking-practice/PronunciationPractice";
import { getSpeakingPracticeSentences } from "@/lib/speaking-practice/loader";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    level?: string | string[];
    lesson?: string | string[];
    category?: string | string[];
    review?: string | string[];
  }>;
};

export const metadata = {
  title: "Pronunciation Practice | Anna AI",
  description: "Listen, repeat, and check your Chinese pronunciation.",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0]?.trim() ?? "" : value?.trim() ?? "";
}

function parseLevel(value: string): number {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;
}

function parseLesson(value: string): number | "all" {
  if (!value) return "all";
  const lesson = Number(value);
  return Number.isInteger(lesson) && lesson >= 1 ? lesson : "all";
}

function parseReview(value: string): string[] {
  if (!value) return [];
  return Array.from(
    new Set(value.split(",").map((item) => item.trim()).filter(Boolean))
  ).slice(0, 20);
}

export default async function PronunciationPracticePage({ searchParams }: Props) {
  const params = await searchParams;
  const level = parseLevel(single(params.level));
  const sentences = getSpeakingPracticeSentences(level);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-950 px-4 py-10 sm:px-6 lg:px-8">
      <PronunciationPractice
        sentences={sentences}
        initialSearchQuery={single(params.q)}
        initialLesson={parseLesson(single(params.lesson))}
        initialCategory={single(params.category) || "all"}
        initialReviewSentenceIds={parseReview(single(params.review))}
      />
    </main>
  );
}
