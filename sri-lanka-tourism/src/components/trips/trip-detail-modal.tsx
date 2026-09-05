"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Trip } from "@/lib/api/trips";
import { fetchLiveWeather, LiveWeatherReport } from "@/lib/api/weather";
import { exportTripToIcs } from "@/lib/utils/calendar-export";
import { printTripVoucher } from "@/lib/utils/trip-voucher-printer";
import {
  resolveTripDestinations,
  resolveDayDestination,
  getTransitInfo,
  resolveTripClimate,
  calculateTripBudget,
  DestinationMeta,
} from "@/lib/constants/destination-registry";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Compass,
  Navigation,
  ListOrdered,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Loader2,
  Car,
  Tag,
  Sun,
  Wallet,
  Luggage,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  Printer,
} from "lucide-react";

// Format 24h string (e.g. "09:00:00") into clean AM/PM format
function formatTime(timeStr?: string | null): string | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

// Formats start and end times into clean range and duration (e.g. "9:00 AM – 12:00 PM • 3 hrs")
function formatTimeSpan(
  startTime?: string | null,
  endTime?: string | null
): { text: string; duration?: string } | null {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  if (!start && !end) return null;
  if (start && !end) return { text: start };
  if (!start && end) return { text: `Until ${end}` };

  let durationStr: string | undefined;
  try {
    const [sH, sM] = (startTime || "").split(":").map(Number);
    const [eH, eM] = (endTime || "").split(":").map(Number);
    if (!isNaN(sH) && !isNaN(eH)) {
      const diffMins = eH * 60 + (eM || 0) - (sH * 60 + (sM || 0));
      if (diffMins > 0) {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        durationStr = h > 0 ? `${h} hr${h > 1 ? "s" : ""}${m > 0 ? ` ${m} min` : ""}` : `${m} mins`;
      }
    }
  } catch {}

  return {
    text: `${start} – ${end}`,
    duration: durationStr,
  };
}

// Categorizes activities with visual theme, emoji, and color
interface CategoryBadge {
  label: string;
  emoji: string;
  className: string;
  dotColor: string;
}

function detectActivityCategory(
  title: string,
  notes?: string,
  entityType?: string
): CategoryBadge {
  const text = `${title} ${notes || ""} ${entityType || ""}`.toLowerCase();

  if (
    text.includes("fort") ||
    text.includes("museum") ||
    text.includes("temple") ||
    text.includes("heritage") ||
    text.includes("relic") ||
    text.includes("history") ||
    text.includes("culture") ||
    text.includes("ancient")
  ) {
    return {
      label: "Heritage",
      emoji: "🏛️",
      className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      dotColor: "bg-amber-400",
    };
  }

  if (
    text.includes("beach") ||
    text.includes("coast") ||
    text.includes("unawatuna") ||
    text.includes("mirissa beach") ||
    text.includes("ocean") ||
    text.includes("sunset") ||
    text.includes("bay")
  ) {
    return {
      label: "Beach & Coast",
      emoji: "🏖️",
      className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      dotColor: "bg-cyan-400",
    };
  }

  if (
    text.includes("whale") ||
    text.includes("dolphin") ||
    text.includes("safari") ||
    text.includes("wildlife") ||
    text.includes("leopard") ||
    text.includes("elephant") ||
    text.includes("turtle")
  ) {
    return {
      label: "Marine & Wildlife",
      emoji: "🐋",
      className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      dotColor: "bg-blue-400",
    };
  }

  if (
    text.includes("dinner") ||
    text.includes("lunch") ||
    text.includes("restaurant") ||
    text.includes("cafe") ||
    text.includes("food") ||
    text.includes("seafood") ||
    text.includes("curry") ||
    text.includes("tea")
  ) {
    return {
      label: "Dining",
      emoji: "🍽️",
      className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      dotColor: "bg-emerald-400",
    };
  }

  if (
    text.includes("drive") ||
    text.includes("travel") ||
    text.includes("train") ||
    text.includes("transfer") ||
    text.includes("check-in") ||
    text.includes("arrival") ||
    text.includes("departure")
  ) {
    return {
      label: "Scenic Transit",
      emoji: "🚗",
      className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      dotColor: "bg-indigo-400",
    };
  }

  if (
    text.includes("hike") ||
    text.includes("rock") ||
    text.includes("trek") ||
    text.includes("waterfall") ||
    text.includes("surf") ||
    text.includes("diving") ||
    text.includes("snorkeling") ||
    text.includes("adventure")
  ) {
    return {
      label: "Adventure",
      emoji: "🧗",
      className: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      dotColor: "bg-teal-400",
    };
  }

  return {
    label: "Sightseeing",
    emoji: "📍",
    className: "bg-slate-800 text-slate-300 border-slate-700/60",
    dotColor: "bg-emerald-400",
  };
}

// Dynamically import map with SSR disabled to prevent Leaflet window errors
const TripRouteMap = dynamic(() => import("./trip-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
      <span className="text-sm">Loading interactive route map...</span>
    </div>
  ),
});

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "overview" | "map";
}

export function TripDetailModal({
  trip,
  isOpen,
  onClose,
  initialTab = "overview",
}: TripDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "map">(initialTab);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [selectedDestIndex, setSelectedDestIndex] = useState(0);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const destinations = trip ? resolveTripDestinations(trip) : [];
  const activeDest = destinations[selectedDestIndex] || destinations[0];
  const climate = resolveTripClimate(destinations);
  const budget = trip ? calculateTripBudget(trip) : null;

  useEffect(() => {
    if (!isOpen || !activeDest) return;

    let cancelled = false;
    setIsLoadingWeather(true);
    fetchLiveWeather(activeDest.coordinates[0], activeDest.coordinates[1])
      .then((data) => {
        if (!cancelled) setLiveWeather(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingWeather(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeDest]);

  if (!isOpen || !trip || !budget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                  {trip.status || "PLANNED TRIP"}
                </span>
                {trip.source === "AI_AGENT" && (
                  <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="h-2.5 w-2.5" /> AI Generated
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{trip.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher tabs in header */}
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "overview"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Destinations & Schedule
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "map"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Route in Map
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === "overview" ? (
            <>
              {/* Trip Overview Pill Info */}
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs text-slate-300">
                {(trip.start_date || trip.end_date) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">
                      {trip.start_date || "Flexible"}{" "}
                      {trip.end_date ? `→ ${trip.end_date}` : ""}
                    </span>
                  </div>
                )}
                {trip.days && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">
                      {trip.days.length} Days Itinerary
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium text-white">
                    {destinations.length} Key Destination{destinations.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Action Buttons Group */}
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => exportTripToIcs(trip)}
                    title="Download .ics file for Apple Calendar, Google Calendar & Outlook"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
                  >
                    <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sync Calendar (.ics)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => printTripVoucher(trip, destinations, climate, budget)}
                    title="Open printable voucher for A4 print or Save as PDF"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5 text-sky-400" />
                    <span>Print / PDF Voucher</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("map")}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>View Route on Map</span>
                  </button>
                </div>
              </div>

              {trip.description && (
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                  {trip.description}
                </p>
              )}

              {/* ── SEASONAL WEATHER & BUDGET ROW ────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Real-Time Live Weather Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-slate-900/80 to-slate-950 p-4 shadow-md space-y-3">
                  {/* Top live indicator & destination selector */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Live Real-Time Weather
                      </span>
                    </div>

                    {/* Destination switcher if multiple */}
                    {destinations.length > 1 && (
                      <div className="flex items-center rounded-lg bg-slate-950/80 p-0.5 border border-slate-800 text-[10px]">
                        {destinations.map((d, i) => (
                          <button
                            key={d.slug}
                            type="button"
                            onClick={() => setSelectedDestIndex(i)}
                            className={`px-2 py-0.5 rounded-md font-semibold transition ${
                              selectedDestIndex === i
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {d.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Main Live Weather Metrics */}
                  {isLoadingWeather ? (
                    <div className="flex items-center gap-3 py-2 text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      <span>Fetching live station data for {activeDest?.name}...</span>
                    </div>
                  ) : liveWeather ? (
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl filter drop-shadow">{liveWeather.icon}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                            {liveWeather.temperature}°C
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {liveWeather.condition}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Feels {liveWeather.feelsLike}°C)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>💧 Humidity: <strong className="text-slate-200">{liveWeather.humidity}%</strong></span>
                          <span>💨 Wind: <strong className="text-slate-200">{liveWeather.windSpeed} km/h</strong></span>
                          <span className="text-sky-300 font-medium">📍 {activeDest?.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sun className="h-6 w-6 text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-white">{activeDest?.climate.condition}</span>
                        <p className="text-[10px] text-slate-400">{activeDest?.climate.temperature}</p>
                      </div>
                    </div>
                  )}

                  {/* Seasonal advice note */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-950/70 px-3 py-2 text-[11px] text-slate-300 border border-slate-800">
                    <Luggage className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span className="line-clamp-1">
                      <strong className="text-slate-200">Season Tip:</strong> {activeDest?.climate.bestSeason} • {activeDest?.climate.tip}
                    </span>
                  </div>
                </div>

                {/* Estimated Budget Pill Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-950 p-4 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30">
                        <Wallet className="h-4 w-4" />
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">Estimated Trip Budget</span>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 font-mono">
                            ${budget.totalMinUsd} – ${budget.totalMaxUsd} USD
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          ~{(budget.totalMinUsd * 305).toLocaleString()} –{" "}
                          {(budget.totalMaxUsd * 305).toLocaleString()} LKR / traveler
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 shrink-0"
                    >
                      <span>Breakdown</span>
                      {showBudgetBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {/* Expandable Breakdown Details */}
                  {showBudgetBreakdown ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] animate-in fade-in">
                      {budget.breakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2 border border-slate-800/90"
                        >
                          <span className="flex items-center gap-1.5 text-slate-400 truncate">
                            <span>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </span>
                          <span className="font-bold text-slate-200">~${item.amountUsd}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 rounded-xl bg-slate-950/70 px-3 py-2 border border-slate-800">
                      <span>Includes stays, activities, dining & local transit</span>
                      <span className="text-emerald-400 font-medium">All-Inclusive Est.</span>
                    </div>
                  )}
                </div>
              </div>


              {/* ── PLANNED DESTINATIONS GALLERY ────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      Planned Destinations
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Explore the sights, regions, and landscapes included on this itinerary.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("map")}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Trace Route on Map <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinations.map((dest, idx) => (
                    <div
                      key={dest.slug + idx}
                      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md transition-all hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10"
                    >
                      {/* Destination photo */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                        <Image
                          src={dest.image}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                        {/* Stop number badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-sm shadow">
                          <span>Stop #{idx + 1}</span>
                        </div>

                        {/* Region badge */}
                        <span className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/60 backdrop-blur-sm">
                          {dest.region}
                        </span>

                        <div className="absolute bottom-2.5 left-3 right-3">
                          <h4 className="text-lg font-bold text-white drop-shadow">
                            {dest.name}
                          </h4>
                          <p className="text-xs text-slate-300 line-clamp-1">
                            {dest.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Card details */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>

                        {/* Highlights pills */}
                        {dest.highlights && (
                          <div className="flex flex-wrap gap-1.5">
                            {dest.highlights.slice(0, 3).map((h) => (
                              <span
                                key={h}
                                className="rounded-lg bg-slate-800/80 border border-slate-700/50 px-2 py-0.5 text-[10px] text-slate-300"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                          <button
                            onClick={() => setActiveTab("map")}
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                          >
                            <Navigation className="h-3 w-3" /> View Stop on Map
                          </button>
                          <a
                            href={`/destinations/${dest.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-400 hover:text-white"
                          >
                            Guide <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── DAY BY DAY SCHEDULE ─────────────────────────────────── */}
              {trip.days && trip.days.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-emerald-400" />
                    Day-by-Day Itinerary Schedule
                  </h3>

                  <div className="space-y-3">
                    {trip.days.map((day, dayIdx) => {
                      const prevDay = dayIdx > 0 ? trip.days![dayIdx - 1] : null;
                      const prevDest = prevDay ? resolveDayDestination(prevDay) : null;
                      const currentDest = resolveDayDestination(day);
                      const transit =
                        prevDest && currentDest && prevDest.slug !== currentDest.slug
                          ? getTransitInfo(prevDest.slug, currentDest.slug)
                          : null;

                      return (
                        <div key={day.id || day.day_number || dayIdx} className="space-y-3">
                          {/* ── Inter-City Transit Connector ─────────────────── */}
                          {transit && (
                            <div className="relative my-4 flex items-center justify-center">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-dashed border-slate-700/80" />
                              </div>
                              <div className="relative flex flex-wrap items-center justify-center gap-2 rounded-full border border-indigo-500/30 bg-slate-900/95 px-4 py-1.5 text-xs text-indigo-200 shadow-lg backdrop-blur-md">
                                <Car className="h-3.5 w-3.5 text-indigo-400" />
                                <span className="font-semibold text-white">Scenic Road Transit:</span>
                                <span className="text-slate-300">
                                  {transit.from} → {transit.to}
                                </span>
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                                  {transit.label}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* ── Day Card ─────────────────────────────────────── */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 shadow-md">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400">
                                  {day.day_number}
                                </span>
                                <h4 className="font-semibold text-white text-sm">
                                  {day.title || `Day ${day.day_number}`}
                                </h4>
                                {currentDest && (
                                  <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                                    <MapPin size={10} className="text-emerald-400" />
                                    {currentDest.name}
                                  </span>
                                )}
                              </div>
                              {day.date && (
                                <span className="text-xs text-slate-400 font-medium">
                                  📅 {day.date}
                                </span>
                              )}
                            </div>

                            {day.items && day.items.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {day.items.map((item, idx) => {
                                  const timeInfo = formatTimeSpan(item.start_time, item.end_time);
                                  const category = detectActivityCategory(
                                    item.title,
                                    item.notes,
                                    item.entity_type
                                  );

                                  return (
                                    <div
                                      key={idx}
                                      className="flex flex-col justify-between rounded-xl bg-slate-950/70 p-3.5 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
                                    >
                                      <div>
                                        {/* Top category & time row */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${category.className}`}
                                          >
                                            <span>{category.emoji}</span>
                                            <span>{category.label}</span>
                                          </span>

                                          {timeInfo && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded-md">
                                              <Clock size={11} className="text-emerald-400" />
                                              <span>{timeInfo.text}</span>
                                              {timeInfo.duration && (
                                                <span className="text-emerald-400 font-medium">
                                                  ({timeInfo.duration})
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* Title */}
                                        <h5 className="text-xs font-bold text-slate-100 leading-snug">
                                          {item.title}
                                        </h5>

                                        {/* Notes */}
                                        {item.notes && (
                                          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                            {item.notes}
                                          </p>
                                        )}
                                      </div>

                                      {/* Bottom Cost & Entity */}
                                      {item.estimated_cost && (
                                        <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                                          <span className="text-slate-500">Estimated Cost:</span>
                                          <span className="font-semibold text-emerald-400">
                                            {item.currency || "USD"} {item.estimated_cost}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">
                                No specific itemized activities added for this day yet.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </>
          ) : (
            /* ── MAP ROUTE VIEW ───────────────────────────────────────── */
            <div className="h-[560px] w-full">
              <TripRouteMap destinations={destinations} tripTitle={trip.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
