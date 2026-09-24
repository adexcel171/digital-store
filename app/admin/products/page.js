"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBox, FiUploadCloud, FiLoader } from "react-icons/fi";
import { formatCurrency } from "@/lib/format";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  image: "",
  imagePublicId: "",
  fileUrl: "",
  stock: -1,
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?admin=1");
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?.name || "" });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image || "",
      imagePublicId: product.imagePublicId || "",
      fileUrl: product.fileUrl || "",
      stock: product.stock,
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (form.imagePublicId) {
        formData.append("previousPublicId", form.imagePublicId);
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Image upload failed.");
        return;
      }

      setForm((f) => ({ ...f, image: data.url, imagePublicId: data.publicId }));
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      toast.error("Please select a category. Create one first if the list is empty.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const res = await fetch(
        editing ? `/api/products/${editing._id}` : "/api/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not save product.");
        return;
      }

      toast.success(editing ? "Product updated." : "Product created.");
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not delete product.");
        return;
      }
      toast.success("Product deleted.");
      loadProducts();
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, update or remove digital products from your store.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus size={16} /> Add product
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          You have no categories yet. Go to{" "}
          <a href="/admin/categories" className="font-semibold underline">
            Admin → Categories
          </a>{" "}
          to create one before adding products.
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FiBox size={36} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No products yet. Add your first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.image && (
                          <Image src={p.image} alt={p.title} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-ink-900">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{p.category}</td>
                  <td className="p-4 font-semibold text-ink-900">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`badge ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 text-ink-600 hover:bg-slate-100"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">
                {editing ? "Edit product" : "Add product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price ({process.env.NEXT_PUBLIC_CURRENCY || "NGN"})</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    required
                    value={form.category}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Product image</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                    {form.image ? (
                      <Image src={form.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <FiBox size={22} />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="hidden"
                      id="product-image-input"
                    />
                    <label
                      htmlFor="product-image-input"
                      className="btn-secondary cursor-pointer !py-2 !px-3 text-xs"
                    >
                      {uploading ? (
                        <>
                          <FiLoader className="animate-spin" size={14} /> Uploading...
                        </>
                      ) : (
                        <>
                          <FiUploadCloud size={14} /> {form.image ? "Replace image" : "Upload image"}
                        </>
                      )}
                    </label>
                    <p className="mt-1.5 text-xs text-slate-400">JPEG, PNG, WEBP or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Delivery / file URL</label>
                <input
                  name="fileUrl"
                  value={form.fileUrl}
                  onChange={handleChange}
                  placeholder="Link shown to buyers after purchase"
                  className="input"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="text-sm text-ink-700">
                  Visible in store
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn-primary flex-1"
                >
                  {saving ? "Saving..." : editing ? "Update product" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
