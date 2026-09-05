import { Suspense } from "react";
import type { Metadata } from "next";
import { MapExplorerContent } from "./map-explorer-content";

export const metadata: Metadata = {
  title: "Interactive Map | Sri Lanka Tourism",
  description: "Visually explore Sri Lanka destinations, attractions, and cultural landmarks on an interactive map.",
};

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-4rem)] w-full bg-gray-100 animate-pulse" />}>
      <MapExplorerContent />
    </Suspense>
  );
}
