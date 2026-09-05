import { apiClient } from "./client";
import type { ApiResponse, ApiMeta } from "@/types/api";
import type { Attraction } from "@/types/attraction";

export interface AttractionListParams {
  page?: number;
  size?: number;
  search?: string;
  destination?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface AttractionListResponse {
  data: Attraction[];
  meta: ApiMeta;
}

export async function getAttractions(
  params?: AttractionListParams
): Promise<AttractionListResponse> {
  const response = await apiClient.get<ApiResponse<Attraction[]>>(
    "/attractions",
    { params }
  );
  return {
    data: response.data.data,
    meta: response.data.meta!,
  };
}

export async function getAttraction(slug: string): Promise<Attraction> {
  const response = await apiClient.get<ApiResponse<Attraction>>(
    `/attractions/${slug}`
  );
  return response.data.data;
}

export async function getNearbyAttractions(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}): Promise<Attraction[]> {
  const response = await apiClient.get<ApiResponse<Attraction[]>>(
    "/attractions/nearby",
    { params }
  );
  return response.data.data;
}
