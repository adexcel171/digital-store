"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap } from "react-icons/fi";

// Put a photo at: public/auth-cover.jpg (portrait-ish works best)
const COVER_IMAGE = "/auth-cover.jpg";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left: cover image, hidden on small screens */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink-900 lg:block">
        <Image
          src={COVER_IMAGE}
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            DigitalMart
          </Link>

          <div>
            <h2 className="max-w-sm text-2xl font-extrabold leading-snug">
              Fund your wallet once. Shop in one click.
            </h2>
            <div className="mt-6 flex flex-col gap-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <FiShield className="shrink-0 text-brand-400" /> Secure wallet payments
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="shrink-0 text-brand-400" /> Instant digital delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="container-app flex w-full items-center justify-center py-16 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to continue shopping.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
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
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input !pl-10 !pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}