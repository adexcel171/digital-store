import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initializes a wallet funding transaction with Paystack.
// Returns an `authorization_url` that the client redirects the user to,
// where they enter their card/bank details on Paystack's own secure page.
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

  const { amount } = await req.json();
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid amount to fund." },
      { status: 400 }
    );
  }

  await connectDB();

  const dbUser = await User.findById(user.id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const reference = `FUND-${nanoid(10).toUpperCase()}`;

  // Create a PENDING record first so we have something to reconcile
  // against even if the user closes the Paystack tab before paying.
  await Transaction.create({
    user: user.id,
    type: "FUND",
    amount: numericAmount,
    reference,
    status: "PENDING",
    method: "paystack",
  });

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: dbUser.email,
          amount: Math.round(numericAmount * 100), // Paystack expects kobo (amount x 100)
          reference,
          callback_url: `${appUrl}/wallet/callback`,
          metadata: {
            userId: dbUser._id.toString(),
            purpose: "wallet_funding",
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      await Transaction.findOneAndUpdate({ reference }, { status: "FAILED" });
      return NextResponse.json(
        { error: paystackData.message || "Could not start payment with Paystack." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "Redirecting to Paystack...",
      reference,
      authorizationUrl: paystackData.data.authorization_url,
    });
  } catch (err) {
    console.error("Paystack init error:", err);
    await Transaction.findOneAndUpdate({ reference }, { status: "FAILED" });
    return NextResponse.json(
      { error: "Could not reach Paystack. Please try again." },
      { status: 502 }
    );
  }
}
