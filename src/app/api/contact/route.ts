import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/sendgrid";

export async function POST(request: NextRequest) {
  try {
    // Check if request is FormData (for file uploads) or JSON
    const contentType = request.headers.get("content-type") || "";
    let formData: any;

    if (contentType.includes("multipart/form-data")) {
      const formDataObj = await request.formData();
      formData = {
        name: formDataObj.get("name") as string,
        email: formDataObj.get("email") as string,
        phone: formDataObj.get("phone") as string || "",
        budget: formDataObj.get("budget") as string || "",
        services: formDataObj.get("services") as string || formDataObj.get("topic") as string || "",
        topic: formDataObj.get("topic") as string || "",
        urgency: formDataObj.get("urgency") as string || "",
        message: formDataObj.get("message") as string,
        attachment: formDataObj.get("attachment") as File | null,
      };
    } else {
      const body = await request.json();
      formData = body;
    }

    const { name, email, phone, budget, services, topic, urgency, message } = formData;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Send email using SendGrid
    console.log("Attempting to send contact email...");
    console.log(
      "To email (recipient):",
      process.env.SENDGRID_TO_EMAIL || "azmeerhamasali@gmail.com"
    );
    console.log(
      "From email (sender):",
      process.env.SENDGRID_FROM_EMAIL || "azmeerhamasaliltd@gmail.com"
    );

    await sendContactEmail({
      name,
      email,
      phone: phone || undefined,
      budget: budget || undefined,
      services: services || topic || "General Inquiry",
      topic: topic || undefined,
      urgency: urgency || undefined,
      message,
    });

    console.log("Contact email sent successfully");
    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    let errorMessage = "Failed to send email";

    // Handle SendGrid error responses
    if (error?.response?.body) {
      try {
        const errorBody =
          typeof error.response.body === "string"
            ? JSON.parse(error.response.body)
            : error.response.body;

        if (errorBody?.errors && Array.isArray(errorBody.errors)) {
          errorMessage = errorBody.errors[0]?.message || errorMessage;
          console.error("SendGrid error:", errorBody.errors);
        } else if (errorBody?.message) {
          errorMessage = errorBody.message;
        }
      } catch (parseError) {
        console.error("Error parsing SendGrid error response:", parseError);
        errorMessage = error.response.body?.toString() || errorMessage;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
