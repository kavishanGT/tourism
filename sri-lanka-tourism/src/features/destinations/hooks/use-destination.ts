"use client";

import { useQuery } from "@tanstack/react-query";
import { getDestination } from "@/lib/api/destinations";

export function useDestination(slug: string) {
  return useQuery({
    queryKey: ["destinations", slug],
    queryFn: () => getDestination(slug),
    enabled: Boolean(slug),
  });
}
