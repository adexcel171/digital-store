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

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${product.title} added to cart`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    router.push("/cart");
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-xl ring-1 ring-slate-200">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-2.5 text-ink-700 hover:bg-slate-50"
        >
          <FiMinus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="p-2.5 text-ink-700 hover:bg-slate-50"
        >
          <FiPlus size={14} />
        </button>
      </div>

      <button onClick={handleAdd} className="btn-secondary">
        <FiShoppingCart size={16} /> Add to cart
      </button>
      <button onClick={handleBuyNow} className="btn-primary">
        Buy now
      </button>
    </div>
  );
}
