import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopSection from "@/components/ShopSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace",
  description: "Browse available accounts, pages and premium logins.",
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getProducts({ search, category }) {
  await connectDB();

  const filter = { isActive: true };
  if (search) {
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

export default async function MarketplacePage({ searchParams }) {
  const params = await searchParams;
  const search = (params?.search || "").toString().trim();
  const category = (params?.category || "").toString();

  const { products, categories } = await getProducts({ search, category });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Marketplace</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Social media accounts, pages, premium logins and more. Search or pick a category to find what you need.
          </p>
        </div>
      </section>

      <div id="products">
        <ShopSection products={products} categories={categories} />
      </div>
    </div>
  );
}