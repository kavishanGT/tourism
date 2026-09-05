"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useDestinations } from "@/features/destinations/hooks/use-destinations";
import { DestinationGrid } from "@/features/destinations/components/destination-grid";
import { DestinationFilters } from "@/features/destinations/components/destination-filters";
import { Pagination } from "@/components/common/pagination";

export function DestinationsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const page = Number(params.get("page") ?? 0);
  const search = params.get("search") ?? undefined;
  const region = params.get("region") ?? undefined;
  const featured = params.get("featured") === "true" ? true : undefined;
  const sort = params.get("sort") ?? "name,asc";
  const [sortField, sortDir] = sort.split(",");

  const { data, isLoading, isError } = useDestinations({
    page,
    size: 12,
    search,
    region,
    featured,
    sort: `${sortField},${sortDir ?? "asc"}`,
  });

  const handlePageChange = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/destinations?${next.toString()}`);
  };

  return (
    <div className="space-y-6">
      <DestinationFilters />

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load destinations. Make sure the API server is running.
        </div>
      )}

      {data && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {data.meta.totalElements} destination{data.meta.totalElements !== 1 ? "s" : ""} found
          </span>
        </div>
      )}

      <DestinationGrid
        destinations={data?.data ?? []}
        isLoading={isLoading}
        isEmpty={!isLoading && data?.data.length === 0}
      />

      {data && data.meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.meta.totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}
    </div>
  );
}
