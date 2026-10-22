"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function AddToCartPanel({ product }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const addItems = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  const handleAdd = () => {
    addItems();
    toast.success(`${product.title} added to cart`);
  };

  const handleBuyNow = () => {
    addItems();
    router.push("/cart");
  };

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* quantity stepper */}
      <div className="flex w-fit items-center rounded-xl ring-1 ring-slate-200">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-3 text-ink-700 hover:bg-slate-50 sm:p-2.5"
        >
          <FiMinus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-semibold sm:w-8">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
          className="p-3 text-ink-700 hover:bg-slate-50 sm:p-2.5"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* buttons share the row equally on phones, natural width from sm up */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="btn-secondary flex-1 justify-center whitespace-nowrap sm:flex-none"
        >
          <FiShoppingCart size={16} /> Add to cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="btn-primary flex-1 justify-center whitespace-nowrap sm:flex-none"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}