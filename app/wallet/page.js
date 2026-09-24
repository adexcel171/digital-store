"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiCreditCard, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { formatCurrency } from "@/lib/format";

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/wallet");
  }, [status, router]);

  const loadTransactions = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/wallet/transactions");
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadTransactions();
  }, [status]);

  const handleFund = async (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const initRes = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount }),
      });
      const initData = await initRes.json();

      if (!initRes.ok) {
        toast.error(initData.error || "Could not start funding.");
        setLoading(false);
        return;
      }

      // Send the user to Paystack's secure checkout page.
      // They'll be redirected back to /wallet/callback once they pay,
      // which is where we actually verify and credit the wallet.
      window.location.href = initData.authorizationUrl;
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-extrabold text-ink-900">My wallet</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-1">
          <div className="bg-gradient-to-br from-brand-700 to-ink-900 p-6 text-white">
            <div className="flex items-center gap-2 text-sm text-brand-100">
              <FiCreditCard /> Wallet balance
            </div>
            <p className="mt-3 text-3xl font-extrabold">
              {formatCurrency(session.user.walletBalance)}
            </p>
          </div>

          <form onSubmit={handleFund} className="p-6">
            <label className="label">Fund amount</label>
            <input
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-slate-200"
                >
                  {formatCurrency(a)}
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? "Processing..." : "Fund wallet"}
            </button>
            <p className="mt-3 text-xs text-slate-400">
              You&apos;ll be redirected to Paystack&apos;s secure checkout to complete payment.
              Your wallet is credited automatically once payment is confirmed.
            </p>
          </form>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-ink-900">Transaction history</h2>

          {fetching ? (
            <p className="mt-6 text-sm text-slate-400">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No transactions yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {transactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        t.type === "FUND"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {t.type === "FUND" ? (
                        <FiArrowDownLeft size={16} />
                      ) : (
                        <FiArrowUpRight size={16} />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {t.type === "FUND" ? "Wallet funding" : "Purchase"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t.reference} · {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "FUND" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.type === "FUND" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
