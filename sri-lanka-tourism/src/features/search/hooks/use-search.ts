"use client";

import { useQuery } from "@tanstack/react-query";
import { globalSearch } from "@/lib/api/search";

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => globalSearch(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}
