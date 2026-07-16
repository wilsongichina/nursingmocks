import { NextRequest, NextResponse } from "next/server";
import { createAdminAuditRequestId, listAdminAuditLogs, readRequestMetadata, writeAdminAuditLog } from "@/lib/admin/audit";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const requestId = createAdminAuditRequestId("audit_view");

  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "50");
    const logs = await listAdminAuditLogs({
      limit: Number.isFinite(limit) ? limit : 50,
      action: url.searchParams.get("action") || undefined,
      targetUid: url.searchParams.get("targetUid") || undefined,
      actorUid: url.searchParams.get("actorUid") || undefined,
    });

    await writeAdminAuditLog({
      action: "admin.audit.view",
      actor: decoded,
      requestId,
      reason: "Viewed admin audit logs",
      ...readRequestMetadata(request.headers),
    });

    return NextResponse.json({ logs, requestId });
  } catch (error) {
    console.error("Admin audit log list failed", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load audit logs", requestId }, { status: 403 });
  }
}
