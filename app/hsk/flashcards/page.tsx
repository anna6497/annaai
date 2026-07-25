import Link from "next/link";

export default function FlashcardsPage() {
  return (
    <main className="min-h-screen bg-[#090014] text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        HSK Flashcards
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Link
            key={i}
            href={`/hsk/flashcards/${i + 1}`}
            className="rounded-xl bg-blue-600 p-6 text-center hover:bg-blue-500"
          >
            HSK {i + 1}
          </Link>
        ))}
      </div>
    </main>
  );
}