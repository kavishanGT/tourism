import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export interface SearchResult {
  query: string;
  destinations: unknown[];
  attractions: unknown[];
  experiences: unknown[];
  restaurants: unknown[];
  accommodations: unknown[];
  events: unknown[];
}

export async function globalSearch(q: string): Promise<SearchResult> {
  const response = await apiClient.get<ApiResponse<SearchResult>>("/search", {
    params: { q },
  });
  return response.data.data;
}
