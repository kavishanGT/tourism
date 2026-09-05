interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div className={`animate-pulse rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 ${className}`}>
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gray-200" />
      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-gray-200" />
          <div className="h-5 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="h-5 w-3/4 rounded-md bg-gray-200" />
        <div className="h-4 w-full rounded-md bg-gray-200" />
        <div className="h-4 w-2/3 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
