"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { FiCreditCard } from "react-icons/fi";

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) =>
    filter === "ALL" ? true : t.type === filter
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Payments</h1>
      <p className="mt-1 text-sm text-slate-500">
        All wallet fundings and purchases across the platform.
      </p>

      <div className="mt-4 flex gap-2">
        {["ALL", "FUND", "PURCHASE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "ALL" ? "All" : f === "FUND" ? "Fundings" : "Purchases"}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FiCreditCard size={36} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No transactions found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="p-4">Reference</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4 font-medium text-ink-800">{t.reference}</td>
                  <td className="p-4 text-slate-600">
                    {t.user?.name || "Deleted user"}
                    <div className="text-xs text-slate-400">{t.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`badge ${
                        t.type === "FUND"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-ink-900">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`badge ${
                        t.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700"
                          : t.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
