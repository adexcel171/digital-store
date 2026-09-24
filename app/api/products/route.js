import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/session";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const GET = withErrorHandler(async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const admin = searchParams.get("admin"); // if "1", admin listing (includes inactive)

  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search) filter.title = { $regex: search.trim(), $options: "i" };
  if (admin !== "1") filter.isActive = true;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return apiSuccess({ products });
});

export const POST = withErrorHandler(async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return apiError("Not authorized.", 403);
  }

  await connectDB();
  const body = await req.json();
  const {
    title,
    description,
    price,
    category,
    image,
    imagePublicId,
    fileUrl,
    stock,
  } = body;

  const trimmedTitle = (title || "").trim();
  const trimmedDescription = (description || "").trim();
  const trimmedCategory = (category || "").trim();

  if (!trimmedTitle || !trimmedDescription || !trimmedCategory) {
    return apiError("Title, description and category are required.", 400);
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return apiError("Price must be a valid non-negative number.", 400);
  }

  const categoryExists = await Category.findOne({ name: trimmedCategory });
  if (!categoryExists) {
    return apiError(
      "That category doesn't exist. Please create it first from Admin -> Categories.",
      400
    );
  }

  const product = await Product.create({
    title: trimmedTitle,
    description: trimmedDescription,
    price: numericPrice,
    category: trimmedCategory,
    image: image || "",
    imagePublicId: imagePublicId || "",
    fileUrl: fileUrl || "",
    stock: stock === undefined || stock === null || stock === "" ? -1 : Number(stock),
    createdBy: user.id,
  });

  return apiSuccess({ product }, { status: 201 });
});
