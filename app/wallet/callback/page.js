"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { formatCurrency } from "@/lib/format";

function WalletCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status: sessionStatus, update } = useSession();
  const [state, setState] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const [creditedAmount, setCreditedAmount] = useState(null);

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/wallet");
      return;
    }

    if (sessionStatus !== "authenticated") return;

    if (!reference) {
      setState("error");
      setMessage("No payment reference was found in the URL.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/wallet/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setState("error");
          setMessage(data.error || "We couldn't verify your payment.");
          return;
        }

        await update({ walletBalance: data.walletBalance });
        setCreditedAmount(data.transaction?.amount);
        setState("success");
        setMessage("Your wallet has been credited successfully.");
      } catch (err) {
        if (!cancelled) {
          setState("error");
          setMessage("Something went wrong while verifying your payment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, reference]);

  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8 text-center">
        {state === "verifying" && (
          <>
            <FiLoader size={40} className="mx-auto animate-spin text-brand-600" />
            <h1 className="mt-4 text-lg font-bold text-ink-900">Verifying payment...</h1>
            <p className="mt-1 text-sm text-slate-500">
              Please wait while we confirm your payment with Paystack.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <FiCheckCircle size={40} className="mx-auto text-emerald-500" />
            <h1 className="mt-4 text-lg font-bold text-ink-900">Payment successful</h1>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            {creditedAmount != null && (
              <p className="mt-3 text-2xl font-extrabold text-emerald-600">
                +{formatCurrency(creditedAmount)}
              </p>
            )}
            <Link href="/wallet" className="btn-primary mt-6 w-full">
              Go to my wallet
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <FiXCircle size={40} className="mx-auto text-rose-500" />
            <h1 className="mt-4 text-lg font-bold text-ink-900">Payment not confirmed</h1>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            <p className="mt-1 text-xs text-slate-400">
              If money was deducted from your account, it will be reconciled shortly.
              Contact support with reference: {reference || "N/A"}
            </p>
            <Link href="/wallet" className="btn-secondary mt-6 w-full">
              Back to wallet
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={null}>
      <WalletCallbackContent />
    </Suspense>
  );
}