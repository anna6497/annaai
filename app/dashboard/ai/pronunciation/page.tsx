import PronunciationPractice from "@/components/speaking-practice/PronunciationPractice";
import { getSpeakingPracticeSentences } from "@/lib/speaking-practice/loader";

type PronunciationPracticePageProps = {
  searchParams: Promise<{
    q?: string | string[];
    lesson?: string | string[];
    category?: string | string[];
    review?: string | string[];
  }>;
};

export const metadata = {
  title: "Pronunciation Practice | Anna AI",
  description:
    "Listen, repeat, and check your Chinese pronunciation.",
};

function getSingleParameter(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function parseInitialLesson(
  value: string
): number | "all" {
  if (!value) {
    return "all";
  }

  const lesson = Number(value);

  if (
    !Number.isInteger(lesson) ||
    lesson < 1
  ) {
    return "all";
  }

  return lesson;
}

function parseReviewSentenceIds(
  value: string
): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 20);
}

export default async function PronunciationPracticePage({
  searchParams,
}: PronunciationPracticePageProps) {
  const params = await searchParams;

  const initialSearchQuery =
    getSingleParameter(params.q);

  const initialCategory =
    getSingleParameter(
      params.category
    ) || "all";

  const initialLesson =
    parseInitialLesson(
      getSingleParameter(
        params.lesson
      )
    );

  const initialReviewSentenceIds =
    parseReviewSentenceIds(
      getSingleParameter(
        params.review
      )
    );

  const sentences =
    getSpeakingPracticeSentences(1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-950 px-4 py-10 sm:px-6 lg:px-8">
      <PronunciationPractice
        sentences={sentences}
        initialSearchQuery={
          initialSearchQuery
        }
        initialLesson={initialLesson}
        initialCategory={
          initialCategory
        }
        initialReviewSentenceIds={
          initialReviewSentenceIds
        }
      />
    </main>
  );
}