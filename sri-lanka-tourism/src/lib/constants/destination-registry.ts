export interface ClimateInfo {
  temperature: string;
  condition: string;
  bestSeason: string;
  tip: string;
}

export interface DestinationMeta {
  name: string;
  slug: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  coordinates: [number, number]; // [lat, lng]
  badge?: string;
  badgeColor?: string;
  highlights: string[];
  climate: ClimateInfo;
}

export const SRI_LANKA_DESTINATIONS: Record<string, DestinationMeta> = {
  ella: {
    name: "Ella",
    slug: "ella",
    region: "Uva Province",
    tagline: "Misty mountains, waterfalls & tea trails",
    description:
      "A serene hill-country village nestled in emerald tea estates, iconic for the Nine Arch Bridge and Little Adam's Peak.",
    image: "/card-ella.png",
    coordinates: [6.8667, 81.0466],
    badge: "Trending",
    badgeColor: "bg-amber-500",
    highlights: ["Nine Arch Bridge", "Little Adam's Peak", "Ravana Falls", "Ella Rock"],
    climate: {
      temperature: "17°C – 25°C",
      condition: "Cool Mountain Breeze",
      bestSeason: "Jan – Apr & Jul – Sep (Crisp mountain trails)",
      tip: "Bring light fleece/sweater for cool evenings & sturdy hiking shoes",
    },
  },
  galle: {
    name: "Galle",
    slug: "galle",
    region: "Southern Province",
    tagline: "Dutch colonial charm by the ocean",
    description:
      "A UNESCO World Heritage coastal fortress city packed with cobblestone lanes, boutiques, ramparts, and maritime history.",
    image: "/card-galle.png",
    coordinates: [6.0535, 80.217],
    badge: "Heritage",
    badgeColor: "bg-blue-500",
    highlights: ["Galle Dutch Fort", "Lighthouse", "Maritime Museum", "Rampart Sunset Walk"],
    climate: {
      temperature: "28°C – 31°C",
      condition: "Tropical Coastal Sun",
      bestSeason: "Nov – Apr (Dry, calm blue seas & clear sunsets)",
      tip: "Light breathable linen, sun protection & comfortable walking shoes",
    },
  },
  kandy: {
    name: "Kandy",
    slug: "kandy",
    region: "Central Province",
    tagline: "Sacred city of the Golden Tooth Relic",
    description:
      "Surrounded by rainforest mountain ranges and tea hills, home to the Temple of the Sacred Tooth and Kandy Lake.",
    image: "/card-kandy.png",
    coordinates: [7.2906, 80.6337],
    badge: "Cultural",
    badgeColor: "bg-purple-500",
    highlights: ["Temple of the Tooth", "Royal Botanical Gardens", "Kandy Lake", "Bahirawakanda"],
    climate: {
      temperature: "20°C – 28°C",
      condition: "Misty Rainforest Hills",
      bestSeason: "Dec – Apr (Mild weather for temples & gardens)",
      tip: "Modest attire covering shoulders and knees required for temple visits",
    },
  },
  sigiriya: {
    name: "Sigiriya",
    slug: "sigiriya",
    region: "Central / Cultural Triangle",
    tagline: "Ancient fortress in the sky",
    description:
      "An awe-inspiring 5th-century palace citadel carved into a sheer 200m rock plateau with ancient frescoes and water gardens.",
    image: "/hero-sigiriya.png",
    coordinates: [7.957, 80.7603],
    badge: "UNESCO Wonder",
    badgeColor: "bg-emerald-600",
    highlights: ["Sigiriya Lion Rock", "Pidurangala Rock", "Water Gardens", "Mirror Wall"],
    climate: {
      temperature: "27°C – 33°C",
      condition: "Warm Tropical Sun",
      bestSeason: "Jan – Sep (Clear skies for rock fortress climb)",
      tip: "Start climb by 7:00 AM to avoid heat; bring hydration & sun hat",
    },
  },
  mirissa: {
    name: "Mirissa",
    slug: "mirissa",
    region: "Southern Province",
    tagline: "Golden beaches, coconut hills & blue whales",
    description:
      "Famous for whale watching tours, sweeping crescent bays, vibrant beachside seafood dining, and Coconut Tree Hill.",
    image: "/card-mirissa.jpg",
    coordinates: [5.9483, 80.4589],
    badge: "Coastal Paradise",
    badgeColor: "bg-cyan-500",
    highlights: ["Coconut Tree Hill", "Mirissa Beach", "Whale Watching Safari", "Secret Beach"],
    climate: {
      temperature: "28°C – 31°C",
      condition: "Tropical Ocean Breeze",
      bestSeason: "Nov – Apr (Peak calm seas for whale watching)",
      tip: "Reef-safe sunscreen, swimwear, sunglasses & motion sickness pills",
    },
  },
  yala: {
    name: "Yala",
    slug: "yala",
    region: "Southern & Uva Provinces",
    tagline: "Kingdom of wild leopards & elephants",
    description:
      "Sri Lanka's premier wildlife sanctuary boasting the highest density of leopards in the world alongside wild elephants and sloth bears.",
    image: "/card-yala.jpg",
    coordinates: [6.37, 81.52],
    badge: "Wild Safari",
    badgeColor: "bg-orange-600",
    highlights: ["Block 1 Leopard Safari", "Elephant Corridors", "Kumbukkan Oya", "Magul Maha Viharaya"],
    climate: {
      temperature: "29°C – 34°C",
      condition: "Dry Zone Safari Sun",
      bestSeason: "Feb – Jul (Waterholes concentrate wildlife sightings)",
      tip: "Neutral-toned cotton clothing, dust scarf, telephoto camera & binoculars",
    },
  },
  colombo: {
    name: "Colombo",
    slug: "colombo",
    region: "Western Province",
    tagline: "Vibrant coastal commercial capital",
    description:
      "A dynamic mix of colonial architecture, seaside promenades, the towering Lotus Tower, and modern Sri Lankan gastronomy.",
    image: "/hero-sigiriya.png",
    coordinates: [6.9271, 79.8612],
    badge: "Urban Capital",
    badgeColor: "bg-slate-600",
    highlights: ["Galle Face Green", "Lotus Tower", "Gangaramaya Temple", "Pettah Market"],
    climate: {
      temperature: "28°C – 32°C",
      condition: "Tropical Urban Warmth",
      bestSeason: "Nov – Apr (Pleasant evenings on Galle Face promenade)",
      tip: "Light breathable clothing & city walking footwear",
    },
  },
  "nuwara-eliya": {
    name: "Nuwara Eliya",
    slug: "nuwara-eliya",
    region: "Central Province",
    tagline: "Little England amid misty tea gardens",
    description:
      "Cool climate resort famous for pristine Ceylon tea estates, Gregory Lake, colonial country homes, and waterfalls.",
    image: "/card-ella.png",
    coordinates: [6.9497, 80.7891],
    badge: "Highlands",
    badgeColor: "bg-teal-600",
    highlights: ["Gregory Lake", "Tea Factory Tours", "Hakgala Gardens", "Pedro Tea Estate"],
    climate: {
      temperature: "12°C – 20°C",
      condition: "Chilly Highland Mist",
      bestSeason: "Mar – May & Aug – Sep",
      tip: "Warm layers, cozy sweater, light jacket and umbrella",
    },
  },
  bentota: {
    name: "Bentota",
    slug: "bentota",
    region: "Southern Province",
    tagline: "Golden beaches & water sports hub",
    description:
      "A premier resort strip popular for jet-skiing, lagoon boat safaris, river cruises, and Geoffrey Bawa architectural gardens.",
    image: "/card-mirissa.jpg",
    coordinates: [6.4217, 79.9972],
    badge: "Water Sports",
    badgeColor: "bg-sky-500",
    highlights: ["Madu Ganga River Safari", "Bentota Beach", "Brief Garden", "Water Sports Center"],
    climate: {
      temperature: "28°C – 31°C",
      condition: "Sunny Coastal Waters",
      bestSeason: "Nov – Apr (Calm ocean & water sports conditions)",
      tip: "Rashguards, swimwear and waterproof phone pouch",
    },
  },
  trincomalee: {
    name: "Trincomalee",
    slug: "trincomalee",
    region: "Eastern Province",
    tagline: "Pristine eastern seas & sacred temples",
    description:
      "Renowned for Nilaveli beach, Pigeon Island marine national park, Swami Rock cliff, and Koneswaram Hindu Temple.",
    image: "/card-mirissa.jpg",
    coordinates: [8.5874, 81.2152],
    badge: "East Coast",
    badgeColor: "bg-blue-600",
    highlights: ["Pigeon Island Snorkeling", "Nilaveli Beach", "Koneswaram Temple", "Marble Beach"],
    climate: {
      temperature: "28°C – 33°C",
      condition: "Sunny East Coast Waters",
      bestSeason: "May – Oct (Crystal clear waters on the east coast)",
      tip: "Snorkel gear, reef shoes and sun protection",
    },
  },
};

/**
 * Normalizes an arbitrary destination query string and looks up matching DestinationMeta.
 */
export function getDestinationMeta(input?: string | null): DestinationMeta | null {
  if (!input) return null;
  const clean = input.toLowerCase().trim();

  // 1. Direct slug match
  if (SRI_LANKA_DESTINATIONS[clean]) {
    return SRI_LANKA_DESTINATIONS[clean];
  }

  // 2. Search by name or substring
  for (const [slug, dest] of Object.entries(SRI_LANKA_DESTINATIONS)) {
    if (
      clean.includes(slug) ||
      clean.includes(dest.name.toLowerCase()) ||
      dest.name.toLowerCase().includes(clean)
    ) {
      return dest;
    }
  }

  return null;
}

/**
 * Extracts a deduplicated list of DestinationMeta objects included in a trip,
 * scanning its destination, title, description, and days/items in chronological sequence.
 */
export function resolveTripDestinations(trip: {
  title?: string;
  destination?: string;
  description?: string;
  days?: Array<{
    title?: string;
    items?: Array<{
      title?: string;
      notes?: string;
      entity_title?: string;
    }>;
  }>;
}): DestinationMeta[] {
  const found = new Map<string, DestinationMeta>();

  const testText = (text?: string | null) => {
    if (!text) return;
    for (const [slug, meta] of Object.entries(SRI_LANKA_DESTINATIONS)) {
      const regex = new RegExp(`\\b${meta.name}\\b`, "i");
      if (regex.test(text) || text.toLowerCase().includes(slug)) {
        if (!found.has(meta.slug)) {
          found.set(meta.slug, meta);
        }
      }
    }
  };

  // 1. Check primary destination field
  testText(trip.destination);

  // 2. Check each day sequentially to preserve route order
  if (trip.days && trip.days.length > 0) {
    for (const day of trip.days) {
      testText(day.title);
      if (day.items) {
        for (const item of day.items) {
          testText(item.title);
          testText(item.entity_title);
          testText(item.notes);
        }
      }
    }
  }

  // 3. Check overall title and description
  testText(trip.title);
  testText(trip.description);

  // Fallback default if nothing explicit matched: default to Ella & Galle or primary
  if (found.size === 0) {
    const fallback = getDestinationMeta(trip.destination) || SRI_LANKA_DESTINATIONS["ella"];
    found.set(fallback.slug, fallback);
  }

  return Array.from(found.values());
}

/**
 * Calculates estimated road transit info between two destination names or slugs.
 */
export function getTransitInfo(
  fromNameOrSlug?: string | null,
  toNameOrSlug?: string | null
): {
  from: string;
  to: string;
  distanceKm: number;
  durationMins: number;
  label: string;
} | null {
  const fromMeta = getDestinationMeta(fromNameOrSlug);
  const toMeta = getDestinationMeta(toNameOrSlug);

  if (!fromMeta || !toMeta || fromMeta.slug === toMeta.slug) {
    return null;
  }

  const [lat1, lon1] = fromMeta.coordinates;
  const [lat2, lon2] = toMeta.coordinates;

  // Approximate road distance (haversine * 1.32 road curvature factor)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = 6371 * c;
  const roadKm = Math.round(straightKm * 1.32);

  // Average Sri Lanka scenic highway speed ~ 45 km/h
  const durationMins = Math.round((roadKm / 45) * 60);

  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const timeStr =
    hours > 0
      ? `${hours} hr${hours > 1 ? "s" : ""} ${mins > 0 ? `${mins} min` : ""}`.trim()
      : `${mins} mins`;

  return {
    from: fromMeta.name,
    to: toMeta.name,
    distanceKm: roadKm,
    durationMins,
    label: `~${timeStr} (${roadKm} km)`,
  };
}

/**
 * Resolves the primary destination for a single day.
 */
export function resolveDayDestination(day: {
  title?: string;
  items?: Array<{
    title?: string;
    notes?: string;
    entity_title?: string;
  }>;
}): DestinationMeta | null {
  for (const [slug, meta] of Object.entries(SRI_LANKA_DESTINATIONS)) {
    const regex = new RegExp(`\\b${meta.name}\\b`, "i");
    if (regex.test(day.title || "") || (day.title || "").toLowerCase().includes(slug)) {
      return meta;
    }
  }

  if (day.items) {
    for (const itm of day.items) {
      for (const [slug, meta] of Object.entries(SRI_LANKA_DESTINATIONS)) {
        const regex = new RegExp(`\\b${meta.name}\\b`, "i");
        if (
          regex.test(itm.title || "") ||
          regex.test(itm.notes || "") ||
          regex.test(itm.entity_title || "")
        ) {
          return meta;
        }
      }
    }
  }

  return null;
}

export interface TripClimateSummary {
  temperatureRange: string;
  condition: string;
  bestSeason: string;
  packingTip: string;
}

export function resolveTripClimate(destinations: DestinationMeta[]): TripClimateSummary {
  if (!destinations || destinations.length === 0) {
    return {
      temperatureRange: "27°C – 31°C",
      condition: "Tropical Island Climate",
      bestSeason: "Nov – Apr (Peak travel season)",
      packingTip: "Lightweight breathable attire & sun protection",
    };
  }

  const primary = destinations[0];
  const conditions = Array.from(new Set(destinations.map((d) => d.climate.condition)));
  const seasons = Array.from(new Set(destinations.map((d) => d.climate.bestSeason)));

  return {
    temperatureRange: primary.climate.temperature,
    condition: conditions.slice(0, 2).join(" & "),
    bestSeason: seasons[0],
    packingTip: primary.climate.tip,
  };
}

export interface BudgetCategory {
  label: string;
  icon: string;
  amountUsd: number;
}

export interface TripBudgetSummary {
  totalMinUsd: number;
  totalMaxUsd: number;
  currency: string;
  breakdown: BudgetCategory[];
}

export function calculateTripBudget(trip: {
  days?: Array<{
    items?: Array<{
      estimated_cost?: number | string | null;
      currency?: string | null;
    }>;
  }>;
}): TripBudgetSummary {
  const numDays = Math.max(trip.days?.length || 1, 1);
  let explicitActivityCost = 0;

  if (trip.days) {
    for (const day of trip.days) {
      if (day.items) {
        for (const itm of day.items) {
          const cost = Number(itm.estimated_cost);
          if (!isNaN(cost) && cost > 0) {
            explicitActivityCost += cost;
          }
        }
      }
    }
  }

  // If explicit activities were estimated by AI, use them; otherwise use realistic standard ($15-$25/day)
  const activitiesTotal = Math.max(explicitActivityCost, numDays * 20);
  const mealsTotal = numDays * 28; // ~$28/day for authentic meals & cafes
  const transitTotal = numDays * 18; // ~$18/day local transit & tuk-tuks
  const staysTotal = Math.max(numDays - 1, 1) * 55; // ~$55/night standard comfortable hotel/villa

  const baseTotal = activitiesTotal + mealsTotal + transitTotal + staysTotal;
  const totalMinUsd = Math.round(baseTotal * 0.9);
  const totalMaxUsd = Math.round(baseTotal * 1.2);

  return {
    totalMinUsd,
    totalMaxUsd,
    currency: "USD",
    breakdown: [
      { label: "Activities & Sightseeing", icon: "🎟️", amountUsd: activitiesTotal },
      { label: "Food & Dining", icon: "🍽️", amountUsd: mealsTotal },
      { label: "Local Transport", icon: "🚗", amountUsd: transitTotal },
      { label: "Stays & Villas (est.)", icon: "🏨", amountUsd: staysTotal },
    ],
  };
}
