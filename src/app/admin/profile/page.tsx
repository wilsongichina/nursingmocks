"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";

function Field({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  return (
    <div className="user-detail-surface p-4">
      <p className="user-label">{label}</p>
      <p className="user-card-title mt-1 break-words">
        {value === null || value === undefined || value === "" ? "Not available" : String(value)}
      </p>
    </div>
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
        <div className="hidden h-16 border-b border-gray-200 bg-white md:block">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="font-medium transition-colors hover:text-blue-600">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin" className="font-medium transition-colors hover:text-blue-600">Admin</Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium">Admin Profile</span>
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
                  <h1 className="user-page-title mt-1">Admin Profile</h1>
                  <p className="user-body mt-2 max-w-4xl">
                    Review the signed-in admin identity used for this workspace. Profile data is shared with Firebase Auth, while admin tools stay separate from the customer profile page.
                  </p>
                </div>
              </div>
            </header>

            <section className="user-card mb-6 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="user-section-title">{displayName}</h2>
                    <p className="user-helper mt-1">{currentUser?.email || "No email"}</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-400">{currentUser?.uid || "No UID"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="user-pill user-pill-purple">Admin Workspace</span>
                  <span className={`user-pill ${currentUser?.emailVerified ? "user-pill-green" : "user-pill-amber"}`}>
                    {currentUser?.emailVerified ? "Email Verified" : "Email Unverified"}
                  </span>
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
              <div className="user-card p-4">
                <h2 className="user-section-title">Edit Admin Profile</h2>
                <p className="user-helper mt-2">
                  Only the display name can be changed here. Email, admin claim, role, billing, entitlements, and account status remain locked.
                </p>
                <form onSubmit={submitProfile} className="mt-4 space-y-4">
                  <label className="block">
                    <span className="user-label">Display Name</span>
                    <input
                      value={displayNameInput}
                      onChange={(event) => setDisplayNameInput(event.target.value)}
                      className="user-field mt-2"
                      maxLength={80}
                      placeholder="Admin display name"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving || displayNameInput.trim().length < 2}
                    className="user-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Display Name"}
                  </button>
                </form>
                {message && (
                  <div className={`mt-4 user-alert ${message.tone === "success" ? "user-alert-success" : "user-alert-error"}`} role="status">
                    <span className="user-alert-icon" aria-hidden="true">{message.tone === "success" ? "!" : "x"}</span>
                    <p className="user-helper">{message.text}</p>
                  </div>
                )}
              </div>

              <div className="user-card p-4">
                <h2 className="user-section-title">Profile Ownership</h2>
                <p className="user-helper mt-2">
                  Admins should share the same Firebase identity and base user document as normal users, but the admin area should use this separate admin profile view so customer-dashboard screens do not leak into admin navigation.
                </p>
              </div>
              <div className="user-card p-4 lg:col-span-2">
                <h2 className="user-section-title">Related Admin Tools</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/admin/users" className="user-button-secondary px-3 py-2 text-xs">User Management</Link>
                  <Link href="/admin/audit-logs" className="user-button-secondary px-3 py-2 text-xs">Audit Logs</Link>
                  <Link href="/admin/login-security" className="user-button-secondary px-3 py-2 text-xs">Login Security</Link>
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
