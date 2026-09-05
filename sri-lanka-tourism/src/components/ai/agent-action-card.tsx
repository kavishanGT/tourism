"use client";

import { useState } from "react";
import { Compass, CheckCircle2, Loader2, Calendar, Clock, MapPin, ArrowRight, Sparkles, Navigation } from "lucide-react";
import Link from "next/link";
import { AgentActionPlan, executeAgentAction } from "@/lib/api/ai";
import { TripDetailModal } from "@/components/trips/trip-detail-modal";
import { Trip } from "@/lib/api/trips";

interface AgentActionCardProps {
  actionPlan: AgentActionPlan;
}

export function AgentActionCard({ actionPlan }: AgentActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"overview" | "map">("overview");

  if (!actionPlan || !actionPlan.has_action) return null;

  const { action_type, trip_proposal, favorite_proposal } = actionPlan;

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      setError(null);

      await executeAgentAction({
        action_type,
        trip_proposal,
        favorite_proposal,
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Failed to execute agent action:", err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "You must be logged in to save trips to your account.";
      setError(msg);
    } finally {
      setIsExecuting(false);
    }
  };

  // Convert trip_proposal to a displayable Trip model for the preview modal
  const previewTrip: Trip | null = trip_proposal
    ? {
        id: "preview-trip",
        title: trip_proposal.title,
        description: trip_proposal.description,
        destination: trip_proposal.destination,
        start_date: trip_proposal.start_date,
        end_date: trip_proposal.end_date,
        status: "PROPOSED PLAN",
        source: "AI_AGENT",
        days: trip_proposal.days.map((d) => ({
          day_number: d.day_number,
          title: d.title,
          items: d.items.map((itm) => ({
            title: itm.title,
            start_time: itm.start_time,
            end_time: itm.end_time,
            notes: itm.notes,
            estimated_cost: itm.estimated_cost,
          })),
        })),
      }
    : null;

  if (action_type === "CREATE_TRIP" && trip_proposal) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 shadow-lg backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <span className="inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Action Proposal
              </span>
              <h4 className="text-sm font-semibold text-white">
                {trip_proposal.title}
              </h4>
            </div>
          </div>
          {trip_proposal.destination && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{trip_proposal.destination}</span>
            </div>
          )}
        </div>

        {/* Description if present */}
        {trip_proposal.description && (
          <p className="mt-2 text-xs text-slate-300 line-clamp-2">
            {trip_proposal.description}
          </p>
        )}

        {/* Days & Itinerary Items Preview */}
        {trip_proposal.days && trip_proposal.days.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <span>{trip_proposal.days.length}-Day Plan Breakdown:</span>
              <button
                type="button"
                onClick={() => {
                  setPreviewTab("map");
                  setIsPreviewOpen(true);
                }}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold"
              >
                <Navigation size={12} />
                Preview on Map
              </button>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {trip_proposal.days.map((day) => (
                <div
                  key={day.day_number}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2.5 text-xs text-slate-200"
                >
                  <div className="flex items-center justify-between font-semibold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      Day {day.day_number}: {day.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {day.items?.length || 0} activities
                    </span>
                  </div>
                  {day.items && day.items.length > 0 && (
                    <ul className="mt-1.5 space-y-1 pl-1 text-[11px] text-slate-300">
                      {day.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                          <div>
                            <span className="font-medium text-slate-200">{item.title}</span>
                            {item.start_time && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                                <Clock className="h-2.5 w-2.5" />
                                {item.start_time}{item.end_time ? ` - ${item.end_time}` : ""}
                              </span>
                            )}
                            {item.notes && (
                              <p className="text-[10px] text-slate-400 italic">{item.notes}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button & Confirmation */}
        <div className="mt-3.5 pt-2">
          {isSuccess ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 border border-emerald-500/40">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Trip saved to your account!
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewTab("map");
                    setIsPreviewOpen(true);
                  }}
                  className="text-xs font-semibold text-emerald-300 hover:text-white underline flex items-center gap-1"
                >
                  <Navigation className="h-3 w-3" /> View Map
                </button>
                <Link
                  href="/trips"
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-200 underline hover:text-white"
                >
                  My Trips <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewTab("overview");
                    setIsPreviewOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  <Navigation size={12} className="text-emerald-400" />
                  View Route & Sights
                </button>

                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="flex-[1.5] flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Save to My Trips
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-center text-xs text-rose-300">
                  <p>{error}</p>
                  {(error.toLowerCase().includes("logged in") || error.toLowerCase().includes("log in") || error.toLowerCase().includes("unauthorized")) && (
                    <Link
                      href="/login"
                      className="mt-1.5 inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Click here to Log In <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal for Route & Destination Preview */}
        <TripDetailModal
          trip={previewTrip}
          isOpen={isPreviewOpen}
          initialTab={previewTab}
          onClose={() => setIsPreviewOpen(false)}
        />
      </div>
    );
  }

  if (action_type === "FAVORITE_ENTITY" && favorite_proposal) {
    return (
      <div className="mt-3 rounded-xl border border-rose-500/30 bg-slate-950/80 p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-300">
              Bookmark Proposal
            </span>
            <h4 className="text-xs font-semibold text-white">
              Add &quot;{favorite_proposal.title}&quot; to Favorites
            </h4>
          </div>
          {isSuccess ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Favorited!
            </span>
          ) : (
            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
