"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Compass,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Navigation,
  Eye,
  ArrowRight,
  CalendarCheck,
  Printer,
} from "lucide-react";
import { fetchUserTrips, createTrip, deleteTrip, Trip } from "@/lib/api/trips";
import { resolveTripDestinations } from "@/lib/constants/destination-registry";
import { exportTripToIcs } from "@/lib/utils/calendar-export";
import { printTripVoucher } from "@/lib/utils/trip-voucher-printer";
import { TripDetailModal } from "@/components/trips/trip-detail-modal";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected trip for modal
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalTab, setModalTab] = useState<"overview" | "map">("overview");

  // Form state
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      setIsUnauthenticated(false);
      const serverTrips = await fetchUserTrips();
      setTrips(serverTrips);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        setIsUnauthenticated(true);
      }
      console.warn("Could not load trips (user may not be logged in):", err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination) return;

    try {
      setIsSubmitting(true);
      const created = await createTrip({
        title,
        description: notes,
        destination,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        days: [
          {
            day_number: 1,
            title: `Arrival & Explore ${destination}`,
            items: notes
              ? [
                  {
                    title: `Day 1 Activities in ${destination}`,
                    notes: notes,
                  },
                ]
              : [],
          },
        ],
      });

      setTrips([created, ...trips]);
      setIsCreating(false);
      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setNotes("");
    } catch (err) {
      console.error("Failed to create trip:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete trip:", err);
      // Fallback local remove
      setTrips(trips.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Compass className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-white">
              My Trip Planner
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Organize multi-day itineraries and AI-generated travel plans across Sri Lanka.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus size={16} />
          {isCreating ? "Cancel" : "Create New Trip"}
        </button>
      </div>

      {/* New Trip Form */}
      {isCreating && (
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Plan a New Trip
          </h2>
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3-Day Southern Coast & Safari"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Primary Destination *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Galle & Mirissa"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Trip Notes & Activities
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What activities, attractions or tours do you want to include?"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Trip"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trips List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
          <p className="text-sm">Loading your trips and itineraries...</p>
        </div>
      ) : isUnauthenticated ? (
        <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-slate-900/60 p-10 text-center">
          <Compass className="mx-auto h-12 w-12 text-emerald-400/80 mb-3" />
          <h3 className="text-lg font-bold text-white">Log In to View Your Saved Trips</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto mb-4">
            Sign in to your account to view, edit, and sync your AI-planned itineraries across your devices.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
          >
            Log In to Account
          </a>
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <Compass className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No Trips Saved Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Ask our AI Travel Agent to generate a custom itinerary or click &quot;Create New Trip&quot; above to start planning!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const destinations = resolveTripDestinations(trip);

            return (
              <div
                key={trip.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <div>
                  {/* Top Bar: Status & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        {trip.status || "PLANNED"}
                      </span>
                      {trip.source === "AI_AGENT" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                          <Sparkles size={10} /> AI Plan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTripToIcs(trip);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
                        title="Sync to Calendar (.ics)"
                      >
                        <CalendarCheck size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dests = resolveTripDestinations(trip);
                          printTripVoucher(trip, dests);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition"
                        title="Print / Save PDF Voucher"
                      >
                        <Printer size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition"
                        title="Delete Trip"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description - Clickable to open modal */}
                  <div
                    onClick={() => {
                      setSelectedTrip(trip);
                      setModalTab("overview");
                    }}
                    className="cursor-pointer"
                  >
                    <h3 className="mt-3 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                      <span>{trip.title}</span>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                    </h3>

                    {trip.description && (
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Date & Days metrics */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    {(trip.start_date || trip.end_date) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-emerald-400" />
                        <span>
                          {trip.start_date || "Flexible"}{" "}
                          {trip.end_date ? `→ ${trip.end_date}` : ""}
                        </span>
                      </div>
                    )}

                    {trip.days && trip.days.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={13} className="text-emerald-400" />
                        <span>{trip.days.length} Days Planned</span>
                      </div>
                    )}
                  </div>

                  {/* ── Destination Image Thumbnails Showcase ──────────────── */}
                  {destinations.length > 0 && (
                    <div className="mt-4 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-400" />
                          Destinations ({destinations.length}):
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {destinations.slice(0, 3).map((dest, idx) => (
                          <div
                            key={dest.slug + idx}
                            onClick={() => {
                              setSelectedTrip(trip);
                              setModalTab("overview");
                            }}
                            className="group/thumb relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 transition hover:border-emerald-500/50"
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                              <Image
                                src={dest.image}
                                alt={dest.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                sizes="(max-width: 768px) 50vw, 20vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow truncate max-w-[90%]">
                                {dest.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule Snippet */}
                  {trip.days && trip.days.length > 0 && (
                    <div className="mt-3.5 border-t border-slate-800/60 pt-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="truncate">
                          Starts with: <strong className="text-slate-200">{trip.days[0].title || `Day 1`}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setModalTab("overview");
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                  >
                    <Eye size={13} className="text-slate-400" />
                    Destinations & Plan
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setModalTab("map");
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-semibold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition shadow-emerald-500/10"
                  >
                    <Navigation size={13} />
                    Route in Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Trip Detail & Route Map Modal */}
      <TripDetailModal
        trip={selectedTrip}
        isOpen={Boolean(selectedTrip)}
        initialTab={modalTab}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}

