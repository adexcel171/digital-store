import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "DigitalMart <onboarding@resend.dev>";

let resendClient = null;

function getResendClient() {
  if (!RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your .env.local file to send emails."
    );
  }
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const resend = getResendClient();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
      <h2 style="margin: 0 0 16px;">Reset your password</h2>
      <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
        Hi ${escapeHtml(name || "there")},<br /><br />
        We received a request to reset the password for your account. Click the button below to choose a new password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; margin: 8px 0 20px;">
        Reset password
      </a>
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px;">
        If you didn't request this, you can safely ignore this email — your password will not be changed.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Reset your password",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send password reset email.");
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
