import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" }, // Cloudinary public_id, used to delete old images
    fileUrl: { type: String, default: "" }, // link/instructions delivered after purchase
    stock: { type: Number, default: -1 }, // -1 = unlimited (digital)
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
