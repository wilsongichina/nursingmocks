"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { ExamAccessProduct } from "@/lib/billing/models";

type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | null ? string | null : T[K];
};

type ExamAccessResponse = {
  products: Serialized<ExamAccessProduct>[];
};

type ProductForm = {
  examId: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  active: boolean;
  previewEnabled: boolean;
  previewPercentage: string;
};

const initialForm: ProductForm = {
  examId: "",
  name: "",
  category: "",
  shortDescription: "",
  description: "",
  active: true,
  previewEnabled: true,
  previewPercentage: "20",
};

function productToForm(product: Serialized<ExamAccessProduct>): ProductForm {
  return {
    examId: product.examId,
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    active: product.active,
    previewEnabled: product.previewEnabled,
    previewPercentage: String(product.previewPercentage ?? 20),
  };
}

function StatusPill({ active }: { active: boolean }) {
  return <span className={`user-pill ${active ? "user-pill-green" : "border-gray-200 bg-gray-50 text-gray-700"}`}>{active ? "Active" : "Inactive"}</span>;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function AdminExamAccessContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Serialized<ExamAccessProduct>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/exam-access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as Partial<ExamAccessResponse> & { error?: string };
      if (!response.ok || !data.products) throw new Error(data.error || "Could not load exam access catalog");
      setProducts(data.products);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load exam access catalog");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const token = await currentUser.getIdToken();
      const payload = {
        name: form.name,
        category: form.category,
        shortDescription: form.shortDescription,
        description: form.description,
        active: form.active,
        previewEnabled: form.previewEnabled,
        previewPercentage: form.previewPercentage,
      };
      const response = await fetch("/api/admin/exam-access", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { examId: editingId, patch: payload }
            : { product: { ...payload, examId: form.examId } }
        ),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save exam access product");
      setNotice(editingId ? "Exam access product updated." : "Exam access product created.");
      setEditingId(null);
      setForm(initialForm);
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save exam access product");
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product: Serialized<ExamAccessProduct>) {
    setEditingId(product.examId);
    setForm(productToForm(product));
    setNotice(null);
    setError(null);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">Admin Dashboard</Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Exam Access Catalog</span>
            </div>
            {currentUser && <UserProfileBadge />}
          </div>
        </div>

        <main className="user-page min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full">
            <header className="user-page-header mb-6">
              <div className="user-page-header-row">
                <div className="user-page-header-copy">
                  <p className="user-eyebrow">Admin</p>
                  <h1 className="user-page-title mt-1">Exam Access Catalog</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Manage the exam products that billing plans can sell. Future exams should be added here before creating prices or checkout mappings.
                  </p>
                </div>
                <div className="user-page-header-actions">
                  <Link href="/admin/billing" className="user-button-secondary">Billing Configuration</Link>
                </div>
              </div>
            </header>

            {notice && <div className="user-alert user-alert-success mb-4"><span className="user-alert-icon" aria-hidden="true">!</span><p>{notice}</p></div>}
            {error && <div className="user-alert user-alert-error mb-4"><span className="user-alert-icon" aria-hidden="true">!</span><p>{error}</p></div>}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.55fr)]">
              <section className="user-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                  <div>
                    <h2 className="user-section-title">Exam Products</h2>
                    <p className="user-helper">These products become the source list for exam-based access plans.</p>
                  </div>
                  <button type="button" onClick={() => void loadProducts()} className="user-button-secondary px-3 py-2 text-sm">Refresh</button>
                </div>

                {loading ? (
                  <div className="grid gap-3 p-5">
                    <div className="user-skeleton h-5 w-1/2" />
                    <div className="user-skeleton h-16 w-full" />
                    <div className="user-skeleton h-16 w-full" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-3">Exam</th>
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3">Preview</th>
                          <th className="px-5 py-3">Updated</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {products.map((product) => (
                          <tr key={product.examId} className="align-top">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-950">{product.name}</p>
                              <p className="mt-1 text-xs text-gray-500">{product.examId}</p>
                              <p className="mt-2 max-w-xl text-sm text-gray-600">{product.shortDescription || product.description || "No description set."}</p>
                            </td>
                            <td className="px-5 py-4 text-gray-700">{product.category}</td>
                            <td className="px-5 py-4 text-gray-700">{product.previewEnabled ? `${product.previewPercentage ?? 20}% of questions` : "Off"}</td>
                            <td className="px-5 py-4 text-gray-700">
                              <p>{formatDate(product.updatedAt)}</p>
                              <p className="mt-1 text-xs text-gray-500">Created {formatDate(product.createdAt)}</p>
                            </td>
                            <td className="px-5 py-4"><StatusPill active={product.active} /></td>
                            <td className="px-5 py-4">
                              <button type="button" onClick={() => editProduct(product)} className="user-button-secondary px-3 py-1.5 text-xs">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="user-card p-5">
                <h2 className="user-section-title">{editingId ? "Edit Exam Product" : "Add Exam Product"}</h2>
                <p className="user-helper mt-1">
                  Use readable names and stable IDs. The ID becomes the billing relationship key.
                </p>
                <form onSubmit={(event) => void submitProduct(event)} className="mt-5 grid gap-4">
                  <label className="grid gap-1">
                    <span className="user-label">Exam ID</span>
                    <input
                      value={form.examId}
                      disabled={Boolean(editingId)}
                      onChange={(event) => setForm({ ...form, examId: event.target.value })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                      placeholder="ati_teas_7"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="user-label">Name</span>
                    <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="ATI TEAS 7" />
                  </label>
                  <label className="grid gap-1">
                    <span className="user-label">Category</span>
                    <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="Nursing Entrance Exams" />
                  </label>
                  <label className="grid gap-1">
                    <span className="user-label">Short Description</span>
                    <input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                  </label>
                  <label className="grid gap-1">
                    <span className="user-label">Description</span>
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                  </label>
                  <div className="grid gap-2">
                    <label className="grid gap-1">
                      <span className="user-label">Preview Percentage</span>
                      <input value={form.previewPercentage} onChange={(event) => setForm({ ...form, previewPercentage: event.target.value })} className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
                    </label>
                    <p className="user-helper">The preview question count should be calculated from this percentage and the exam&apos;s total questions.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.previewEnabled} onChange={(event) => setForm({ ...form, previewEnabled: event.target.checked })} />
                    Free preview enabled
                  </label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button type="submit" disabled={saving} className="user-button-primary">{saving ? "Saving..." : editingId ? "Save Changes" : "Add Exam"}</button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="user-button-secondary">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminExamAccessPage() {
  return (
    <SidebarProvider>
      <AdminExamAccessContent />
    </SidebarProvider>
  );
}
