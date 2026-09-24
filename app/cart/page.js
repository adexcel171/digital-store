"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const balance = session?.user?.walletBalance ?? 0;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Please log in to check out.");
      router.push("/login");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Checkout failed.");
        if (res.status === 402) router.push("/wallet");
        return;
      }

      await update({ walletBalance: data.walletBalance });
      clearCart();
      toast.success("Purchase successful! Check My Orders for access.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-app flex flex-col items-center justify-center px-4 py-20 text-center sm:py-24">
        <FiShoppingBag size={48} className="text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Browse our catalog and add some digital products.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 sm:py-10">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900 sm:text-2xl">Your cart</h1>
        <p className="text-sm text-slate-500">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8">
        {/* Items */}
        <ul className="space-y-3 sm:space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li key={item.productId} className="card p-3 sm:p-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-24">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Title + remove */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 break-words text-sm font-semibold text-ink-900 sm:text-base">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                      aria-label={`Remove ${item.title}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity + line total */}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-xl ring-1 ring-slate-200">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="rounded-l-xl p-2.5 text-ink-700 hover:bg-slate-50"
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        <FiMinus size={12} />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-semibold"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="rounded-r-xl p-2.5 text-ink-700 hover:bg-slate-50"
                        aria-label={`Increase quantity of ${item.title}`}
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <p className="text-right text-sm font-bold text-ink-900 sm:text-base">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-bold text-ink-900">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>Delivery fee</span>
            <span>Free</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-bold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {session && (
            <p className="mt-3 text-xs text-slate-500">
              Wallet balance:{" "}
              <span className="font-semibold text-ink-700">{formatCurrency(balance)}</span>
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary mt-6 w-full"
          >
            {loading ? "Processing..." : "Pay with wallet"}
          </button>

          {session && balance < total && (
            <Link
              href="/wallet"
              className="mt-3 block text-center text-sm font-medium text-brand-600 hover:underline"
            >
              Insufficient balance — fund your wallet
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}