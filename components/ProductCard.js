"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

const CATEGORY_STYLES = {
  Ebook:    { pill: "bg-blue-50 text-blue-700",   dot: "bg-blue-500" },
  Course:   { pill: "bg-green-50 text-green-700",  dot: "bg-green-500" },
  Template: { pill: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  License:  { pill: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
};

const DEFAULT_STYLE = { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

export default function ProductCard({ product }) {
  const { _id, title, price, originalPrice, category, image, rating, salesCount } = product;
  const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
  const cart = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof cart?.addToCart !== "function") {
      toast.error("Cart is unavailable right now.");
      return;
    }
    cart.addToCart(product, 1);
    toast.success("Added to cart.");
  };

  return (
    <Link
      href={`/product/${_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
    >
      {/* thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 p-3">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain p-2 transition duration-300 group-hover:scale-105"
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
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            {originalPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-600"
          >
            <FiShoppingCart size={12} /> Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}