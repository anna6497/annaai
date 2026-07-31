import SpeakingDashboard from "@/components/speaking-practice/SpeakingDashboard";

export const metadata = {
  title: "Speaking Progress | Anna AI",
  description:
    "View your daily Chinese speaking goal, pronunciation scores, streak and difficult characters.",
};

export default function SpeakingProgressPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-950 px-4 py-10 sm:px-6 lg:px-8">
      <SpeakingDashboard />
    </main>
  );
}