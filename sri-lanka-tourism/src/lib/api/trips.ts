import { apiClient } from "./client";

export interface TripDayItem {
  id?: string;
  title: string;
  entity_type?: string;
  entity_title?: string;
  entity_id?: string;
  start_time?: string;
  end_time?: string;
  position?: number;
  notes?: string;
  estimated_cost?: number;
  currency?: string;
}

export interface TripDay {
  id?: string;
  day_number: number;
  date?: string;
  title?: string;
  items?: TripDayItem[];
}

export interface Trip {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  visibility?: string;
  source?: string;
  days?: TripDay[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateTripPayload {
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  days?: {
    day_number: number;
    date?: string;
    title?: string;
    items?: {
      title: string;
      entity_type?: string;
      entity_slug?: string;
      start_time?: string;
      end_time?: string;
      notes?: string;
      estimated_cost?: number;
      currency?: string;
    }[];
  }[];
}

export async function fetchUserTrips(): Promise<Trip[]> {
  if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
    return [];
  }
  try {
    const res = await apiClient.get<{ success: boolean; data: Trip[] }>("/trips");
    return res.data?.data || [];
  } catch (err: any) {
    if (err?.response?.status !== 401 && err?.response?.status !== 403) {
      console.warn("Failed to fetch trips:", err?.message);
    }
    return [];
  }
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const res = await apiClient.post<{ success: boolean; data: Trip }>("/trips", payload);
  return res.data.data;
}

export async function deleteTrip(id: string): Promise<void> {
  await apiClient.delete(`/trips/${id}`);
}
