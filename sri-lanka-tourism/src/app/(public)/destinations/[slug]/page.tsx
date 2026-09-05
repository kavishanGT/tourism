import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestination, getDestinations } from "@/lib/api/destinations";
import { getLatitude, getLongitude } from "@/types/destination";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { MapPin, Globe } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const d = await getDestination(slug);
    return {
      title: d.seoTitle ?? d.name,
      description: d.seoDescription ?? d.shortDescription,
    };
  } catch {
    return { title: "Destination" };
  }
}

export async function generateStaticParams() {
  try {
    const result = await getDestinations({ size: 100 });
    return result.data.map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;

  let destination;
  try {
    destination = await getDestination(slug);
  } catch {
    notFound();
  }

  const d = destination;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-emerald-900 to-teal-800 px-4 py-20 text-center overflow-hidden">
        {/* Background letter */}
        <span className="absolute inset-0 flex items-center justify-center text-[20rem] font-black text-white/5 select-none pointer-events-none">
          {d.name.charAt(0)}
        </span>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumb
              items={[
                { label: "Destinations", href: "/destinations" },
                { label: d.name },
              ]}
            />
          </div>
          {d.featured && (
            <span className="inline-block mb-3 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
              ⭐ Featured Destination
            </span>
          )}
          <h1 className="text-5xl font-bold text-white sm:text-6xl">{d.name}</h1>
          {d.region && (
            <div className="mt-3 flex justify-center items-center gap-1.5 text-emerald-300">
              <MapPin size={16} />
              <span className="text-base font-medium">{d.region.name}</span>
            </div>
          )}
          {d.shortDescription && (
            <p className="mt-5 max-w-2xl mx-auto text-lg text-white/75 leading-relaxed">
              {d.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            {d.description && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {d.name}</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {d.description}
                </div>
              </div>
            )}

            {/* Location coordinates */}
            {(getLatitude(d) !== 0 || getLongitude(d) !== 0) && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600" />
                  Location
                </h3>
                <p className="text-sm text-gray-600">
                  {getLatitude(d).toFixed(4)}° N, {getLongitude(d).toFixed(4)}° E
                </p>
                <a
                  href={`https://www.google.com/maps?q=${getLatitude(d)},${getLongitude(d)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Globe size={13} />
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Quick info</h3>
              {d.region && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Region</span>
                  <Link
                    href={`/destinations?region=${d.region.slug}`}
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    {d.region.name}
                  </Link>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${d.status === "PUBLISHED" ? "text-emerald-600" : "text-amber-600"}`}>
                  {d.status}
                </span>
              </div>
            </div>

            <Link
              href="/attractions"
              className="block rounded-2xl bg-emerald-50 border border-emerald-100 p-5 hover:bg-emerald-100 transition-colors"
            >
              <p className="font-semibold text-emerald-800">Nearby Attractions</p>
              <p className="text-sm text-emerald-600 mt-1">Explore things to do →</p>
            </Link>

            <Link
              href="/experiences"
              className="block rounded-2xl bg-teal-50 border border-teal-100 p-5 hover:bg-teal-100 transition-colors"
            >
              <p className="font-semibold text-teal-800">Experiences</p>
              <p className="text-sm text-teal-600 mt-1">Book unique activities →</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
