import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Verifies a funding transaction directly with Paystack (server-to-server)
// and only credits the wallet if Paystack confirms the payment succeeded.
// Never trust a "success" status coming from the client/browser alone.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Paystack is not configured. Add PAYSTACK_SECRET_KEY to your .env.local file.",
      },
      { status: 500 }
    );
  }

  const { reference } = await req.json();
  if (!reference) {
    return NextResponse.json({ error: "Reference is required." }, { status: 400 });
  }

  await connectDB();

  const transaction = await Transaction.findOne({ reference, user: user.id });
  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  // Already processed — don't credit twice (avoids double-crediting on refresh/retry).
  if (transaction.status === "SUCCESS") {
    const dbUser = await User.findById(user.id);
    return NextResponse.json({
      message: "Already confirmed.",
      walletBalance: dbUser.walletBalance,
      transaction,
    });
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status) {
      return NextResponse.json(
        { error: verifyData.message || "Could not verify transaction with Paystack." },
        { status: 502 }
      );
    }

    const paystackTx = verifyData.data;

    if (paystackTx.status !== "success") {
      transaction.status = "FAILED";
      await transaction.save();
      return NextResponse.json(
        { error: `Payment was not successful (status: ${paystackTx.status}).` },
        { status: 400 }
      );
    }

    // Confirm the amount Paystack actually received matches what we expect,
    // so a tampered client request can't credit an arbitrary amount.
    const expectedKobo = Math.round(transaction.amount * 100);
    if (paystackTx.amount !== expectedKobo) {
      transaction.status = "FAILED";
      transaction.note = "Amount mismatch during verification.";
      await transaction.save();
      return NextResponse.json(
        { error: "Amount mismatch detected. Transaction flagged and not credited." },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user.id);
    dbUser.walletBalance += transaction.amount;
    await dbUser.save();

    transaction.status = "SUCCESS";
    transaction.balanceAfter = dbUser.walletBalance;
    transaction.note = `Paystack ref: ${paystackTx.reference}, channel: ${paystackTx.channel}`;
    await transaction.save();

    return NextResponse.json({
      message: "Wallet funded successfully.",
      walletBalance: dbUser.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return NextResponse.json(
      { error: "Could not reach Paystack to verify payment. Please try again." },
      { status: 502 }
    );
  }
}
