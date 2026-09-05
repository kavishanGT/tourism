import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExperience } from "@/lib/api/experiences";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { PriceTag } from "@/components/common/price-tag";
import { Clock, Users, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const e = await getExperience(slug);
    return {
      title: e.name,
      description: e.shortDescription ?? `Book ${e.name} in Sri Lanka`,
    };
  } catch {
    return { title: "Experience" };
  }
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;

  let experience;
  try {
    experience = await getExperience(slug);
  } catch {
    notFound();
  }

  const e = experience;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-br from-rose-900 to-orange-800 px-4 py-20 text-center overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center text-[18rem] font-black text-white/5 select-none pointer-events-none">
          {e.name.charAt(0)}
        </span>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumb items={[{ label: "Experiences", href: "/experiences" }, { label: e.name }]} />
          </div>
          <h1 className="text-5xl font-bold text-white sm:text-6xl">{e.name}</h1>
          {e.destinationName && (
            <div className="mt-3 flex justify-center items-center gap-1.5 text-rose-300">
              <MapPin size={15} /><span>{e.destinationName}</span>
            </div>
          )}
          {e.shortDescription && (
            <p className="mt-5 max-w-2xl mx-auto text-lg text-white/75">{e.shortDescription}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {e.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this experience</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{e.description}</p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            {/* Booking card */}
            <div className="rounded-2xl border-2 border-rose-100 bg-rose-50 p-5 space-y-4">
              {e.priceFrom != null ? (
                <PriceTag amount={e.priceFrom} currency={e.currency ?? "USD"} size="lg" />
              ) : (
                <span className="text-lg font-bold text-emerald-600">Free</span>
              )}

              <div className="space-y-2 text-sm">
                {e.durationMinutes && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} className="text-rose-400 shrink-0" />
                    {e.durationMinutes < 60 ? `${e.durationMinutes} minutes` : `${Math.floor(e.durationMinutes / 60)} hours`}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} className="text-rose-400 shrink-0" />
                  {e.minGuests}{e.maxGuests ? `–${e.maxGuests}` : "+"} guests
                </div>
                {e.providerName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={14} className="text-rose-400 shrink-0" />
                    {e.providerName}
                  </div>
                )}
              </div>

              <button className="w-full rounded-xl bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700 transition-colors">
                Book this experience
              </button>
              <p className="text-center text-xs text-gray-400">No payment taken yet — enquiry only</p>
            </div>

            {e.destinationName && (
              <Link
                href={`/destinations/${e.destinationId}`}
                className="block rounded-2xl bg-emerald-50 border border-emerald-100 p-5 hover:bg-emerald-100 transition-colors"
              >
                <p className="font-semibold text-emerald-800">📍 {e.destinationName}</p>
                <p className="text-sm text-emerald-600 mt-1">View destination →</p>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
