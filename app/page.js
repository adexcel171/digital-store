import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopSection from "@/components/ShopSection";
import { FiZap, FiShield, FiDownload, FiStar } from "react-icons/fi";

export const dynamic = "force-dynamic";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getProducts({ search, category }) {
  await connectDB();

  const filter = { isActive: true };
  if (search) {
    // Case-insensitive "contains" match on the product name
    filter.name = { $regex: escapeRegex(search), $options: "i" };
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#2563eb18,transparent)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Instant digital delivery
          </span>

          <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl">
            The smartest way to buy digital products
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Fund your wallet once. Buy ebooks, courses, software keys, and
            templates in one click — no card required at checkout.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#products"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Browse products
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              How it works
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-10 border-t border-white/5 pt-10">
            {[
              { num: "4,200+", label: "Products" },
              { num: "18k", label: "Happy buyers" },
              { num: "Instant", label: "Delivery" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6 py-4 text-xs font-medium text-gray-400">
          <span className="flex items-center gap-1.5">
            <FiShield className="text-blue-500" size={14} /> Secure wallet payments
          </span>
          <span className="flex items-center gap-1.5">
            <FiDownload className="text-blue-500" size={14} /> Instant access after purchase
          </span>
          <span className="flex items-center gap-1.5">
            <FiZap className="text-blue-500" size={14} /> No card needed at checkout
          </span>
          <span className="flex items-center gap-1.5">
            <FiStar className="text-blue-500" size={14} /> Verified creators
          </span>
        </div>
      </div>

      {/* ── Products (client component handles filter + search) ── */}
      <ShopSection products={products} categories={categories} />

    </div>
  );
}