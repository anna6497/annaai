import SmartReviewSession from "@/components/speaking-practice/SmartReviewSession";

export const metadata = {
  title:
    "Smart Review | Anna AI",
  description:
    "Practice Chinese sentences selected from your pronunciation mistakes.",
};

export default function SmartReviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-950 px-4 py-10 sm:px-6 lg:px-8">
      <SmartReviewSession />
    </main>
  );
}