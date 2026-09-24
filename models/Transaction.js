import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["FUND", "PURCHASE", "REFUND", "ADMIN_ADJUST"],
      required: true,
    },
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    method: { type: String, default: "manual" }, // manual, paystack, flutterwave...
    note: { type: String, default: "" },
    balanceAfter: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
