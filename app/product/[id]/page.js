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
  const { id } = await params; // works on Next 14 and 15+
  const data = await getProduct(id);
  if (!data) return notFound();

  const { product, related } = data;

  return (
    <div className="container-app py-6 sm:py-10">
      <div>
        {/* top row: image + title/price side by side at every size */}
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-36 lg:h-44 lg:w-44">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(min-width:1024px) 176px, (min-width:640px) 144px, 96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-300">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="badge bg-brand-50 text-brand-700">{product.category}</span>
            <h1 className="mt-2 text-xl font-extrabold leading-tight text-ink-900 sm:text-2xl lg:text-3xl">
              {product.title}
            </h1>
            <p className="mt-2 text-xl font-bold text-brand-700 sm:text-2xl">
              {formatCurrency(product.price)}
            </p>
          </div>
        </div>

        {/* full-width content below */}
        <div className="mt-6 max-w-3xl">
          <p className="whitespace-pre-line text-slate-600">{product.description}</p>

          <AddToCartPanel product={product} />

          <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Digital product — delivered instantly to your account after purchase.
            No shipping required.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl font-bold text-ink-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}