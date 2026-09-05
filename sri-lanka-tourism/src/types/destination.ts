export interface LocationResponse {
  latitude: number;
  longitude: number;
}

export interface RegionSummary {
  id: string;
  name: string;
  slug: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  /** Nested location object from backend */
  location?: LocationResponse;
  /** Flat fields (used in some DTOs) */
  latitude?: number;
  longitude?: number;
  region: RegionSummary | null;
  featured: boolean;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
}

/** Helper — resolves latitude regardless of response shape */
export function getLatitude(d: Destination): number {
  return d.location?.latitude ?? d.latitude ?? 0;
}

export function getLongitude(d: Destination): number {
  return d.location?.longitude ?? d.longitude ?? 0;
}
