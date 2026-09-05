"use client";

import { useQuery } from "@tanstack/react-query";
import { getDestinations, type DestinationListParams } from "@/lib/api/destinations";

export function useDestinations(params?: DestinationListParams) {
  return useQuery({
    queryKey: ["destinations", params],
    queryFn: () => getDestinations(params),
  });
}
