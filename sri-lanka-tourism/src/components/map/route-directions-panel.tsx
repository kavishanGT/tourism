"use client";

import { useState } from "react";
import {
  Car,
  Bike,
  Footprints,
  Navigation,
  Clock,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  Compass,
  Radio,
} from "lucide-react";
import type { RouteData, RouteProfile } from "@/lib/services/routing";
import type { MapItem } from "./map-popup";

interface RouteDirectionsPanelProps {
  route: RouteData | null;
  destination: MapItem | null;
  isLoading: boolean;
  isTracking: boolean;
  onSelectProfile: (profile: RouteProfile) => void;
  onToggleTracking: () => void;
  onClearRoute: () => void;
}

export function RouteDirectionsPanel({
  route,
  destination,
  isLoading,
  isTracking,
  onSelectProfile,
  onToggleTracking,
  onClearRoute,
}: RouteDirectionsPanelProps) {
  const [showSteps, setShowSteps] = useState(false);

  if (!route && !isLoading) return null;

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMins > 0 ? `${remainingMins} min` : ""}`;
  };

  return (
    <div className="absolute top-4 right-4 left-4 sm:left-auto sm:w-96 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-2xl transition-all duration-300">
      {/* Header Bar */}
      <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Navigation size={20} className={isLoading ? "animate-spin" : ""} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              Live Route Navigation
            </span>
            <h3 className="font-bold text-base text-gray-900 truncate">
              {destination?.name || "Selected Destination"}
            </h3>
          </div>
        </div>
        <button
          onClick={onClearRoute}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          title="Exit Route Navigation"
        >
          <X size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 text-center space-y-2">
          <div className="inline-block animate-bounce text-emerald-600">
            <Compass size={28} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Finding shortest route…</p>
          <p className="text-xs text-gray-400">Querying live OpenStreetMap routing network</p>
        </div>
      ) : route ? (
        <div className="p-4 space-y-4">
          {/* Transport Mode Switcher */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => onSelectProfile("driving")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                route.profile === "driving"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Car size={14} /> Drive
            </button>
            <button
              onClick={() => onSelectProfile("cycling")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                route.profile === "cycling"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Bike size={14} /> Cycle
            </button>
            <button
              onClick={() => onSelectProfile("foot")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                route.profile === "foot"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Footprints size={14} /> Walk
            </button>
          </div>

          {/* Distance & Time Metrics Card */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800/80 block">Est. Time</span>
                <span className="text-base font-extrabold text-emerald-950">
                  {formatTime(route.durationMins)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800/80 block">Shortest Distance</span>
                <span className="text-base font-extrabold text-emerald-950">
                  {route.distanceKm} km
                </span>
              </div>
            </div>
          </div>

          {/* Live Location Tracking Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Radio
                size={16}
                className={isTracking ? "text-blue-600 animate-pulse" : "text-gray-400"}
              />
              <span className="text-xs font-semibold text-gray-700">Live GPS Tracking</span>
            </div>
            <button
              onClick={onToggleTracking}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                isTracking
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isTracking ? "Active 🛰️" : "Enable Tracking"}
            </button>
          </div>

          {/* Turn-by-Turn Steps Accordion */}
          {route.steps && route.steps.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-emerald-700 transition-colors py-1"
              >
                <span>Turn-by-turn Directions ({route.steps.length} steps)</span>
                {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showSteps && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs divide-y divide-gray-100">
                  {route.steps.map((step, idx) => (
                    <div key={idx} className="pt-2 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 w-4 h-4 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-800 font-medium">{step.instruction}</span>
                      </div>
                      {step.distanceKm > 0 && (
                        <span className="text-gray-400 shrink-0 text-[11px] font-mono">
                          {step.distanceKm} km
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
