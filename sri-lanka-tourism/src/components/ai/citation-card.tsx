"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Database,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  MapPin,
  User,
  Heart,
  Compass,
} from "lucide-react";
import { Citation } from "@/lib/api/ai";

interface CitationCardProps {
  citation: Citation;
}

export function CitationCard({ citation }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isUserContext =
    citation.source_type?.startsWith("user_") ||
    citation.citation_id?.startsWith("USER_");
  const isDb =
    citation.source_type === "database" || citation.citation_id?.startsWith("DB");

  const getEntityUrl = () => {
    if (!citation.slug) return null;
    const type = citation.entity_type?.toLowerCase();
    if (type?.includes("attraction")) return `/attractions/${citation.slug}`;
    if (type?.includes("destination")) return `/destinations/${citation.slug}`;
    if (type?.includes("experience")) return `/experiences/${citation.slug}`;
    return null;
  };

  const url = getEntityUrl();

  const getBadgeStyle = () => {
    if (isUserContext) {
      if (citation.citation_id.includes("FAV")) {
        return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
      }
      if (citation.citation_id.includes("TRIP")) {
        return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      }
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    }
    if (isDb) {
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    }
    return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
  };

  const getIcon = () => {
    if (isUserContext) {
      if (citation.citation_id.includes("FAV")) return <Heart className="mr-1 h-3 w-3 text-rose-400" />;
      if (citation.citation_id.includes("TRIP")) return <Compass className="mr-1 h-3 w-3 text-amber-400" />;
      return <User className="mr-1 h-3 w-3 text-purple-400" />;
    }
    if (isDb) {
      return <Database className="mr-1 h-3 w-3" />;
    }
    return <FileText className="mr-1 h-3 w-3" />;
  };

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2 text-xs transition-all hover:border-emerald-500/40">
      <div
        className="flex cursor-pointer items-center justify-between gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${getBadgeStyle()}`}>
            {getIcon()}
            {citation.citation_id}
          </span>
          <span className="truncate font-medium text-emerald-100">
            {citation.title || citation.file_name || "Personalized Citation"}
          </span>
        </div>
        <button
          type="button"
          className="text-emerald-400 hover:text-emerald-200"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-emerald-500/10 pt-2 text-[11px] text-emerald-200/80">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-emerald-400">Type:</span>
            <span>
              {citation.entity_type ||
                (isUserContext
                  ? "User Profile / Planned Trip / Favorite Item"
                  : isDb
                  ? "Platform Database Record"
                  : "Tourism Document")}
            </span>
          </div>

          {citation.category && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-emerald-400" />
              <span>{citation.category}</span>
            </div>
          )}

          {citation.region && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-400" />
              <span>{citation.region}</span>
            </div>
          )}

          {citation.page_number && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-emerald-400">Page:</span>
              <span>{citation.page_number}</span>
            </div>
          )}

          {citation.file_name && (
            <div className="flex items-center gap-1 truncate">
              <span className="font-semibold text-emerald-400">File:</span>
              <span className="truncate">{citation.file_name}</span>
            </div>
          )}

          {url && (
            <div className="pt-1">
              <Link
                href={url}
                className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:underline"
              >
                <span>View Details</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
