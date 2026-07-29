import ChatWindow from "@/components/ai/ChatWindow";

export default function AiSpeakingPage() {
  return (
    <main className="anna-ai-page min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6">
      <div
        className="anna-orb anna-orb-one"
        aria-hidden="true"
      />
      <div
        className="anna-orb anna-orb-two"
        aria-hidden="true"
      />
      <div
        className="anna-orb anna-orb-three"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <ChatWindow />
      </div>
    </main>
  );
}