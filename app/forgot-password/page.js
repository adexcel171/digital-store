"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiMail, FiCheckCircle } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Something went wrong.");
        return;
      }

      setSent(true);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex min-h-[calc(100vh-64px)] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        {sent ? (
          <div className="text-center">
            <FiCheckCircle size={40} className="mx-auto text-emerald-500" />
            <h1 className="mt-4 text-xl font-extrabold text-ink-900">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a
              password reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="btn-secondary mt-6 w-full">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-ink-900">Forgot password?</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input !pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link href="/login" className="font-semibold text-brand-600 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
