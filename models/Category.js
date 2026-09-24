import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

CategorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
