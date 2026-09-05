import Link from "next/link";
import { routes } from "@/lib/constants/routes";

export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href={routes.home} className="font-bold text-emerald-700 text-lg">
              🌴 Sri Lanka Tourism
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Discover the pearl of the Indian Ocean.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href={routes.destinations} className="hover:text-emerald-600">Destinations</Link></li>
              <li><Link href={routes.attractions} className="hover:text-emerald-600">Attractions</Link></li>
              <li><Link href={routes.experiences} className="hover:text-emerald-600">Experiences</Link></li>
              <li><Link href={routes.search} className="hover:text-emerald-600">Search</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Stay &amp; Eat</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href={routes.accommodations} className="hover:text-emerald-600">Accommodations</Link></li>
              <li><Link href={routes.restaurants} className="hover:text-emerald-600">Restaurants</Link></li>
              <li><Link href={routes.events} className="hover:text-emerald-600">Events</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li><Link href={routes.profile} className="hover:text-emerald-600">My Profile</Link></li>
              <li><Link href={routes.trips} className="hover:text-emerald-600">My Trips</Link></li>
              <li><Link href={routes.login} className="hover:text-emerald-600">Sign in</Link></li>
              <li><Link href={routes.register} className="hover:text-emerald-600">Register</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Sri Lanka Tourism Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
