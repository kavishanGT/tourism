import type { Destination } from "@/types/destination";
import { DestinationCard } from "./destination-card";
import { SkeletonGrid } from "@/components/common/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";

interface DestinationGridProps {
  destinations: Destination[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function DestinationGrid({ destinations, isLoading, isEmpty }: DestinationGridProps) {
  if (isLoading) return <SkeletonGrid count={9} />;

  if (isEmpty || destinations.length === 0) {
    return (
      <EmptyState
        title="No destinations found"
        message="Try adjusting your search or region filter."
        actionLabel="Clear filters"
        actionHref="/destinations"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((d) => (
        <DestinationCard key={d.id} destination={d} />
      ))}
    </div>
  );
}
