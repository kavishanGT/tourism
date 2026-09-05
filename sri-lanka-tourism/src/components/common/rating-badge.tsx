import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;       // 1-5
  count?: number;       // review count
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({ rating, count, size = "md", className }: RatingBadgeProps) {
  const clipped = Math.min(5, Math.max(0, rating));
  const sizes = { sm: "text-xs gap-0.5", md: "text-sm gap-1", lg: "text-base gap-1.5" };
  const starSizes = { sm: 10, md: 13, lg: 16 };

  return (
    <span className={cn("inline-flex items-center font-medium text-gray-700", sizes[size], className)}>
      <Star
        size={starSizes[size]}
        className="text-amber-400 fill-amber-400"
      />
      <span>{clipped.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-gray-400 font-normal">({count.toLocaleString()})</span>
      )}
    </span>
  );
}

/** Renders up to 5 filled/empty star icons */
export function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </span>
  );
}
