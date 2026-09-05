"use client";

import { Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

const userLocationIcon = L.divIcon({
  className: "custom-user-location-marker",
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <!-- Outer pulsating ring -->
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.4);
        animation: pulse 2s infinite ease-in-out;
      "></div>
      <!-- Center blue solid dot -->
      <div style="
        position: absolute;
        top: 4px;
        left: 4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #2563eb;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.6); opacity: 0.2; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface UserLocationMarkerProps {
  location: [number, number];
  accuracy?: number | null;
  isTracking?: boolean;
}

export function UserLocationMarker({ location, accuracy, isTracking }: UserLocationMarkerProps) {
  return (
    <>
      {/* Accuracy radius circle overlay */}
      {accuracy && accuracy > 0 && (
        <Circle
          center={location}
          radius={accuracy}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.15,
            weight: 1,
            dashArray: "4, 4",
          }}
        />
      )}

      {/* User Location Marker */}
      <Marker position={location} icon={userLocationIcon}>
        <Popup className="custom-leaflet-popup">
          <div className="p-1 font-sans">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <h4 className="font-bold text-sm text-gray-900">Your Location</h4>
            </div>
            <p className="text-xs text-gray-500">
              {isTracking ? "Live tracking active 🛰️" : "GPS Location retrieved"}
            </p>
            {accuracy && (
              <p className="text-[11px] text-gray-400 mt-1">
                Accuracy: ±{Math.round(accuracy)}m
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}
