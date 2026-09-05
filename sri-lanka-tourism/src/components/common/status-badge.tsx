import { cn } from "@/lib/utils";

type StatusVariant = "PUBLISHED" | "DRAFT" | "PENDING_REVIEW" | "REJECTED" | "ARCHIVED";

const variantStyles: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
};

const labels: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = variantStyles[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = labels[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
