export interface Attraction {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  latitude: number;
  longitude: number;
  durationMinutes?: number;
  priceFrom?: number | null;
  currency?: string;
  status: string;
  featured: boolean;
  destinationId?: string;
  destinationName?: string;
}
