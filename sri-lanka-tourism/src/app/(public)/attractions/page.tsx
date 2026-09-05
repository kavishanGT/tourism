import { Suspense } from "react";
import type { Metadata } from "next";
import { AttractionsContent } from "./attractions-content";

export const metadata: Metadata = {
  title: "Attractions",
  description: "Discover the best attractions across Sri Lanka — temples, wildlife, waterfalls, and more.",
};

export default function AttractionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Things to do</p>
        <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">Attractions</h1>
        <p className="mt-3 text-lg text-white/70 max-w-xl mx-auto">
          Temples, wildlife sanctuaries, waterfalls, forts — Sri Lanka&apos;s attractions are endlessly diverse.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-gray-200" />}>
          <AttractionsContent />
        </Suspense>
      </div>
    </div>
  );
}
