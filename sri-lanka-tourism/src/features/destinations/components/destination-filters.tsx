"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const SORT_OPTIONS = [
  { value: "name,asc", label: "Name A–Z" },
  { value: "name,desc", label: "Name Z–A" },
  { value: "createdAt,desc", label: "Newest first" },
  { value: "createdAt,asc", label: "Oldest first" },
];

export function DestinationFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = params.get("search") ?? "";
  const region = params.get("region") ?? "";
  const sort = params.get("sort") ?? "name,asc";
  const featured = params.get("featured") === "true";

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // reset pagination on filter change
      startTransition(() => router.push(`/destinations?${next.toString()}`));
    },
    [params, router]
  );

  const clearAll = () => {
    startTransition(() => router.push("/destinations"));
  };

  const hasFilters = search || region || featured || sort !== "name,asc";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-52">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search destinations…"
          defaultValue={search}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          onChange={(e) => {
            const v = e.target.value;
            // Debounce via timeout
            clearTimeout((window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout);
            (window as Window & { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(
              () => update("search", v || null),
              400
            );
          }}
        />
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => update("sort", e.target.value)}
        className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Featured toggle */}
      <button
        onClick={() => update("featured", featured ? null : "true")}
        className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
          featured
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        ⭐ Featured only
      </button>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}

      {isPending && (
        <span className="text-xs text-emerald-600 animate-pulse">Updating…</span>
      )}
    </div>
  );
}
