"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import Link from "next/link";
import { User, MapPin, Compass } from "lucide-react";
import { routes } from "@/lib/constants/routes";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(routes.login);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Sidebar navigation */}
            <aside className="md:col-span-1 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <h3 className="mt-3 font-bold text-gray-900 truncate">{user?.email}</h3>
                <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
                  {user?.roles?.join(", ") || "Explorer"}
                </p>
              </div>

              <nav className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <User size={18} />
                  My Profile
                </Link>
                <Link
                  href="/trips"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Compass size={18} />
                  My Trips
                </Link>
              </nav>
            </aside>

            {/* Main content area */}
            <div className="md:col-span-3">{children}</div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
