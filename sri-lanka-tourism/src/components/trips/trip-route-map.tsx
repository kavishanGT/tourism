"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { DestinationMeta } from "@/lib/constants/destination-registry";
import { fetchRoute, RouteData } from "@/lib/services/routing";
import { MapPin, Navigation, Clock, Compass, ExternalLink, Loader2 } from "lucide-react";

interface TripRouteMapProps {
  destinations: DestinationMeta[];
  tripTitle: string;
}

// Custom numbered Leaflet pin for route stops
function createNumberedIcon(num: number, isFirst: boolean, isLast: boolean) {
  const bg = isFirst
    ? "#059669" // Emerald for origin
    : isLast
    ? "#dc2626" // Red for destination
    : "#2563eb"; // Blue for intermediate stops

  return L.divIcon({
    className: "custom-route-numbered-marker",
    html: `
      <div style="
        background: ${bg};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2.5px solid #ffffff;
        cursor: pointer;
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          line-height: 1;
        ">${num}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Auto-adjust map zoom and bounds to fit all destinations
function RouteBoundsFitter({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 10, { animate: true });
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true,
        });
      }
    }
  }, [map, points]);
  return null;
}

export default function TripRouteMap({ destinations, tripTitle }: TripRouteMapProps) {
  const [routeSegments, setRouteSegments] = useState<[number, number][][]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDurationMins, setTotalDurationMins] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(true);

  const waypoints = destinations.map((d) => d.coordinates);

  useEffect(() => {
    let isCancelled = false;

    async function computeFullRoute() {
      if (waypoints.length < 2) {
        setRouteSegments([]);
        setTotalDistance(0);
        setTotalDurationMins(0);
        setIsLoadingRoute(false);
        return;
      }

      setIsLoadingRoute(true);
      const segments: [number, number][][] = [];
      let cumulativeDist = 0;
      let cumulativeMins = 0;

      for (let i = 0; i < waypoints.length - 1; i++) {
        const origin = waypoints[i];
        const dest = waypoints[i + 1];

        try {
          const route = await fetchRoute(origin, dest, "driving");
          segments.push(route.coordinates);
          cumulativeDist += route.distanceKm;
          cumulativeMins += route.durationMins;
        } catch (err) {
          // Fallback straight line if OSRM service is unreachable
          segments.push([origin, dest]);
          // Approximate straight-line distance
          const [lat1, lon1] = origin;
          const [lat2, lon2] = dest;
          const d = Math.round(
            Math.hypot((lat2 - lat1) * 111, (lon2 - lon1) * 111 * Math.cos((lat1 * Math.PI) / 180))
          );
          cumulativeDist += d;
          cumulativeMins += Math.round((d / 45) * 60); // approx 45 km/h average
        }
      }

      if (!isCancelled) {
        setRouteSegments(segments);
        setTotalDistance(Math.round(cumulativeDist));
        setTotalDurationMins(cumulativeMins);
        setIsLoadingRoute(false);
      }
    }

    computeFullRoute();

    return () => {
      isCancelled = true;
    };
  }, [destinations]);

  // Center of Sri Lanka fallback
  const initialCenter: [number, number] =
    waypoints.length > 0 ? waypoints[0] : [7.8731, 80.7718];

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} mins`;
    return `${h} hr${h > 1 ? "s" : ""} ${m > 0 ? `${m} min` : ""}`;
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Route Header / Stats Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Navigation className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Route Itinerary
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {tripTitle}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                {destinations.length} Stops
              </span>
            </div>
          </div>
        </div>

        {/* Route metrics badge */}
        <div className="flex items-center gap-4 text-xs">
          {isLoadingRoute ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
              <span>Calculating road path...</span>
            </div>
          ) : totalDistance > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-200 border border-slate-700/60">
                <Compass className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{totalDistance} km</span>
                <span className="text-[10px] text-slate-400">total</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-200 border border-slate-700/60">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-white">~{formatHoursMins(totalDurationMins)}</span>
                <span className="text-[10px] text-slate-400">drive time</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[400px] w-full">
        <MapContainer
          center={initialCenter}
          zoom={8}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <RouteBoundsFitter points={waypoints} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline Route Casing and Inner Path */}
          {routeSegments.map((segment, idx) => (
            <div key={idx}>
              {/* Dark casing */}
              <Polyline
                positions={segment}
                pathOptions={{
                  color: "#0f172a",
                  weight: 8,
                  opacity: 0.65,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Vibrant route line */}
              <Polyline
                positions={segment}
                pathOptions={{
                  color: "#10b981",
                  weight: 4,
                  opacity: 0.95,
                  dashArray: idx % 2 === 1 ? "4, 6" : undefined,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </div>
          ))}

          {/* Numbered Waypoint Markers */}
          {destinations.map((dest, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === destinations.length - 1;
            const icon = createNumberedIcon(idx + 1, isFirst, isLast);

            return (
              <Marker key={dest.slug + idx} position={dest.coordinates} icon={icon}>
                <Popup className="custom-leaflet-popup" minWidth={240} maxWidth={280}>
                  <div className="overflow-hidden rounded-xl bg-slate-900 text-white shadow-xl">
                    {/* Destination photo */}
                    <div className="relative h-28 w-full overflow-hidden bg-slate-800">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        Stop #{idx + 1}
                      </span>
                    </div>

                    {/* Destination details */}
                    <div className="p-3">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <MapPin className="h-3 w-3" />
                        <span>{dest.region}</span>
                      </div>
                      <h4 className="mt-0.5 text-base font-bold text-white">{dest.name}</h4>
                      <p className="mt-1 text-xs text-slate-300 leading-snug line-clamp-2">
                        {dest.tagline}
                      </p>

                      {/* Highlights */}
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {dest.highlights.slice(0, 2).map((h) => (
                            <span
                              key={h}
                              className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Google Maps link */}
                      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${dest.coordinates[0]},${dest.coordinates[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          Open in Maps <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Route Stops Bottom Pill Bar */}
      <div className="border-t border-slate-800 bg-slate-900/95 p-3 px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Route Stops:
          </span>
          {destinations.map((dest, idx) => (
            <div
              key={dest.slug + idx}
              className="flex items-center gap-1.5 shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-200"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                {idx + 1}
              </span>
              <span className="font-medium text-white">{dest.name}</span>
              {idx < destinations.length - 1 && (
                <span className="text-slate-500 ml-1">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
