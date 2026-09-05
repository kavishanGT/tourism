import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Destination } from "@/types/destination";
import { routes } from "@/lib/constants/routes";

interface DestinationCardProps {
  destination: Destination;
}

// Placeholder gradient images when no real image is available
const placeholderGradients = [
  "from-emerald-400 to-teal-600",
  "from-blue-400 to-indigo-600",
  "from-orange-400 to-rose-600",
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-600",
  "from-amber-400 to-orange-600",
];

function getGradient(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  return placeholderGradients[Math.abs(hash) % placeholderGradients.length];
}

export function DestinationCard({ destination: d }: DestinationCardProps) {
  const gradient = getGradient(d.slug);

  return (
    <Link
      href={routes.destination(d.slug)}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image / Gradient placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        {/* Destination initial overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white/20 select-none">
            {d.name.charAt(0)}
          </span>
        </div>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Featured badge */}
        {d.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {d.region && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
            <MapPin size={11} />
            <span>{d.region.name}</span>
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
          {d.name}
        </h3>
        {d.shortDescription && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {d.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Explore destination
          <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
