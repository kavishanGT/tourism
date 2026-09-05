"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useExperiences } from "@/features/experiences/hooks/use-experiences";
import { ExperienceCard } from "@/features/experiences/components/experience-card";
import { SkeletonGrid } from "@/components/common/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { Search, X } from "lucide-react";
import { useTransition } from "react";

export function ExperiencesContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = Number(params.get("page") ?? 0);
  const search = params.get("search") ?? undefined;
  const featured = params.get("featured") === "true" ? true : undefined;

  const { data, isLoading, isError } = useExperiences({ page, size: 12, search, featured });

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    startTransition(() => router.push(`/experiences?${next.toString()}`));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search experiences…"
            defaultValue={search}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            onChange={(e) => {
              const v = e.target.value;
              clearTimeout((window as Window & { _exp?: ReturnType<typeof setTimeout> })._exp);
              (window as Window & { _exp?: ReturnType<typeof setTimeout> })._exp = setTimeout(() => update("search", v || null), 400);
            }}
          />
        </div>
        <button
          onClick={() => update("featured", (params.get("featured") === "true") ? null : "true")}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${params.get("featured") === "true" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 bg-white text-gray-600"}`}
        >
          ⭐ Featured only
        </button>
        {(search || featured) && (
          <button onClick={() => startTransition(() => router.push("/experiences"))} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700">
            <X size={14} /> Clear
          </button>
        )}
        {isPending && <span className="text-xs text-rose-600 animate-pulse self-center">Updating…</span>}
      </div>

      {data && (
        <p className="text-sm text-gray-500">
          {data.meta.totalElements} experience{data.meta.totalElements !== 1 ? "s" : ""} found
        </p>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load experiences.
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid count={12} />
      ) : data?.data.length === 0 ? (
        <EmptyState title="No experiences found" message="Try adjusting your search." actionLabel="Clear filters" actionHref="/experiences" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data.map((e) => <ExperienceCard key={e.id} experience={e} />)}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.meta.totalPages}
          onPageChange={(p) => {
            const next = new URLSearchParams(params.toString());
            next.set("page", String(p));
            router.push(`/experiences?${next.toString()}`);
          }}
          className="mt-8"
        />
      )}
    </div>
  );
}
