import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAttraction } from "@/lib/api/attractions";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { PriceTag } from "@/components/common/price-tag";
import { Clock, MapPin, Users, Globe } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const a = await getAttraction(slug);
    return {
      title: a.name,
      description: a.shortDescription ?? `Explore ${a.name} in Sri Lanka`,
    };
  } catch {
    return { title: "Attraction" };
  }
}

export default async function AttractionDetailPage({ params }: Props) {
  const { slug } = await params;

  let attraction;
  try {
    attraction = await getAttraction(slug);
  } catch {
    notFound();
  }

  const a = attraction;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-900 to-indigo-800 px-4 py-20 text-center overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center text-[18rem] font-black text-white/5 select-none pointer-events-none">
          {a.name.charAt(0)}
        </span>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumb items={[
              { label: "Attractions", href: "/attractions" },
              { label: a.name },
            ]} />
          </div>
          <h1 className="text-5xl font-bold text-white sm:text-6xl">{a.name}</h1>
          {a.destinationName && (
            <div className="mt-3 flex justify-center items-center gap-1.5 text-blue-300">
              <MapPin size={15} />
              <span>{a.destinationName}</span>
            </div>
          )}
          {a.shortDescription && (
            <p className="mt-5 max-w-2xl mx-auto text-lg text-white/75">{a.shortDescription}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {a.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this attraction</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{a.description}</p>
              </div>
            )}

            {/* Location */}
            {(a.latitude || a.longitude) && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={15} className="text-blue-600" /> Location
                </h3>
                <p className="text-sm text-gray-600">{a.latitude?.toFixed(4)}° N, {a.longitude?.toFixed(4)}° E</p>
                <a
                  href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Globe size={13} /> Open in Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Details</h3>

              {a.priceFrom != null ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Price</span>
                  <PriceTag amount={a.priceFrom} currency={a.currency ?? "USD"} />
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-medium text-emerald-600">Free entry</span>
                </div>
              )}

              {a.durationMinutes && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><Clock size={13} /> Duration</span>
                  <span className="font-medium text-gray-900">
                    {a.durationMinutes < 60 ? `${a.durationMinutes} min` : `${Math.floor(a.durationMinutes / 60)}h ${a.durationMinutes % 60 ? a.durationMinutes % 60 + "m" : ""}`}
                  </span>
                </div>
              )}
            </div>

            {a.destinationName && (
              <Link
                href={`/destinations/${a.destinationId}`}
                className="block rounded-2xl bg-emerald-50 border border-emerald-100 p-5 hover:bg-emerald-100 transition-colors"
              >
                <p className="font-semibold text-emerald-800">📍 {a.destinationName}</p>
                <p className="text-sm text-emerald-600 mt-1">View destination →</p>
              </Link>
            )}

            <Link
              href="/experiences"
              className="block rounded-2xl bg-blue-50 border border-blue-100 p-5 hover:bg-blue-100 transition-colors"
            >
              <p className="font-semibold text-blue-800">Book an Experience</p>
              <p className="text-sm text-blue-600 mt-1">Guided tours & activities →</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
