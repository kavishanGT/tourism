import Link from "next/link";
import { Clock, MapPin, DollarSign } from "lucide-react";
import type { Attraction } from "@/types/attraction";
import { PriceTag } from "@/components/common/price-tag";
import { routes } from "@/lib/constants/routes";

const gradients = [
  "from-cyan-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-teal-400 to-emerald-600",
  "from-orange-400 to-amber-600",
  "from-indigo-400 to-blue-600",
];

function getGradient(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = slug.charCodeAt(i) + ((h << 5) - h);
  return gradients[Math.abs(h) % gradients.length];
}

interface AttractionCardProps {
  attraction: Attraction;
}

export function AttractionCard({ attraction: a }: AttractionCardProps) {
  const gradient = getGradient(a.slug);

  return (
    <Link
      href={routes.attraction(a.slug)}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Gradient header */}
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}>
        <span className="text-7xl font-black text-white/15 select-none">{a.name.charAt(0)}</span>
        {a.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-white">
            ⭐ Featured
          </span>
        )}
        {a.priceFrom != null && (
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 backdrop-blur px-3 py-1.5 shadow">
            <PriceTag amount={a.priceFrom} currency={a.currency ?? "USD"} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {a.destinationName && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={11} />
            <span>{a.destinationName}</span>
          </div>
        )}
        <h3 className="font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
          {a.name}
        </h3>
        {a.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2">{a.shortDescription}</p>
        )}
        <div className="flex items-center gap-3 pt-1">
          {a.durationMinutes && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {a.durationMinutes < 60
                ? `${a.durationMinutes}m`
                : `${Math.floor(a.durationMinutes / 60)}h ${a.durationMinutes % 60 ? (a.durationMinutes % 60) + "m" : ""}`}
            </span>
          )}
          {a.priceFrom == null && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <DollarSign size={12} />
              Free entry
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
