"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapItem, MapPopup } from "./map-popup";
import { AttractionMarkers } from "./attraction-markers";
import { UserLocationMarker } from "./user-location-marker";
import { RoutePolyline } from "./route-polyline";
import type { RouteData } from "@/lib/services/routing";

// Component to dynamically update map center and zoom when props change
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Create custom Leaflet divIcon for Destination (Emerald green pin)
const destinationIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="
      background-color: #059669;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.45);
      border: 2px solid #ffffff;
      cursor: pointer;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

interface DestinationMapProps {
  destinations: MapItem[];
  attractions: MapItem[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number] | null;
  userAccuracy?: number | null;
  isTracking?: boolean;
  activeRoute?: RouteData | null;
  onGetDirections?: (item: MapItem) => void;
}

export function DestinationMap({
  destinations,
  attractions,
  center = [7.8731, 80.7718], // Sri Lanka central coordinates
  zoom = 8,
  userLocation,
  userAccuracy,
  isTracking,
  activeRoute,
  onGetDirections,
}: DestinationMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <MapViewUpdater center={center} zoom={zoom} />
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <UserLocationMarker
            location={userLocation}
            accuracy={userAccuracy}
            isTracking={isTracking}
          />
        )}

        {/* Shortest Route Polyline */}
        {activeRoute && <RoutePolyline route={activeRoute} />}

        {/* Destination Pins (Emerald) */}
        {destinations.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={destinationIcon}
          >
            <Popup className="custom-leaflet-popup">
              <MapPopup item={item} onGetDirections={onGetDirections} />
            </Popup>
          </Marker>
        ))}

        {/* Attraction Pins (Blue) */}
        <AttractionMarkers items={attractions} onGetDirections={onGetDirections} />
      </MapContainer>
    </div>
  );
}

