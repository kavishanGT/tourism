"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";

interface SearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({ placeholder = "Search destinations, attractions, experiences…", autoFocus }: SearchInputProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = params.get("q") ?? "";

  const updateQuery = (value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const next = new URLSearchParams();
      if (value.trim()) next.set("q", value.trim());
      startTransition(() => router.push(`/search?${next.toString()}`));
    }, 350);
  };

  const clear = () => {
    startTransition(() => router.push("/search"));
  };

  return (
    <div className="relative w-full">
      <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPending ? "text-emerald-500 animate-pulse" : "text-gray-400"}`} />
      <input
        type="text"
        autoFocus={autoFocus}
        placeholder={placeholder}
        defaultValue={q}
        key={q} // remount when query cleared
        onChange={(e) => updateQuery(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-gray-800 placeholder-gray-400 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-base transition-all"
      />
      {q && (
        <button
          onClick={clear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
