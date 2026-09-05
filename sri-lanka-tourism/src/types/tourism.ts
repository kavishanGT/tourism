export interface Experience {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  durationMinutes?: number;
  minGuests: number;
  maxGuests?: number;
  priceFrom?: number | null;
  currency?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  featured: boolean;
  destinationId?: string;
  destinationName?: string;
  providerId?: string;
  providerName?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceLevel?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  destinationId?: string;
  destinationName?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  slug: string;
  description?: string;
  accommodationType?: string;
  priceFrom?: number | null;
  currency?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  destinationId?: string;
  destinationName?: string;
}

export interface TourismEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDatetime: string;
  endDatetime?: string;
  latitude?: number;
  longitude?: number;
  organizer?: string;
  ticketRequired: boolean;
  ticketUrl?: string;
  status: string;
  destinationId?: string;
  destinationName?: string;
}
