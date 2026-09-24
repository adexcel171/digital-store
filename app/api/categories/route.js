import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/session";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const GET = withErrorHandler(async function GET() {
  await connectDB();
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  return apiSuccess({ categories });
});

export const POST = withErrorHandler(async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return apiError("Not authorized.", 403);
  }

  const { name } = await req.json();
  const trimmedName = (name || "").trim();

  if (!trimmedName) {
    return apiError("Category name is required.", 400);
  }
  if (trimmedName.length > 50) {
    return apiError("Category name must be 50 characters or fewer.", 400);
  }

  await connectDB();

  const existing = await Category.findOne({
    name: { $regex: `^${trimmedName}$`, $options: "i" },
  });
  if (existing) {
    return apiError("This category already exists.", 409);
  }

  const category = await Category.create({ name: trimmedName });
  return apiSuccess({ category }, { status: 201 });
});
