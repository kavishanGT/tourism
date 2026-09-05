"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/features/search/components/search-input";
import { SearchResults, type Tab } from "@/features/search/components/search-results";
import { useSearch } from "@/features/search/hooks/use-search";
import { SkeletonGrid } from "@/components/common/skeleton-card";

const POPULAR = ["Sigiriya", "Ella", "Galle Fort", "Yala", "Arugam Bay", "Kandy", "Mirissa", "Nuwara Eliya"];

export function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const { data, isLoading, isError } = useSearch(q);

  return (
    <div className="space-y-6">
      <SearchInput autoFocus />

      {/* Prompt state */}
      {!q && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((tag) => (
              <a
                key={tag}
                href={`/search?q=${encodeURIComponent(tag.toLowerCase())}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                {tag}
              </a>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🏛️", label: "Destinations", href: "/destinations" },
              { emoji: "🎯", label: "Attractions", href: "/attractions" },
              { emoji: "🌊", label: "Experiences", href: "/experiences" },
            ].map((c) => (
              <a key={c.label} href={c.href} className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-emerald-200 transition-all group">
                <span className="text-3xl group-hover:scale-110 block transition-transform">{c.emoji}</span>
                <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-emerald-700">{c.label}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {q && isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {/* Error */}
      {q && isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Search failed. Ensure the API server is running.
        </div>
      )}

      {/* Results */}
      {q && data && (
        <SearchResults
          results={data}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}
