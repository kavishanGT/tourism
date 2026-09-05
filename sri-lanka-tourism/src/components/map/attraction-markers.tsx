"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapItem, MapPopup } from "./map-popup";

// Create custom Leaflet divIcon for Attraction (Blue pin)
const attractionIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="
      background-color: #2563eb;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
      border: 2px solid #ffffff;
      cursor: pointer;
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
  popupAnchor: [0, -32],
});

interface AttractionMarkersProps {
  items: MapItem[];
  onGetDirections?: (item: MapItem) => void;
}

export function AttractionMarkers({ items, onGetDirections }: AttractionMarkersProps) {
  return (
    <>
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={attractionIcon}
        >
          <Popup className="custom-leaflet-popup">
            <MapPopup item={item} onGetDirections={onGetDirections} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}
