"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminAlert,
  AdminInfoTile,
  AdminStatusBadge,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

function Field({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  return (
    <AdminInfoTile label={label}>
      <span className="break-words">
        {value === null || value === undefined || value === "" ? "Not available" : String(value)}
      </span>
    </AdminInfoTile>
  );
}

function AdminProfileContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const providerIds = currentUser?.providerData.map((provider) => provider.providerId).filter(Boolean).join(", ") || null;
  const displayName = currentUser?.displayName || currentUser?.email || "Admin";

  useEffect(() => {
    setDisplayNameInput(currentUser?.displayName || "");
  }, [currentUser?.displayName]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: displayNameInput }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update admin profile");

      await currentUser.reload();
      setMessage({ tone: "success", text: "Admin display name updated and audit log recorded." });
    } catch (profileError) {
      setMessage({
        tone: "error",
        text: profileError instanceof Error ? profileError.message : "Could not update admin profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Admin Profile" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <header className="admin-header mb-6">
              <div className="admin-header-row">
                <div className="admin-header-copy">
                  <p className="admin-eyebrow">Admin</p>
                  <h1 className="admin-page-title mt-1">Admin Profile</h1>
                  <p className="admin-body mt-2 max-w-4xl">
                    Review the signed-in admin identity used for this workspace. Profile data is shared with Firebase Auth, while admin tools stay separate from the customer profile page.
                  </p>
                </div>
              </div>
            </header>

            <section className="admin-card mb-6 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="admin-section-title">{displayName}</h2>
                    <p className="admin-helper mt-1">{currentUser?.email || "No email"}</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-400">{currentUser?.uid || "No UID"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge label="Admin Workspace" tone="purple" />
                  <AdminStatusBadge
                    label={currentUser?.emailVerified ? "Email Verified" : "Email Unverified"}
                    tone={currentUser?.emailVerified ? "green" : "amber"}
                  />
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-3 lg:grid-cols-3">
              <Field label="Display Name" value={currentUser?.displayName} />
              <Field label="Email" value={currentUser?.email} />
              <Field label="Provider" value={providerIds} />
              <Field label="Phone" value={currentUser?.phoneNumber} />
              <Field label="Email Verified" value={currentUser?.emailVerified} />
              <Field label="Firebase UID" value={currentUser?.uid} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="admin-card p-4">
                <h2 className="admin-section-title">Edit Admin Profile</h2>
                <p className="admin-helper mt-2">
                  Only the display name can be changed here. Email, admin claim, role, billing, entitlements, and account status remain locked.
                </p>
                <form onSubmit={submitProfile} className="mt-4 space-y-4">
                  <label className="block">
                    <span className="admin-field-label">Display Name</span>
                    <input
                      value={displayNameInput}
                      onChange={(event) => setDisplayNameInput(event.target.value)}
                      className="admin-field mt-2"
                      maxLength={80}
                      placeholder="Admin display name"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving || displayNameInput.trim().length < 2}
                    className="admin-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Display Name"}
                  </button>
                </form>
                {message && (
                  <div className="mt-4">
                    <AdminAlert tone={message.tone}>{message.text}</AdminAlert>
                  </div>
                )}
              </div>

              <div className="admin-card p-4">
                <h2 className="admin-section-title">Profile Ownership</h2>
                <p className="admin-helper mt-2">
                  Admins should share the same Firebase identity and base user document as normal users, but the admin area should use this separate admin profile view so customer-dashboard screens do not leak into admin navigation.
                </p>
              </div>
              <div className="admin-card p-4 lg:col-span-2">
                <h2 className="admin-section-title">Related Admin Tools</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/admin/users" className="admin-button-secondary px-3 py-2 text-xs">User Management</Link>
                  <Link href="/admin/audit-logs" className="admin-button-secondary px-3 py-2 text-xs">Audit Logs</Link>
                  <Link href="/admin/login-security" className="admin-button-secondary px-3 py-2 text-xs">Login Security</Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <SidebarProvider>
      <AdminProfileContent />
    </SidebarProvider>
  );
}
