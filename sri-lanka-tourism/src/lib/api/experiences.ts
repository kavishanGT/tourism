import { apiClient } from "./client";
import type { ApiResponse, ApiMeta } from "@/types/api";
import type { Experience } from "@/types/tourism";

export interface ExperienceListParams {
  page?: number;
  size?: number;
  search?: string;
  destination?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ExperienceListResponse {
  data: Experience[];
  meta: ApiMeta;
}

export async function getExperiences(
  params?: ExperienceListParams
): Promise<ExperienceListResponse> {
  const response = await apiClient.get<ApiResponse<Experience[]>>("/experiences", { params });
  return { data: response.data.data, meta: response.data.meta! };
}

export async function getExperience(slug: string): Promise<Experience> {
  const response = await apiClient.get<ApiResponse<Experience>>(`/experiences/${slug}`);
  return response.data.data;
}
