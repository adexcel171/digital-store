/**
 * Seed script — creates an admin account (from .env ADMIN_EMAIL / ADMIN_PASSWORD)
 * and a handful of sample digital products.
 *
 * Run with: npm run seed
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    category: String,
    image: String,
    imagePublicId: String,
    fileUrl: String,
    stock: { type: Number, default: -1 },
    isActive: { type: Boolean, default: true },
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const sampleCategories = ["eBooks", "Courses", "Templates", "Licenses"];

const sampleProducts = [
  {
    title: "Design Systems 101 (eBook)",
    description:
      "A practical guide to building and scaling design systems for product teams.",
    price: 4500,
    category: "eBooks",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    fileUrl: "https://example.com/downloads/design-systems-101",
  },
  {
    title: "Next.js Mastery Course",
    description:
      "From fundamentals to advanced patterns — build production-ready apps with Next.js.",
    price: 25000,
    category: "Courses",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    fileUrl: "https://example.com/downloads/nextjs-mastery",
  },
  {
    title: "Startup Pitch Deck Template",
    description:
      "A 20-slide, investor-ready pitch deck template in Figma and PowerPoint.",
    price: 8000,
    category: "Templates",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    fileUrl: "https://example.com/downloads/pitch-deck-template",
  },
  {
    title: "Pro Design Software License Key",
    description: "1-year single-user license for premium creative software.",
    price: 35000,
    category: "Licenses",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800",
    fileUrl: "https://example.com/downloads/license-key",
  },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await User.create({
      name: "Store Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      role: "admin",
      walletBalance: 0,
    });
    console.log(`✔ Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
    console.log(`✔ Existing user promoted to admin: ${ADMIN_EMAIL}`);
  } else {
    console.log(`ℹ Admin account already exists: ${ADMIN_EMAIL}`);
  }

  for (const name of sampleCategories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      await Category.create({ name, slug });
      console.log(`✔ Category created: ${name}`);
    }
  }

  for (const p of sampleProducts) {
    const exists = await Product.findOne({ title: p.title });
    if (!exists) {
      await Product.create({ ...p, createdBy: admin._id });
      console.log(`✔ Product created: ${p.title}`);
    }
  }

  console.log("\nSeed complete. You can now log in with:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
