import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/sendgrid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name and email" },
        { status: 400 }
      );
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Send welcome email using SendGrid
    await sendWelcomeEmail({
      name,
      email,
    });

    console.log("Welcome email sent successfully");
    return NextResponse.json(
      { success: true, message: "Welcome email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    
    let errorMessage = "Failed to send welcome email";
    if (error?.response?.body) {
      try {
        const errorBody = JSON.parse(error.response.body);
        errorMessage = errorBody?.errors?.[0]?.message || errorMessage;
      } catch {
        // If parsing fails, use default message
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

