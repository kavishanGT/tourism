export type RouteProfile = "driving" | "cycling" | "foot";

export interface RouteStep {
  instruction: string;
  distanceKm: number;
  durationMins: number;
  name: string;
}

export interface RouteData {
  coordinates: [number, number][];
  distanceKm: number;
  durationMins: number;
  steps: RouteStep[];
  profile: RouteProfile;
  origin: [number, number];
  destination: [number, number];
}

const OSRM_PROFILES: Record<RouteProfile, string> = {
  driving: "driving",
  cycling: "bike",
  foot: "foot",
};

/**
 * Formats maneuver turn details into friendly human-readable navigation steps
 */
function formatStepInstruction(maneuver: any, streetName: string): string {
  const type = maneuver.type || "";
  const modifier = maneuver.modifier || "";
  const name = streetName ? ` onto ${streetName}` : "";

  if (type === "depart") return `Head ${modifier || "out"}${name}`;
  if (type === "arrive") return `Arrive at destination`;
  if (type === "turn") {
    if (modifier === "left" || modifier === "sharp left" || modifier === "slight left") {
      return `Turn ${modifier}${name}`;
    }
    if (modifier === "right" || modifier === "sharp right" || modifier === "slight right") {
      return `Turn ${modifier}${name}`;
    }
    return `Turn ${modifier || ""}${name}`;
  }
  if (type === "roundabout" || type === "rotary") {
    return `Take roundabout exit ${maneuver.exit || ""}${name}`;
  }
  if (type === "fork") return `Keep ${modifier || "left"}${name}`;
  if (type === "end of road") return `Turn ${modifier || "left"} at end of road${name}`;
  if (type === "continue" || type === "new name") return `Continue straight${name}`;

  return `Proceed${name}`;
}

export async function fetchRoute(
  origin: [number, number],
  destination: [number, number],
  profile: RouteProfile = "driving"
): Promise<RouteData> {
  const osrmProfile = OSRM_PROFILES[profile];
  // OSRM expects coordinates as: longitude,latitude
  const originStr = `${origin[1]},${origin[0]}`;
  const destStr = `${destination[1]},${destination[0]}`;

  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${originStr};${destStr}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Routing request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("No route found between selected points.");
  }

  const route = data.routes[0];

  // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]]
  );

  const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // in km with 1 decimal
  const durationMins = Math.round(route.duration / 60); // in minutes

  // Parse turn-by-turn steps
  const steps: RouteStep[] = [];
  if (route.legs && route.legs.length > 0) {
    for (const leg of route.legs) {
      if (leg.steps) {
        for (const step of leg.steps) {
          steps.push({
            instruction: formatStepInstruction(step.maneuver, step.name),
            distanceKm: Math.round((step.distance / 1000) * 10) / 10,
            durationMins: Math.round(step.duration / 60),
            name: step.name || "Unnamed Road",
          });
        }
      }
    }
  }

  return {
    coordinates,
    distanceKm,
    durationMins,
    steps,
    profile,
    origin,
    destination,
  };
}
