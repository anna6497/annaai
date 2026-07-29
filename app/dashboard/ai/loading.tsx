export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

        <p className="mt-4 text-sm text-gray-600">
          Loading Anna AI...
        </p>
      </div>
    </main>
  );
}