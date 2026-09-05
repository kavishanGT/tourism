import Link from "next/link";
import { Clock, Users, MapPin } from "lucide-react";
import type { Experience } from "@/types/tourism";
import { PriceTag } from "@/components/common/price-tag";
import { routes } from "@/lib/constants/routes";

const gradients = [
  "from-rose-400 to-orange-500",
  "from-teal-400 to-cyan-600",
  "from-violet-400 to-indigo-600",
  "from-emerald-400 to-green-600",
  "from-amber-400 to-yellow-600",
  "from-pink-400 to-rose-600",
];

function getGradient(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = slug.charCodeAt(i) + ((h << 5) - h);
  return gradients[Math.abs(h) % gradients.length];
}

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience: e }: ExperienceCardProps) {
  const gradient = getGradient(e.slug);

  return (
    <Link
      href={routes.experience(e.slug)}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Gradient header */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}>
        <span className="text-7xl font-black text-white/15 select-none">{e.name.charAt(0)}</span>
        {e.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-white">⭐ Featured</span>
        )}
        {e.priceFrom != null && (
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 backdrop-blur px-3 py-1.5 shadow">
            <PriceTag amount={e.priceFrom} currency={e.currency ?? "USD"} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {e.destinationName && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={11} /><span>{e.destinationName}</span>
          </div>
        )}
        <h3 className="font-bold text-gray-900 leading-snug group-hover:text-rose-600 transition-colors">{e.name}</h3>
        {e.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2">{e.shortDescription}</p>
        )}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {e.durationMinutes && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {e.durationMinutes < 60 ? `${e.durationMinutes}m` : `${Math.floor(e.durationMinutes / 60)}h`}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            {e.minGuests}{e.maxGuests ? `–${e.maxGuests}` : "+"} guests
          </span>
          {e.providerName && (
            <span className="text-xs text-gray-400 truncate">{e.providerName}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
