"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiPackage, FiExternalLink } from "react-icons/fi";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-extrabold text-ink-900">My orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        Access links for your purchased digital products.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-slate-400">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <FiPackage size={40} className="text-slate-300" />
          <p className="mt-3 font-semibold text-ink-900">No orders yet</p>
          <p className="text-sm text-slate-500">
            Your purchased products will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{order.reference}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">
                  {order.status}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {item.title} {item.quantity > 1 && `× ${item.quantity}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary !py-1.5 !px-3 text-xs"
                      >
                        Access <FiExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Delivered via email</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end border-t border-slate-100 pt-3 text-sm font-bold text-ink-900">
                Total: {formatCurrency(order.total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
