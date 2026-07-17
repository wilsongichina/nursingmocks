import { NextRequest, NextResponse } from "next/server";
import {
  createAdminExamAccessProduct,
  getAdminExamAccessProducts,
  updateAdminExamAccessProduct,
} from "@/lib/admin/exam-access";
import { requireAdminFromAuthorizationHeader } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const products = await getAdminExamAccessProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin exam access catalog load failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not load exam access catalog" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const result = await createAdminExamAccessProduct(body?.product ?? {}, decoded.uid);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Admin exam access catalog create failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create exam access product" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await requireAdminFromAuthorizationHeader(request.headers.get("authorization"));
    const body = await request.json();
    const result = await updateAdminExamAccessProduct(String(body?.examId ?? ""), body?.patch ?? {}, decoded.uid);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin exam access catalog update failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update exam access product" },
      { status: 400 }
    );
  }
}
