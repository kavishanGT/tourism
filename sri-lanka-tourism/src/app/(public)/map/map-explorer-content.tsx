"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Layers, Navigation, Crosshair, AlertCircle } from "lucide-react";
import type { MapItem } from "@/components/map/map-popup";
import { useDestinations } from "@/features/destinations/hooks/use-destinations";
import { useAttractions } from "@/features/attractions/hooks/use-attractions";
import { getLatitude, getLongitude } from "@/types/destination";
import { useUserLocation } from "@/hooks/use-user-location";
import { fetchRoute, type RouteData, type RouteProfile } from "@/lib/services/routing";
import { RouteDirectionsPanel } from "@/components/map/route-directions-panel";

// Dynamically import Leaflet map with SSR disabled
const DestinationMap = dynamic(
  () => import("@/components/map/destination-map").then((mod) => mod.DestinationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Navigation size={32} className="text-emerald-600 animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading interactive map…</span>
        </div>
      </div>
    ),
  }
);

// Fallback user location (Colombo) if browser geolocation is disabled or denied
const DEFAULT_ORIGIN: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka

// Initial fallback locations for demonstration if API returns empty
const SAMPLE_MAP_ITEMS: MapItem[] = [
  {
    id: "sigiriya",
    name: "Sigiriya Rock Fortress",
    slug: "sigiriya",
    type: "DESTINATION",
    shortDescription: "Ancient palace fortress built atop a 200m granite rock pillar.",
    latitude: 7.957,
    longitude: 80.7603,
    regionName: "Central Province",
    featured: true,
  },
  {
    id: "ella",
    name: "Ella",
    slug: "ella",
    type: "DESTINATION",
    shortDescription: "Misty mountain village surrounded by tea plantations and waterfalls.",
    latitude: 6.8667,
    longitude: 81.0466,
    regionName: "Uva Province",
    featured: true,
  },
  {
    id: "galle",
    name: "Galle Fort",
    slug: "galle",
    type: "DESTINATION",
    shortDescription: "17th-century Dutch colonial fortification by the Indian Ocean.",
    latitude: 6.03,
    longitude: 80.217,
    regionName: "Southern Province",
    featured: true,
  },
  {
    id: "kandy",
    name: "Kandy",
    slug: "kandy",
    type: "DESTINATION",
    shortDescription: "Sacred city housing the Temple of the Sacred Tooth Relic.",
    latitude: 7.2906,
    longitude: 80.6337,
    regionName: "Central Province",
    featured: true,
  },
  {
    id: "nine-arch",
    name: "Nine Arch Bridge",
    slug: "nine-arch-bridge",
    type: "ATTRACTION",
    shortDescription: "Iconic colonial viaduct bridge nestled in dense jungle tea hills.",
    latitude: 6.8768,
    longitude: 81.0608,
    destinationName: "Ella",
    featured: true,
  },
  {
    id: "yala",
    name: "Yala National Park",
    slug: "yala-national-park",
    type: "ATTRACTION",
    shortDescription: "World's highest density of Sri Lankan leopards & wild elephants.",
    latitude: 6.3725,
    longitude: 81.5185,
    destinationName: "Tissamaharama",
    featured: true,
  },
  {
    id: "dambulla",
    name: "Dambulla Cave Temple",
    slug: "dambulla-cave-temple",
    type: "ATTRACTION",
    shortDescription: "UNESCO complex of five cave shrines adorned with Buddha statues.",
    latitude: 7.8567,
    longitude: 80.6483,
    destinationName: "Dambulla",
    featured: false,
  },
  {
    id: "mirissa",
    name: "Mirissa Beach & Coconut Tree Hill",
    slug: "mirissa-beach",
    type: "DESTINATION",
    shortDescription: "Golden sand bay famed for blue whale watching and palm hills.",
    latitude: 5.9483,
    longitude: 80.4716,
    regionName: "Southern Province",
    featured: true,
  },
];

export function MapExplorerContent() {
  const [filterType, setFilterType] = useState<"ALL" | "DESTINATION" | "ATTRACTION">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]);
  const [mapZoom, setMapZoom] = useState<number>(8);

  // Routing and user location state
  const userLoc = useUserLocation();
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<MapItem | null>(null);
  const [routeProfile, setRouteProfile] = useState<RouteProfile>("driving");
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  const { data: destData } = useDestinations({ size: 50 });
  const { data: attrData } = useAttractions({ size: 50 });

  // Map API items into uniform MapItem format
  const apiDestinations: MapItem[] = (destData?.data || [])
    .filter((d) => getLatitude(d) !== 0 && getLongitude(d) !== 0)
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      type: "DESTINATION" as const,
      shortDescription: d.shortDescription,
      latitude: getLatitude(d),
      longitude: getLongitude(d),
      regionName: d.region?.name,
      featured: d.featured,
    }));

  const apiAttractions: MapItem[] = (attrData?.data || [])
    .filter((a) => a.latitude !== 0 && a.longitude !== 0)
    .map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      type: "ATTRACTION" as const,
      shortDescription: a.shortDescription,
      latitude: a.latitude,
      longitude: a.longitude,
      destinationName: a.destinationName,
      featured: a.featured,
    }));

  // Combine API items or fallback to sample items if API returns empty
  const allDestinations = apiDestinations.length > 0 ? apiDestinations : SAMPLE_MAP_ITEMS.filter((i) => i.type === "DESTINATION");
  const allAttractions = apiAttractions.length > 0 ? apiAttractions : SAMPLE_MAP_ITEMS.filter((i) => i.type === "ATTRACTION");

  // Filter based on search & active tab
  const filteredDestinations = allDestinations.filter(
    (d) =>
      (filterType === "ALL" || filterType === "DESTINATION") &&
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttractions = allAttractions.filter(
    (a) =>
      (filterType === "ALL" || filterType === "ATTRACTION") &&
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVisible = filteredDestinations.length + filteredAttractions.length;

  const handleSelectLocation = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(12);
  };

  const handleLocateMe = () => {
    userLoc.locateUser();
  };

  // When location updates from GPS locate button, pan map to user position
  useEffect(() => {
    if (userLoc.location && !selectedDestination) {
      setMapCenter(userLoc.location);
      setMapZoom(13);
    }
  }, [userLoc.location, selectedDestination]);

  // Route calculation handler
  const calculateRouteToDestination = useCallback(
    async (destinationItem: MapItem, profile: RouteProfile = routeProfile) => {
      setSelectedDestination(destinationItem);
      setRoutingError(null);

      // Determine starting origin (User location if available, otherwise default Colombo)
      let origin: [number, number] = userLoc.location || DEFAULT_ORIGIN;

      // If user hasn't attempted locate yet, request it
      if (!userLoc.location && !userLoc.isLoading) {
        userLoc.locateUser();
      }

      const target: [number, number] = [destinationItem.latitude, destinationItem.longitude];

      try {
        setIsRoutingLoading(true);
        const routeRes = await fetchRoute(origin, target, profile);
        setActiveRoute(routeRes);
      } catch (err: any) {
        setRoutingError(err.message || "Failed to calculate route.");
        setActiveRoute(null);
      } finally {
        setIsRoutingLoading(false);
      }
    },
    [userLoc, routeProfile]
  );

  // Live route update when tracking is enabled and position changes
  useEffect(() => {
    if (userLoc.isTracking && userLoc.location && selectedDestination) {
      const target: [number, number] = [selectedDestination.latitude, selectedDestination.longitude];
      fetchRoute(userLoc.location, target, routeProfile)
        .then((routeRes) => setActiveRoute(routeRes))
        .catch(() => {});
    }
  }, [userLoc.isTracking, userLoc.location, selectedDestination, routeProfile]);

  const handleSelectProfile = (newProfile: RouteProfile) => {
    setRouteProfile(newProfile);
    if (selectedDestination) {
      calculateRouteToDestination(selectedDestination, newProfile);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setSelectedDestination(null);
    setRoutingError(null);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* Sidebar Explorer */}
      <div className="w-full lg:w-96 flex flex-col bg-white border-r border-gray-200 z-10 shadow-md h-72 lg:h-full shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="text-emerald-600" size={20} />
              <h1 className="text-lg font-bold text-gray-900">Map Explorer</h1>
            </div>

            {/* Quick Locate User GPS Button */}
            <button
              onClick={handleLocateMe}
              disabled={userLoc.isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userLoc.location
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
              title="Locate my position on map"
            >
              <Crosshair size={14} className={userLoc.isLoading ? "animate-spin" : ""} />
              {userLoc.location ? "My GPS Active" : "Locate Me"}
            </button>
          </div>

          {userLoc.error && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px]">
              <AlertCircle size={14} className="shrink-0 text-amber-600" />
              <span>{userLoc.error}</span>
            </div>
          )}

          {routingError && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 text-red-800 text-[11px]">
              <AlertCircle size={14} className="shrink-0 text-red-600" />
              <span>{routingError}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places on map…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => setFilterType("ALL")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterType === "ALL" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({allDestinations.length + allAttractions.length})
            </button>
            <button
              onClick={() => setFilterType("DESTINATION")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterType === "DESTINATION" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Destinations ({allDestinations.length})
            </button>
            <button
              onClick={() => setFilterType("ATTRACTION")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterType === "ATTRACTION" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Attractions ({allAttractions.length})
            </button>
          </div>
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-gray-50">
          {filteredDestinations.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl hover:bg-emerald-50/60 transition-colors space-y-2 group"
            >
              <div
                onClick={() => handleSelectLocation(item.latitude, item.longitude)}
                className="cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Destination
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{item.shortDescription}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {item.regionName || "Sri Lanka"}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100/60">
                <button
                  onClick={() => calculateRouteToDestination(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Navigation size={12} />
                  Shortest Route
                </button>
              </div>
            </div>
          ))}

          {filteredAttractions.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl hover:bg-blue-50/60 transition-colors space-y-2 group pt-3"
            >
              <div
                onClick={() => handleSelectLocation(item.latitude, item.longitude)}
                className="cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Attraction
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{item.shortDescription}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {item.destinationName || "Sri Lanka"}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100/60">
                <button
                  onClick={() => calculateRouteToDestination(item)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100/80 hover:bg-blue-200/80 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Navigation size={12} />
                  Shortest Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 h-full relative">
        {/* Floating Route Directions & Metrics Panel */}
        <RouteDirectionsPanel
          route={activeRoute}
          destination={selectedDestination}
          isLoading={isRoutingLoading}
          isTracking={userLoc.isTracking}
          onSelectProfile={handleSelectProfile}
          onToggleTracking={userLoc.toggleTracking}
          onClearRoute={handleClearRoute}
        />

        <DestinationMap
          destinations={filteredDestinations}
          attractions={filteredAttractions}
          center={mapCenter}
          zoom={mapZoom}
          userLocation={userLoc.location}
          userAccuracy={userLoc.accuracy}
          isTracking={userLoc.isTracking}
          activeRoute={activeRoute}
          onGetDirections={calculateRouteToDestination}
        />
      </div>
    </div>
  );
}
