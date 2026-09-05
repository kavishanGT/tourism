"use client";

import Link from "next/link";
import { MapPin, Clock, DollarSign } from "lucide-react";
import type { SearchResult } from "@/lib/api/search";
import { EmptyState } from "@/components/common/empty-state";
import { routes } from "@/lib/constants/routes";

interface SearchResultsProps {
  results: SearchResult;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

export type Tab = "destinations" | "attractions" | "experiences" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "destinations", label: "Destinations" },
  { key: "attractions", label: "Attractions" },
  { key: "experiences", label: "Experiences" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResultRow({ item, type }: { item: any; type: string }) {
  const href =
    type === "destinations"
      ? routes.destination(item.slug)
      : type === "attractions"
      ? routes.attraction(item.slug)
      : routes.experience(item.slug);

  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:-translate-y-px transition-all duration-200 group"
    >
      {/* Color dot */}
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-sm
        ${type === "destinations" ? "bg-emerald-500" : type === "attractions" ? "bg-blue-500" : "bg-rose-500"}`}>
        {item.name?.charAt(0) ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold uppercase tracking-wide
            ${type === "destinations" ? "text-emerald-600" : type === "attractions" ? "text-blue-600" : "text-rose-600"}`}>
            {type.slice(0, -1)}
          </span>
          {item.featured && <span className="text-xs text-amber-500">⭐</span>}
        </div>
        <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{item.name}</p>
        {item.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{item.shortDescription}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          {item.regionName && <span className="flex items-center gap-0.5"><MapPin size={10} />{item.regionName}</span>}
          {item.destinationName && <span className="flex items-center gap-0.5"><MapPin size={10} />{item.destinationName}</span>}
          {item.durationMinutes && <span className="flex items-center gap-0.5"><Clock size={10} />{Math.round(item.durationMinutes / 60)}h</span>}
          {item.priceFrom != null && <span className="flex items-center gap-0.5"><DollarSign size={10} />From {item.priceFrom}</span>}
        </div>
      </div>
      <svg className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export function SearchResults({ results, activeTab, onTabChange }: SearchResultsProps) {
  const all = [
    ...results.destinations.map((d) => ({ item: d, type: "destinations" })),
    ...results.attractions.map((a) => ({ item: a, type: "attractions" })),
    ...results.experiences.map((e) => ({ item: e, type: "experiences" })),
  ];

  const totalCount = all.length;

  const tabCounts = {
    all: totalCount,
    destinations: results.destinations.length,
    attractions: results.attractions.length,
    experiences: results.experiences.length,
  };

  const filtered = activeTab === "all"
    ? all
    : all.filter((r) => r.type === activeTab);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              activeTab === t.key
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              activeTab === t.key ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tabCounts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No results found"
          message={`Nothing matched "${results.query}". Try a different search.`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(({ item, type }, i) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ResultRow key={(item as any).id ?? i} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
