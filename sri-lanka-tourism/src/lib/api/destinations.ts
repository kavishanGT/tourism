import { apiClient } from "./client";
import type { ApiResponse, ApiMeta } from "@/types/api";
import type { Destination } from "@/types/destination";

export interface DestinationListParams {
  page?: number;
  size?: number;
  search?: string;
  region?: string;
  featured?: boolean;
  sort?: string;
}

export interface DestinationListResponse {
  data: Destination[];
  meta: ApiMeta;
}

export async function getDestinations(
  params?: DestinationListParams
): Promise<DestinationListResponse> {
  const response = await apiClient.get<ApiResponse<Destination[]>>(
    "/destinations",
    { params }
  );
  return {
    data: response.data.data,
    meta: response.data.meta!,
  };
}

export async function getDestination(slug: string): Promise<Destination> {
  const response = await apiClient.get<ApiResponse<Destination>>(
    `/destinations/${slug}`
  );
  return response.data.data;
}
