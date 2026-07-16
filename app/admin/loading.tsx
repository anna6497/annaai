export default function LoadingAdmin() {
  return (
    <main className="min-h-screen bg-[#090014] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-36 rounded-[2rem] bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-white/10" />
          ))}
        </div>
        <div className="mt-6 h-96 rounded-[2rem] bg-white/10" />
      </div>
    </main>
  );
}
