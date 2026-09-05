"use client";

import { useEffect } from "react";
import { Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { RouteData } from "@/lib/services/routing";

// Start marker icon (Green ring)
const startIcon = L.divIcon({
  className: "custom-route-start-marker",
  html: `
    <div style="
      background-color: #10b981;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.6);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// End marker icon (Red destination pin)
const endIcon = L.divIcon({
  className: "custom-route-end-marker",
  html: `
    <div style="
      background-color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
      border: 2px solid #ffffff;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface RoutePolylineProps {
  route: RouteData;
}

export function RoutePolyline({ route }: RoutePolylineProps) {
  const map = useMap();

  useEffect(() => {
    if (route.coordinates && route.coordinates.length > 0) {
      const bounds = L.latLngBounds(route.coordinates);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [map, route.coordinates]);

  if (!route.coordinates || route.coordinates.length === 0) {
    return null;
  }

  const startPoint = route.coordinates[0];
  const endPoint = route.coordinates[route.coordinates.length - 1];

  return (
    <>
      {/* Outer Casing Line */}
      <Polyline
        positions={route.coordinates}
        pathOptions={{
          color: "#1e1b4b",
          weight: 7,
          opacity: 0.7,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      {/* Inner Vibrant Path Line */}
      <Polyline
        positions={route.coordinates}
        pathOptions={{
          color: route.profile === "foot" ? "#10b981" : route.profile === "cycling" ? "#f59e0b" : "#4f46e5",
          weight: 4,
          opacity: 0.95,
          dashArray: route.profile === "foot" ? "8, 8" : undefined,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      {/* Origin Point Marker */}
      <Marker position={startPoint} icon={startIcon} />

      {/* Destination Point Marker */}
      <Marker position={endPoint} icon={endIcon} />
    </>
  );
}
