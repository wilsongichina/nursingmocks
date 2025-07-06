import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "teasgurus2024"; // In production, this should be in environment variables

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password",
        },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 }
    );
  }
}
