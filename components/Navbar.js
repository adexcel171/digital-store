"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiCreditCard,
  FiLogOut,

  FiSearch,
  FiPackage,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

const LINKS = [
  { href: "/", label: "Marketplace" },
  { href: "/dashboard", label: "My Orders" },
  { href: "/wallet", label: "Wallet" },
];

// Defined at module level so React keeps the same input mounted while typing.
function SearchForm({ id, inputRef, value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <FiSearch
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id={id}
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products"
        className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-ink-900 placeholder:text-slate-400 transition-colors focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
      />
    </form>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const { count } = useCart();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState(searchParams?.get("search") ?? "");

  const menuRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "DigitalMart";
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const loading = status === "loading";
  const cartLabel = count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart";

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // Shadow only after the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
    setMobileSearch(false);
  }, [pathname]);

  // Keep the input in sync with the URL (e.g. back button)
  useEffect(() => {
    setQuery(searchParams?.get("search") ?? "");
  }, [searchParams]);

  // Close account menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Drawer: lock body scroll + Escape to close
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  // Focus the input when the mobile search bar opens
  useEffect(() => {
    if (mobileSearch) mobileSearchRef.current?.focus();
  }, [mobileSearch]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}#products` : "/");
    setMobileSearch(false);
    setDrawerOpen(false);
  };

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-shadow ${
        scrolled ? "border-slate-200 shadow-sm" : "border-slate-200/70"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <nav aria-label="Main" className="container-app flex h-16 items-center gap-3 lg:gap-6">
        {/* Mobile menu button */}
        <button
          className="-ml-2 rounded-lg p-2 text-ink-700 hover:bg-slate-100 md:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
        >
          <FiMenu size={22} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-lg font-extrabold text-ink-900"
        >
          
          <span className="hidden min-[400px]:inline">{appName}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-700 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop search */}
        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <SearchForm
            id="nav-search"
            value={query}
            onChange={setQuery}
            onSubmit={submitSearch}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          {/* Mobile search toggle */}
          <button
            className="rounded-lg p-2 text-ink-700 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileSearch((v) => !v)}
            aria-label={mobileSearch ? "Close search" : "Search"}
            aria-expanded={mobileSearch}
          >
            {mobileSearch ? <FiX size={20} /> : <FiSearch size={20} />}
          </button>

          {/* Wallet chip */}
          {user && (
            <Link
              href="/wallet"
              className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 sm:flex"
              aria-label={`Wallet balance ${formatCurrency(user.walletBalance ?? 0)}`}
            >
              <FiCreditCard size={14} aria-hidden="true" />
              {formatCurrency(user.walletBalance ?? 0)}
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-ink-700 hover:bg-slate-100"
            aria-label={cartLabel}
          >
            <FiShoppingCart size={20} />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {/* Account (desktop) */}
          {loading ? (
            <div className="hidden h-9 w-24 animate-pulse rounded-lg bg-slate-100 md:block" />
          ) : user ? (
            <div ref={menuRef} className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-medium text-ink-700 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold uppercase text-brand-700">
                  {(user.name || user.email || "U").trim().charAt(0)}
                </span>
                <span className="max-w-[96px] truncate">{user.name?.split(" ")[0] || "Account"}</span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                    {user.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
                  </div>
                  <div className="p-1.5">
                    <MenuLink href="/dashboard" icon={FiPackage}>My Orders</MenuLink>
                    <MenuLink href="/wallet" icon={FiCreditCard}>
                      Wallet
                      <span className="ml-auto text-xs font-semibold text-emerald-700">
                        {formatCurrency(user.walletBalance ?? 0)}
                      </span>
                    </MenuLink>
                    {isAdmin && (
                      <MenuLink href="/admin" icon={FiShield}>Admin</MenuLink>
                    )}
                  </div>
                  <div className="border-t border-slate-100 p-1.5">
                    <button
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <FiLogOut size={16} aria-hidden="true" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile search bar */}
      {mobileSearch && (
        <div className="border-t border-slate-100 bg-white px-4 py-2.5 md:hidden">
          <SearchForm
            id="nav-search-mobile"
            inputRef={mobileSearchRef}
            value={query}
            onChange={setQuery}
            onSubmit={submitSearch}
          />
        </div>
      )}
    </header>

      {/* Mobile drawer — rendered OUTSIDE <header>: the header's backdrop-blur creates a
          containing block that would clip a position:fixed child to the 64px header height. */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          drawerOpen ? "" : "pointer-events-none invisible transition-[visibility] delay-200"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 motion-reduce:transition-none ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-lg font-extrabold text-ink-900">{appName}</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-ink-700 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <FiX size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3">
              <SearchForm
                id="nav-search-drawer"
                value={query}
                onChange={setQuery}
                onSubmit={submitSearch}
              />
            </div>

            {user && (
              <div className="mb-3 rounded-xl bg-slate-50 p-3">
                <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                <Link
                  href="/wallet"
                  className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                >
                  <span className="flex items-center gap-2">
                    <FiCreditCard size={16} aria-hidden="true" /> Wallet
                  </span>
                  <span>{formatCurrency(user.walletBalance ?? 0)}</span>
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {[...LINKS, ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive(l.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            {user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <FiLogOut size={16} aria-hidden="true" />
                Log out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-ink-700 hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-brand-600 px-3 py-3 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function MenuLink({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-slate-100"
    >
      <Icon size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}