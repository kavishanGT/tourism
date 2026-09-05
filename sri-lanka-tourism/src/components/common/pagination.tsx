"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;           // 0-indexed (matches Spring Boot)
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "h-9 min-w-9 rounded-lg border px-2.5 text-sm font-medium transition-colors",
              p === page
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            {(p as number) + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

/** Build a compact page list with ellipsis */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | "…")[] = [];
  const addPage = (n: number) => pages.push(n);
  const addDots = () => { if (pages[pages.length - 1] !== "…") pages.push("…"); };

  addPage(0);
  if (current > 2) addDots();

  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
    addPage(i);
  }

  if (current < total - 3) addDots();
  addPage(total - 1);

  return pages;
}
