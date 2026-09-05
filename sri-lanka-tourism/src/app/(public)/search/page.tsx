import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchContent } from "./search-content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all Sri Lanka destinations, attractions, experiences, and more.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Discover</p>
        <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">Search Sri Lanka</h1>
        <p className="mt-3 text-gray-400 max-w-sm mx-auto">
          Find destinations, attractions, and experiences across the island.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-gray-200" />}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
