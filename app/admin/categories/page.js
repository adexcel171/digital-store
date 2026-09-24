"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiTag } from "react-icons/fi";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not create category.");
        return;
      }

      toast.success("Category created.");
      setName("");
      loadCategories();
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not delete category.");
        return;
      }

      toast.success("Category deleted.");
      loadCategories();
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-900">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage the categories products can be sorted into. Create categories
        here before assigning them to products.
      </p>

      <form onSubmit={handleAdd} className="card mt-6 flex flex-wrap gap-3 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. eBooks, Courses, Templates"
          className="input flex-1"
          maxLength={50}
        />
        <button type="submit" disabled={saving} className="btn-primary">
          <FiPlus size={16} /> Add category
        </button>
      </form>

      <div className="card mt-4">
        {loading ? (
          <p className="p-6 text-sm text-slate-400">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FiTag size={36} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No categories yet. Add your first one above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-ink-900">{c.name}</p>
                  <p className="text-xs text-slate-400">/{c.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                  aria-label={`Delete ${c.name}`}
                >
                  <FiTrash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
