import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";

export const GET = withErrorHandler(async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Please log in first.", 401);

  await connectDB();
  const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean();
  return apiSuccess({ orders });
});

export const POST = withErrorHandler(async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Please log in first.", 401);

  const { items } = await req.json(); // [{ productId, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    return apiError("Cart is empty.", 400);
  }

  // Basic shape validation before we touch the database.
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return apiError("Invalid cart item.", 400);
    }
  }

  await connectDB();

  const session = await mongoose.startSession();

  try {
    let orderResult;
    let walletBalanceAfter;

    await session.withTransaction(async () => {
      const productIds = items.map((i) => i.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).session(session);

      if (products.length !== new Set(productIds).size) {
        throw new HandledError(
          "One or more products are no longer available.",
          400
        );
      }

      let total = 0;
      const orderItems = [];

      // Reserve stock atomically per item so two simultaneous checkouts
      // can never both succeed against the same limited stock.
      for (const item of items) {
        const product = products.find((p) => p._id.toString() === item.productId);
        const quantity = item.quantity;

        if (product.stock !== -1) {
          const updated = await Product.findOneAndUpdate(
            { _id: product._id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { session, new: true }
          );
          if (!updated) {
            throw new HandledError(
              `"${product.title}" doesn't have enough stock left.`,
              409
            );
          }
        }

        total += product.price * quantity;
        orderItems.push({
          product: product._id,
          title: product.title,
          price: product.price,
          quantity,
          fileUrl: product.fileUrl,
        });
      }

      // Atomically debit the wallet only if the balance is sufficient at
      // the moment of the write — this is what actually prevents a race
      // condition between two concurrent checkout requests.
      const debitedUser = await User.findOneAndUpdate(
        { _id: user.id, walletBalance: { $gte: total } },
        { $inc: { walletBalance: -total } },
        { session, new: true }
      );

      if (!debitedUser) {
        throw new HandledError(
          "Insufficient wallet balance. Please fund your wallet.",
          402
        );
      }

      const reference = `ORD-${nanoid(10).toUpperCase()}`;

      const [order] = await Order.create(
        [
          {
            user: debitedUser._id,
            items: orderItems,
            total,
            reference,
          },
        ],
        { session }
      );

      await Transaction.create(
        [
          {
            user: debitedUser._id,
            type: "PURCHASE",
            amount: total,
            reference,
            status: "SUCCESS",
            method: "wallet",
            note: `Purchase of ${orderItems.length} item(s)`,
            balanceAfter: debitedUser.walletBalance,
          },
        ],
        { session }
      );

      orderResult = order;
      walletBalanceAfter = debitedUser.walletBalance;
    });

    return apiSuccess({
      message: "Purchase successful.",
      order: orderResult,
      walletBalance: walletBalanceAfter,
    });
  } catch (err) {
    if (err instanceof HandledError) {
      return apiError(err.message, err.status);
    }
    throw err; // let withErrorHandler log + return a generic 500
  } finally {
    await session.endSession();
  }
});

// Lets us throw a specific, user-facing error from inside the transaction
// callback and still distinguish it from a genuine unexpected failure.
class HandledError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
