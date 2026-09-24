import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  await connectDB();
  const transactions = await Transaction.find({ user: user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ transactions });
}
