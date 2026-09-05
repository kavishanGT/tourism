"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 mb-4">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-gray-500">We couldn&apos;t load this page. Please try again.</p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-2 text-sm text-red-500 font-mono">{error.message}</p>
      )}
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-white font-medium hover:bg-emerald-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
