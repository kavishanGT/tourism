import Link from "next/link";
import { MapPin, ArrowRight, Star, Navigation } from "lucide-react";
import { routes } from "@/lib/constants/routes";

export interface MapItem {
  id: string;
  name: string;
  slug: string;
  type: "DESTINATION" | "ATTRACTION";
  shortDescription?: string;
  latitude: number;
  longitude: number;
  regionName?: string;
  destinationName?: string;
  featured?: boolean;
}

interface MapPopupProps {
  item: MapItem;
  onGetDirections?: (item: MapItem) => void;
}

export function MapPopup({ item, onGetDirections }: MapPopupProps) {
  const isDestination = item.type === "DESTINATION";
  const href = isDestination ? routes.destination(item.slug) : routes.attraction(item.slug);

  return (
    <div className="w-64 font-sans text-gray-900 p-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white ${
            isDestination ? "bg-emerald-600" : "bg-blue-600"
          }`}
        >
          {isDestination ? "Destination" : "Attraction"}
        </span>
        {item.featured && (
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
            <Star size={11} className="fill-amber-400" /> Featured
          </span>
        )}
      </div>

      <h4 className="font-bold text-base text-gray-900 leading-tight mb-1">{item.name}</h4>

      {(item.regionName || item.destinationName) && (
        <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span>{item.regionName || item.destinationName}</span>
        </p>
      )}

      {item.shortDescription && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {item.shortDescription}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-2 gap-2">
        <Link
          href={href}
          className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
            isDestination ? "text-emerald-700 hover:text-emerald-800" : "text-blue-700 hover:text-blue-800"
          }`}
        >
          Details
          <ArrowRight size={12} />
        </Link>

        {onGetDirections && (
          <button
            onClick={() => onGetDirections(item)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Navigation size={12} />
            Directions
          </button>
        )}
      </div>
    </div>
  );
}

