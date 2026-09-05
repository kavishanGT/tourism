import { Suspense } from "react";
import type { Metadata } from "next";
import { ExperiencesContent } from "./experiences-content";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Book unique Sri Lanka experiences — safaris, cooking classes, surf lessons, tea tours and more.",
};

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-rose-900 to-orange-800 px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-300">Unforgettable moments</p>
        <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">Experiences</h1>
        <p className="mt-3 text-lg text-white/70 max-w-xl mx-auto">
          Surf the Indian Ocean, spot leopards in Yala, or sip Ceylon tea with a local guide.
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-gray-200" />}>
          <ExperiencesContent />
        </Suspense>
      </div>
    </div>
  );
}
