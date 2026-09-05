import { apiClient } from "./client";

export interface FavoriteItem {
  id: string;
  entity_type: "DESTINATION" | "ATTRACTION" | "EXPERIENCE" | "RESTAURANT" | "ACCOMMODATION";
  entity_id: string;
  title: string;
  slug?: string;
  region?: string;
  category?: string;
  created_at?: string;
}

export interface AddFavoritePayload {
  entity_type: string;
  entity_id?: string;
  entity_slug?: string;
}

export async function fetchUserFavorites(): Promise<FavoriteItem[]> {
  if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
    return [];
  }
  try {
    const res = await apiClient.get<{ success: boolean; data: FavoriteItem[] }>("/favorites");
    return res.data?.data || [];
  } catch (err: any) {
    if (err?.response?.status !== 401 && err?.response?.status !== 403) {
      console.warn("Failed to fetch favorites:", err?.message);
    }
    return [];
  }
}

export async function addFavorite(payload: AddFavoritePayload): Promise<FavoriteItem> {
  const res = await apiClient.post<{ success: boolean; data: FavoriteItem }>("/favorites", payload);
  return res.data.data;
}

export async function removeFavorite(entityType: string, entityId: string): Promise<void> {
  await apiClient.delete(`/favorites/${entityType}/${entityId}`);
}
