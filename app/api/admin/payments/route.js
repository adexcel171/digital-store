import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const transactions = await Transaction.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ transactions });
}
