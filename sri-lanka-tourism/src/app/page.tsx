import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { routes } from "@/lib/constants/routes";

const featuredDestinations = [
  {
    name: "Ella",
    slug: "ella",
    tagline: "Misty mountains & tea trails",
    image: "/card-ella.png",
    region: "Uva Province",
    badge: "Trending",
    badgeColor: "bg-amber-500",
  },
  {
    name: "Galle",
    slug: "galle",
    tagline: "Dutch colonial charm by the sea",
    image: "/card-galle.png",
    region: "Southern Province",
    badge: "Heritage",
    badgeColor: "bg-blue-500",
  },
  {
    name: "Kandy",
    slug: "kandy",
    tagline: "Sacred city of the tooth relic",
    image: "/card-kandy.png",
    region: "Central Province",
    badge: "Cultural",
    badgeColor: "bg-purple-500",
  },
];

const categories = [
  { icon: "🏄", label: "Surfing", href: "/experiences?category=surfing" },
  { icon: "🦁", label: "Safari", href: "/experiences?category=safari" },
  { icon: "🏛️", label: "Heritage", href: "/destinations?category=heritage" },
  { icon: "🍵", label: "Tea Trails", href: "/experiences?category=tea" },
  { icon: "🤿", label: "Diving", href: "/experiences?category=diving" },
  { icon: "🏔️", label: "Hiking", href: "/experiences?category=hiking" },
  { icon: "🐋", label: "Whale Watch", href: "/experiences?category=whale-watching" },
  { icon: "🧘", label: "Wellness", href: "/experiences?category=wellness" },
];

const stats = [
  { value: "120+", label: "Destinations" },
  { value: "350+", label: "Attractions" },
  { value: "200+", label: "Experiences" },
  { value: "4.8★", label: "Average Rating" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
          <Image
            src="/hero-sigiriya.png"
            alt="Sigiriya Rock Fortress, Sri Lanka"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />

          {/* Floating pill */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-5 py-2 text-sm font-medium text-white shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Pearl of the Indian Ocean
            </span>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-xl">
              Discover the Wonder of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                Sri Lanka
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg sm:text-xl text-white/85 leading-relaxed">
              Ancient temples, emerald tea hills, pristine beaches, and vibrant wildlife — every journey tells a story.
            </p>

            {/* Search bar */}
            <div className="mt-10 w-full max-w-2xl">
              <div className="flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur shadow-2xl p-2 pl-5">
                <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search destinations, attractions, experiences..."
                  className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 text-sm outline-none py-2"
                />
                <Link
                  href={routes.search}
                  className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Explore
                </Link>
              </div>
            </div>

            {/* Quick tags */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["Beaches", "Wildlife", "Heritage", "Surfing", "Tea Country"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag.toLowerCase()}`}
                  className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/60">
            <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
            <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* ── STATS BAR ───────────────────────────────────────────────── */}
        <section className="bg-emerald-700 py-6">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-emerald-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ──────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600">What to do</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">Explore by Experience</h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-emerald-700 text-center">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED DESTINATIONS ───────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Top picks</span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">Featured Destinations</h2>
              </div>
              <Link href={routes.destinations} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                View all
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDestinations.map((dest) => (
                <Link
                  key={dest.slug}
                  href={routes.destination(dest.slug)}
                  className="group relative overflow-hidden rounded-3xl bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <span className={`absolute top-4 left-4 ${dest.badgeColor} px-3 py-1 rounded-full text-xs font-bold text-white shadow`}>
                      {dest.badge}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-xs text-white/70 font-medium mb-1">📍 {dest.region}</p>
                      <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                      <p className="text-sm text-white/80 mt-1">{dest.tagline}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-emerald-300 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Explore
                        <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY SRI LANKA ───────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-br from-emerald-950 to-teal-900 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Why visit</span>
                <h2 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
                  A world of wonder in one small island
                </h2>
                <p className="mt-5 text-lg text-white/70 leading-relaxed">
                  Sri Lanka packs eight UNESCO World Heritage Sites, 26 national parks, 1,340 km of coastline,
                  and some of the world&apos;s best surf breaks into an island you can cross in a day.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { icon: "🌊", text: "World-class surfing at Arugam Bay" },
                    { icon: "🐘", text: "Elephant encounters in Minneriya" },
                    { icon: "🍵", text: "Ceylon tea in the Hill Country" },
                    { icon: "🏛️", text: "2,500 years of living history" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <p className="text-sm text-white/80 leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href={routes.destinations} className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 transition-colors">
                    Start exploring
                  </Link>
                  <Link href={routes.search} className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors">
                    Search experiences
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "26", label: "National Parks", icon: "🌿" },
                  { number: "8", label: "UNESCO Sites", icon: "🏛️" },
                  { number: "1,340km", label: "Coastline", icon: "🌊" },
                  { number: "Year-round", label: "Sunshine", icon: "☀️" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-6 text-center hover:bg-white/15 transition-colors">
                    <span className="text-3xl">{item.icon}</span>
                    <p className="mt-2 text-3xl font-bold">{item.number}</p>
                    <p className="text-sm text-white/60 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24 px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="text-5xl">🌴</span>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">Ready to explore Sri Lanka?</h2>
            <p className="mt-4 text-lg text-gray-500">
              Create a free account to save favorites, plan trips, and get personalized recommendations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={routes.register} className="rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                Get started free
              </Link>
              <Link href={routes.destinations} className="rounded-xl border border-gray-200 px-8 py-3.5 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Browse destinations
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
