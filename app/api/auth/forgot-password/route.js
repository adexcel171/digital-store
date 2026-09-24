import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const POST = withErrorHandler(async function POST(req) {
  const { email } = await req.json();
  const trimmedEmail = (email || "").trim().toLowerCase();

  if (!trimmedEmail) {
    return apiError("Email is required.", 400);
  }

  await connectDB();

  const user = await User.findOne({ email: trimmedEmail });

  // Always respond with the same generic message whether or not the
  // account exists — this prevents attackers from using this endpoint
  // to discover which emails are registered.
  const genericMessage =
    "If an account exists for that email, a password reset link has been sent.";

  if (!user) {
    return apiSuccess({ message: genericMessage });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    // Roll back the token so a broken email provider doesn't leave a
    // dangling, unusable reset request the user can never complete.
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();
    return apiError(
      "Could not send the reset email right now. Please try again shortly.",
      502
    );
  }

  return apiSuccess({ message: genericMessage });
});
