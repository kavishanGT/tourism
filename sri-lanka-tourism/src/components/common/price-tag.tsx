import { formatCurrency } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  amount: number;
  currency?: string;
  prefix?: string;       // e.g. "From"
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceTag({
  amount,
  currency = "USD",
  prefix = "From",
  size = "md",
  className,
}: PriceTagProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-1 font-semibold text-gray-900", sizeClass, className)}>
      {prefix && <span className="text-xs font-normal text-gray-500">{prefix}</span>}
      {formatCurrency(amount, currency)}
    </span>
  );
}
