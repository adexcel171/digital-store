import Link from "next/link";
import {
  FiZap,
  FiShield,
  FiHeadphones,
  FiMail,
  FiTwitter,
  FiInstagram,
  FiFacebook,
} from "react-icons/fi";

const TRUST = [
  { icon: FiZap, title: "Instant delivery", text: "Get your files right after payment." },
  { icon: FiShield, title: "Secure payments", text: "Your wallet and card details stay protected." },
  { icon: FiHeadphones, title: "Real support", text: "Questions about an order? We reply fast." },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/", label: "All products" },
      { href: "/?sort=newest", label: "New arrivals" },
      { href: "/categories", label: "Categories" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "My orders" },
      { href: "/wallet", label: "Wallet" },
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help center" },
      { href: "/help/wallet-payments", label: "Wallet & payments" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/refunds", label: "Refund policy" },
    ],
  },
];

export default function Footer() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "DigitalMart";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  // Only render social icons whose URL is set in .env
  const socials = [
    { label: "Twitter", icon: FiTwitter, href: process.env.NEXT_PUBLIC_TWITTER_URL },
    { label: "Instagram", icon: FiInstagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "Facebook", icon: FiFacebook, href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Trust strip */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <ul className="container-app grid gap-6 py-8 sm:grid-cols-3">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main */}
      <div className="container-app grid gap-10 py-12 md:grid-cols-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-extrabold text-ink-900">{appName}</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
            Your marketplace for premium digital products, delivered the moment you pay.
          </p>

          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-brand-700"
            >
              <FiMail size={16} aria-hidden="true" />
              {supportEmail}
            </a>
          )}

          {socials.length > 0 && (
            <ul className="mt-5 flex items-center gap-2">
              {socials.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${appName} on ${label}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-700"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4"
        >
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink-900">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 transition-colors hover:text-brand-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-100">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </p>
          <p>Secure checkout · Instant digital delivery</p>
        </div>
      </div>
    </footer>
  );
}