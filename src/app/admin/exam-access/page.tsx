"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminAlert,
  AdminFieldGroup,
  AdminLoadingState,
  AdminStatusBadge,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
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
  return <AdminStatusBadge label={active ? "Active" : "Inactive"} tone={active ? "green" : "red"} />;
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
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Exam Access Catalog" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <header className="admin-header mb-6">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <p className="admin-eyebrow">Admin</p>
                  <h1 className="admin-page-title mt-1">Exam Access Catalog</h1>
                  <p className="admin-body mt-2 max-w-4xl">
                    Manage the exam products that billing plans can sell. Future exams should be added here before creating prices or checkout mappings.
                  </p>
                </div>
                <div className="admin-header-actions">
                  <Link href="/admin/billing" className="admin-button-secondary">Billing Configuration</Link>
                </div>
              </div>
            </header>

            {notice && (
              <div className="mb-4">
                <AdminAlert tone="success">{notice}</AdminAlert>
              </div>
            )}
            {error && (
              <div className="mb-4">
                <AdminAlert tone="error">{error}</AdminAlert>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.55fr)]">
              <section className="admin-table-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
                  <div>
                    <h2 className="admin-section-title">Exam Products</h2>
                    <p className="admin-helper">These products become the source list for exam-based access plans.</p>
                  </div>
                  <button type="button" onClick={() => void loadProducts()} className="admin-button-secondary px-3 py-2 text-sm">Refresh</button>
                </div>

                {loading ? (
                  <div className="flex justify-center p-5">
                    <AdminLoadingState
                      title="Loading exam access catalog"
                      description="Preparing exam products for billing and access management."
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="admin-table">
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
                            <AdminTableCell>
                              <p className="font-semibold text-gray-950">{product.name}</p>
                              <p className="mt-1 text-xs text-gray-500">{product.examId}</p>
                              <p className="mt-2 max-w-xl text-sm text-gray-600">{product.shortDescription || product.description || "No description set."}</p>
                            </AdminTableCell>
                            <AdminTableCell>{product.category}</AdminTableCell>
                            <AdminTableCell>{product.previewEnabled ? `${product.previewPercentage ?? 20}% of questions` : "Off"}</AdminTableCell>
                            <AdminTableCell>
                              <p>{formatDate(product.updatedAt)}</p>
                              <p className="mt-1 text-xs text-gray-500">Created {formatDate(product.createdAt)}</p>
                            </AdminTableCell>
                            <AdminTableCell><StatusPill active={product.active} /></AdminTableCell>
                            <AdminTableCell>
                              <button type="button" onClick={() => editProduct(product)} className="admin-button-secondary px-3 py-1.5 text-xs">Edit</button>
                            </AdminTableCell>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="admin-card p-5">
                <h2 className="admin-section-title">{editingId ? "Edit Exam Product" : "Add Exam Product"}</h2>
                <p className="admin-helper mt-1">
                  Use readable names and stable IDs. The ID becomes the billing relationship key.
                </p>
                <form onSubmit={(event) => void submitProduct(event)} className="mt-5 grid gap-4">
                  <AdminFieldGroup label="Exam ID">
                    <input
                      value={form.examId}
                      disabled={Boolean(editingId)}
                      onChange={(event) => setForm({ ...form, examId: event.target.value })}
                      className="admin-field"
                      placeholder="ati_teas_7"
                    />
                  </AdminFieldGroup>
                  <AdminFieldGroup label="Name">
                    <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-field" placeholder="ATI TEAS 7" />
                  </AdminFieldGroup>
                  <AdminFieldGroup label="Category">
                    <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="admin-field" placeholder="Nursing Entrance Exams" />
                  </AdminFieldGroup>
                  <AdminFieldGroup label="Short Description">
                    <input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className="admin-field" />
                  </AdminFieldGroup>
                  <AdminFieldGroup label="Description">
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="admin-field" />
                  </AdminFieldGroup>
                  <AdminFieldGroup
                    label="Preview Percentage"
                    helper="The preview question count should be calculated from this percentage and the exam's total questions."
                  >
                    <input value={form.previewPercentage} onChange={(event) => setForm({ ...form, previewPercentage: event.target.value })} className="admin-field" />
                  </AdminFieldGroup>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.previewEnabled} onChange={(event) => setForm({ ...form, previewEnabled: event.target.checked })} />
                    Free preview enabled
                  </label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button type="submit" disabled={saving} className="admin-button-primary">{saving ? "Saving..." : editingId ? "Save Changes" : "Add Exam"}</button>
                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="admin-button-secondary">
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
