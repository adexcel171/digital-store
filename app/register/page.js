"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap } from "react-icons/fi";

// Reuses the same cover photo as the login page: public/auth-cover.jpg
const COVER_IMAGE = "/auth-cover.jpg";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInRes?.error) {
        toast.success("Account created. Please log in.");
        router.push("/login");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Join thousands buying digital products with ease.
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
          <h1 className="text-2xl font-extrabold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign up to fund your wallet and start shopping.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input !pl-10"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input !pl-10 !pr-10"
                  placeholder="At least 6 characters"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}