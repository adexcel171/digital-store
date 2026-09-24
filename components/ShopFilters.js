"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function ShopFilters({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const activeCategory = searchParams.get("category") || "all";

  const applyFilters = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters({ search });
        }}
        className="relative w-full sm:max-w-sm"
      >
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input !pl-10"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => applyFilters({ category: "all" })}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeCategory === "all"
              ? "bg-brand-600 text-white"
              : "bg-white text-ink-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => applyFilters({ category: c })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === c
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
