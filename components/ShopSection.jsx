"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { FiSearch } from "react-icons/fi";

export default function ShopSection({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.title?.toLowerCase().includes(q));
    }

    return result;
  }, [products, activeCategory, search]);

  return (
    <section id="products" className="mx-auto max-w-6xl px-5 py-10">

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === "all"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="relative ml-auto">
          <FiSearch
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-48 rounded-full border border-gray-200 bg-white py-1.5 pl-8 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="mt-20 flex flex-col items-center py-20 text-center">
          <p className="text-base font-semibold text-gray-800">No products found</p>
          <p className="mt-1.5 text-sm text-gray-400">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
            {activeCategory === "all" ? "All products" : activeCategory} &mdash; {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
