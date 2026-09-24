"use client";

import Link from "next/link";
import Image from "next/image";

const CATEGORY_STYLES = {
  Ebook:    { pill: "bg-blue-50 text-blue-700",   dot: "bg-blue-500" },
  Course:   { pill: "bg-green-50 text-green-700",  dot: "bg-green-500" },
  Template: { pill: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  License:  { pill: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
};

const DEFAULT_STYLE = { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

export default function ProductCard({ product }) {
  const { _id, title, price, originalPrice, category, coverImage, rating, salesCount } = product;
  const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE;

  return (
    <Link
      href={`/products/${_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
    >
      {/* thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-gray-300">
            📄
          </div>
        )}

        {/* category badge */}
        <span
          className={`absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {category}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900">
          {title}
        </p>

        {/* rating + sales */}
        {(rating || salesCount) && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {rating && (
              <span className="flex items-center gap-0.5">
                <span className="text-amber-400">★</span>
                {rating.toFixed(1)}
              </span>
            )}
            {salesCount && <span>{salesCount.toLocaleString()} sold</span>}
          </div>
        )}

        {/* price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {originalPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                ₦{originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-sm font-bold text-gray-900">
              ₦{price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              /* hook up your buy / add-to-cart handler here */
            }}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-600"
          >
            Buy now
          </button>
        </div>
      </div>
    </Link>
  );
}