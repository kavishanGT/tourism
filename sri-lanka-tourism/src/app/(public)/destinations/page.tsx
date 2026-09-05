import { Suspense } from "react";
import type { Metadata } from "next";
import { DestinationsContent } from "./destinations-content";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore all destinations across Sri Lanka — from misty mountains to golden beaches.",
};

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page hero */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-800 px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Explore</p>
        <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">Destinations</h1>
        <p className="mt-3 text-lg text-white/70 max-w-xl mx-auto">
          From ancient rock fortresses to pristine coastal towns — discover every corner of Sri Lanka.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-gray-200" />}>
          <DestinationsContent />
        </Suspense>
      </div>
    </div>
  );
}
