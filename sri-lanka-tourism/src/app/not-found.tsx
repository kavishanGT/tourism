import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
        404 error
      </p>
      <h1 className="mt-3 text-5xl font-bold text-gray-900">
        Lost in paradise?
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        We couldn&apos;t find the destination you&apos;re looking for.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/destinations"
          className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Explore destinations
        </Link>
      </div>
    </div>
  );
}
