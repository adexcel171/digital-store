import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const POST = withErrorHandler(async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return apiError("Token and new password are required.", 400);
  }
  if (password.length < 6) {
    return apiError("Password must be at least 6 characters.", 400);
  }

  await connectDB();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) {
    return apiError(
      "This reset link is invalid or has expired. Please request a new one.",
      400
    );
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  await user.save();

  return apiSuccess({ message: "Password reset successfully. You can now log in." });
});
