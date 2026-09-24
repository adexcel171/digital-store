import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/session";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const DELETE = withErrorHandler(async function DELETE(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Not authorized.", 403);

  await connectDB();

  const category = await Category.findById(params.id);
  if (!category) return apiError("Category not found.", 404);

  const productsUsingCategory = await Product.countDocuments({
    category: category.name,
  });

  if (productsUsingCategory > 0) {
    return apiError(
      `Cannot delete "${category.name}" — ${productsUsingCategory} product(s) still use it. Reassign or delete those products first.`,
      409
    );
  }

  await category.deleteOne();
  return apiSuccess({ message: "Category deleted." });
});
