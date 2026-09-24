"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Welcome back!");
    router.push(searchParams.get("callbackUrl") || "/");
    router.refresh();
  };

  return (
    <div className="container-app flex min-h-[calc(100vh-64px)] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-extrabold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to continue shopping.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input !pl-10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label !mb-1.5">Password</label>
              <Link
                href="/forgot-password"
                className="mb-1.5 text-xs font-medium text-brand-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="input !pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
