import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  fileUrl: String,
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PAID", "CANCELLED"],
      default: "PAID",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
