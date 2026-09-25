import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopSection from "@/components/ShopSection";
import Link from "next/link";
import {
  FiZap,
  FiShield,
  FiHeadphones,
  FiUserPlus,
  FiCreditCard,
  FiShoppingBag,
  FiPackage,
  FiGift,
  FiLock,
  FiChevronDown,
  FiArrowRight,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Express Marketplace";
const SUPPORT_EMAIL = "support@digitalmart.com";

const STATS = [
  { num: "1K+", label: "Available account resources" },
  { num: "Fast", label: "Order processing" },
  { num: "24/7", label: "Customer support" },
];

const STEPS = [
  { icon: FiUserPlus, title: "1. Sign Up", text: "Create your account and open your buyer dashboard." },
  { icon: FiCreditCard, title: "2. Add Funds", text: "Fund your wallet with one of the available payment options." },
  { icon: FiShoppingBag, title: "3. Pick Accounts", text: "Browse ready-made accounts, pages, and premium logins." },
  { icon: FiPackage, title: "4. Track Delivery", text: "Follow your order status and contact support when needed." },
];

const FEATURES = [
  { icon: FiGift, title: "Free to use", text: "Create an account for free and explore available marketplace categories." },
  { icon: FiCreditCard, title: "Simple payments", text: "Add funds and keep your order history organized in one buyer dashboard." },
  { icon: FiLock, title: "Secure ordering", text: "Order accounts and premium logins through a structured panel experience." },
  { icon: FiHeadphones, title: "Support when needed", text: "Get help from support whenever you need assistance with an order." },
];

// Add real customer stories here, e.g. { name: "Ada O.", text: "..." }
// The section only shows cards when this list has entries.
const STORIES = [];

const FAQS = [
  {
    q: "Why do people use DigitalMart Marketplace?",
    a: "Buyers use it as one organized place to browse social media accounts, pages, premium account logins and other account resources, with clear ordering, order tracking and support.",
  },
  {
    q: "What accounts do you sell here?",
    a: "We sell social media accounts and pages, logins of premium accounts of all sorts, and other account resources. Browse the products section above to see what is currently available.",
  },
  {
    q: "How do I place an order?",
    a: "Create a free account, fund your wallet, pick the account resource you need and pay from your wallet. You can then follow the order status from your dashboard.",
  },
  {
    q: "Can I contact support?",
    a: `Yes. Our support team is available 24/7. Reach us at ${SUPPORT_EMAIL} whenever you need help with an order.`,
  },
];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getProducts({ search, category }) {
  await connectDB();

  const filter = { isActive: true };
  if (search) {
    // Case-insensitive "contains" match. The admin form saves `title`,
    // so search both `title` and `name` to be safe.
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ title: rx }, { name: rx }];
  }
  if (category && category !== "all") {
    filter.category = category;
  }

  const [products, categories] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).lean(),
    Category.find({}).sort({ name: 1 }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    categories: JSON.parse(JSON.stringify(categories)).map((c) => c.name),
  };
}

export default async function HomePage({ searchParams }) {
  // `await` is required on Next 15 (searchParams is a Promise) and harmless on Next 14
  const params = await searchParams;
  const search = (params?.search || "").toString().trim();
  const category = (params?.category || "").toString();

  const { products, categories } = await getProducts({ search, category });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero: clean, light, no background image ── */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* faint dot-grid texture, purely decorative */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        {/* soft color glow, top center */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-100/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Fast order processing
          </span>

          <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-5xl">
            {APP_NAME}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500">
            We sell various types of accounts on our panel such as social media
            accounts and pages, logins of premium accounts of all sorts and more.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Create free account <FiArrowRight size={15} />
            </Link>
            <a
              href="#products"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Browse products
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-gray-100 pt-10">
            {STATS.map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{num}</p>
                <p className="mt-1 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 py-4 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <FiShield className="text-blue-500" size={14} /> Secure wallet ordering
          </span>
          <span className="flex items-center gap-1.5">
            <FiZap className="text-blue-500" size={14} /> Fast order processing
          </span>
          <span className="flex items-center gap-1.5">
            <FiHeadphones className="text-blue-500" size={14} /> 24/7 customer support
          </span>
        </div>
      </div>

      {/* ── Products (client component handles filter + search) ── */}
      <ShopSection products={products} categories={categories} />

      {/* ── Why choose us ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Why choose {APP_NAME}?
          </h2>
          <p className="mt-3 text-gray-500">
            A simple, secure panel for account buyers who need organized access,
            clear delivery, and dependable support.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-gray-500">
            {APP_NAME} gives buyers one easy place to browse social media
            accounts, pages, premium account logins, and other digital account
            resources with clear ordering and support.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Where to begin?</h2>
            <p className="mt-3 text-gray-500">
              Start with a free account, fund your wallet, and choose the account
              resource you need.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for account buyers ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Built for account buyers
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Success stories ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Success stories</h2>
          <p className="mt-3 text-gray-500">
            See how buyers use {APP_NAME} to source account resources faster.
          </p>

          {STORIES.length > 0 && (
            <div className="mt-10 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
              {STORIES.map((s) => (
                <figure key={s.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <blockquote className="text-sm leading-relaxed text-gray-600">{s.text}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-gray-900">{s.name}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Popular questions about {APP_NAME}
            </h2>
            <p className="mt-3 text-gray-500">
              We picked some common questions and answered them below.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <FiChevronDown className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Need help? Contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-blue-600 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}