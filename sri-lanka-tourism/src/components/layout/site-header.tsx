"use client";

import Link from "next/link";
import { routes } from "@/lib/constants/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { User, Compass, LogOut, MapPin, Sparkles } from "lucide-react";

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.roles?.some((r) => r.includes("ADMIN"));

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent("open-ai-assistant"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={routes.home} className="flex items-center gap-2 font-bold text-lg text-emerald-700">
          🌴 Sri Lanka Tourism
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href={routes.destinations} className="hover:text-emerald-700 transition-colors">
            Destinations
          </Link>
          <Link href={routes.attractions} className="hover:text-emerald-700 transition-colors">
            Attractions
          </Link>
          <Link href={routes.experiences} className="hover:text-emerald-700 transition-colors">
            Experiences
          </Link>
          <Link href={routes.search} className="hover:text-emerald-700 transition-colors">
            Search
          </Link>
          <Link href={routes.map} className="flex items-center gap-1 hover:text-emerald-700 transition-colors">
            <MapPin size={14} className="text-emerald-600" />
            Map
          </Link>
          <button
            onClick={handleOpenAi}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} className="animate-pulse text-emerald-200" />
            <span>AI Assistant</span>
          </button>

          {isAuthenticated && (
            <Link
              href={routes.trips}
              className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors"
            >
              <Compass size={15} />
              My Trips
            </Link>
          )}
          {isAdmin && (
            <Link href={routes.admin.dashboard} className="text-amber-700 font-semibold hover:text-amber-800 transition-colors">
              Admin Portal
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile AI Quick Button */}
          <button
            onClick={handleOpenAi}
            className="flex md:hidden items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
          >
            <Sparkles size={13} />
            <span>AI</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href={routes.profile}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-3.5 py-1.5 rounded-full transition-all border border-gray-200"
              >
                <User size={13} className="text-emerald-600" />
                <span>{user?.email}</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut size={13} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href={routes.login}
                className="text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={routes.register}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
