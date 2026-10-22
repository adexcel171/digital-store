"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiShoppingCart, FiCheck, FiFileText } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

const CATEGORY_STYLES = {
  Ebook:    { pill: "bg-blue-50 text-blue-700",     dot: "bg-blue-500" },
  Course:   { pill: "bg-green-50 text-green-700",   dot: "bg-green-500" },
  Template: { pill: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
  License:  { pill: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
};
const DEFAULT_STYLE = { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };

export default function ProductCard({ product }) {
  const { _id, title, price, originalPrice, category, image, images, rating, salesCount } = product;
  const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
  const cart = useCart();

  const src = image || images?.[0];
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hasDiscount = originalPrice && originalPrice > price;

  const handleAddToCart = () => {
    if (typeof cart?.addToCart !== "function") {
      toast.error("Cart is unavailable right now.");
      return;
    }
    cart.addToCart(product, 1);
    toast.success("Added to cart", { id: `cart-${_id}` });
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative flex w-full min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-gray-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-500 sm:p-3">
      {/* small thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-[72px] sm:w-[72px] lg:h-16 lg:w-16">
        {src && !imgError ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
            <Image
              src={src}
              alt={title}
              fill
              sizes="(min-width:640px) 72px, 64px"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`object-cover transition duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <FiFileText size={20} />
          </div>
        )}
      </div>

      {/* details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {category}
        </span>

        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 sm:line-clamp-1">
          <Link
            href={`/product/${_id}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        {(rating > 0 || salesCount > 0) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
            {rating > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="text-amber-400">★</span>
                {Number(rating).toFixed(1)}
              </span>
            )}
            {salesCount > 0 && <span>{salesCount.toLocaleString()} sold</span>}
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-bold text-gray-900">{formatCurrency(price)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* add button */}
      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={`Add ${title} to cart`}
        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition active:scale-95 sm:h-9 sm:w-9 ${
          added ? "bg-green-600" : "bg-gray-900 hover:bg-blue-600"
        }`}
      >
        {added ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
      </button>
    </article>
  );
}