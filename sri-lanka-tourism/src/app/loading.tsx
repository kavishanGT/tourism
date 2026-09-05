export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-gray-200" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 w-full rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
