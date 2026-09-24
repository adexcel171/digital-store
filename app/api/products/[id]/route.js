import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/session";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const GET = withErrorHandler(async function GET(_req, { params }) {
  await connectDB();
  const product = await Product.findById(params.id).lean();
  if (!product) return apiError("Product not found.", 404);
  return apiSuccess({ product });
});

export const PUT = withErrorHandler(async function PUT(req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return apiError("Not authorized.", 403);
  }

  await connectDB();
  const body = await req.json();

  const existing = await Product.findById(params.id);
  if (!existing) return apiError("Product not found.", 404);

  if (body.category) {
    const categoryExists = await Category.findOne({ name: body.category.trim() });
    if (!categoryExists) {
      return apiError(
        "That category doesn't exist. Please create it first from Admin -> Categories.",
        400
      );
    }
  }

  if (body.price !== undefined) {
    const numericPrice = Number(body.price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return apiError("Price must be a valid non-negative number.", 400);
    }
    body.price = numericPrice;
  }

  // If the image is being replaced, clean up the old Cloudinary asset.
  if (
    body.imagePublicId !== undefined &&
    existing.imagePublicId &&
    existing.imagePublicId !== body.imagePublicId
  ) {
    await deleteFromCloudinary(existing.imagePublicId);
  }

  const product = await Product.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  });

  return apiSuccess({ product });
});

export const DELETE = withErrorHandler(async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return apiError("Not authorized.", 403);
  }

  await connectDB();
  const product = await Product.findByIdAndDelete(params.id);

  if (!product) return apiError("Product not found.", 404);

  if (product.imagePublicId) {
    await deleteFromCloudinary(product.imagePublicId);
  }

  return apiSuccess({ message: "Product deleted." });
});
