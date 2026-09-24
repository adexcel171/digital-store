import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import Order from "@/models/Order";
import User from "@/models/User";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await connectDB();

  const [productCount, userCount, orderCount, successfulFundings, orders] =
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Transaction.find({ type: "FUND", status: "SUCCESS" }).lean(),
      Order.find({}).lean(),
    ]);

  const totalFunded = successfulFundings.reduce((sum, t) => sum + t.amount, 0);
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  return NextResponse.json({
    productCount,
    userCount,
    orderCount,
    totalFunded,
    totalSales,
  });
}
