"use client";

import { useQuery } from "@tanstack/react-query";
import { getAttractions, type AttractionListParams } from "@/lib/api/attractions";

export function useAttractions(params?: AttractionListParams) {
  return useQuery({
    queryKey: ["attractions", params],
    queryFn: () => getAttractions(params),
  });
}
