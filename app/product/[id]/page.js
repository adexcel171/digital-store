import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import AddToCartPanel from "@/components/AddToCartPanel";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getProduct(id) {
  await connectDB();
  const product = await Product.findById(id).lean().catch(() => null);
  if (!product || !product.isActive) return null;
  const related = await Product.find({
    _id: { $ne: id },
    category: product.category,
    isActive: true,
  })
    .limit(4)
    .lean();
  return {
    product: JSON.parse(JSON.stringify(product)),
    related: JSON.parse(JSON.stringify(related)),
  };
}

export default async function ProductPage({ params }) {
  const data = await getProduct(params.id);
  if (!data) return notFound();

  const { product, related } = data;

  return (
    <div className="container-app py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl2 bg-slate-100">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              No image
            </div>
          )}
        </div>

        <div>
          <span className="badge bg-brand-50 text-brand-700">{product.category}</span>
          <h1 className="mt-3 text-3xl font-extrabold text-ink-900">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-brand-700">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-6 whitespace-pre-line text-slate-600">{product.description}</p>

          <AddToCartPanel product={product} />

          <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Digital product — delivered instantly to your account after purchase.
            No shipping required.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-ink-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
