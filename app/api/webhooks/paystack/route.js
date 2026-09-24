import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Paystack calls this URL directly (server-to-server) whenever a payment
// event happens, independent of whether the user's browser makes it back
// to /wallet/callback. This is the reliable path for production.
//
// Set this URL in Paystack Dashboard -> Settings -> API Keys & Webhooks:
//   https://yourdomain.com/api/webhooks/paystack
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!PAYSTACK_SECRET_KEY) {
    console.error("Paystack webhook received but PAYSTACK_SECRET_KEY is not set.");
    return NextResponse.json({ received: true });
  }

  // Verify the request genuinely came from Paystack before trusting it.
  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, amount, status, metadata } = event.data;

    await connectDB();

    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      // Unknown reference — ignore silently (could be a stray/test event).
      return NextResponse.json({ received: true });
    }

    if (transaction.status === "SUCCESS") {
      // Already credited (likely via the browser callback) — avoid double credit.
      return NextResponse.json({ received: true });
    }

    const expectedKobo = Math.round(transaction.amount * 100);
    if (status !== "success" || amount !== expectedKobo) {
      transaction.status = "FAILED";
      await transaction.save();
      return NextResponse.json({ received: true });
    }

    const dbUser = await User.findById(transaction.user);
    if (dbUser) {
      dbUser.walletBalance += transaction.amount;
      await dbUser.save();

      transaction.status = "SUCCESS";
      transaction.balanceAfter = dbUser.walletBalance;
      transaction.note = `Credited via webhook. Paystack ref: ${reference}`;
      await transaction.save();
    }
  }

  return NextResponse.json({ received: true });
}
