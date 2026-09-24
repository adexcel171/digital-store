import { requireAdmin } from "@/lib/session";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const POST = withErrorHandler(async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return apiError("Not authorized.", 403);

  const formData = await req.formData();
  const file = formData.get("file");
  const previousPublicId = formData.get("previousPublicId"); // optional, to replace an old image

  if (!file || typeof file === "string") {
    return apiError("No file was uploaded.", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError("Only JPEG, PNG, WEBP or GIF images are allowed.", 400);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return apiError("Image must be smaller than 5MB.", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await uploadBufferToCloudinary(buffer, {
    // Keep uploads reasonably sized and web-optimized.
    transformation: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto" }],
  });

  // Clean up the previous image (if replacing one) so we don't accumulate orphaned assets.
  if (previousPublicId) {
    await deleteFromCloudinary(previousPublicId);
  }

  return apiSuccess({
    url: result.secure_url,
    publicId: result.public_id,
  });
});
