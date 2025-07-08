import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, budget, services, message } = body;

    // Validate required fields
    if (!name || !email || !services || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // EmailJS configuration
    const serviceId =
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_b9tsxyr";
    const templateId =
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_d5ezllr";
    const publicKey =
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "Ia1zPxTbve95JxQan";

    if (!serviceId || !templateId || !publicKey) {
      console.error("Missing EmailJS configuration:", {
        serviceId,
        templateId,
        publicKey,
      });
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Prepare email template parameters
    const templateParams = {
      to_email: "azmeerhamasali@gmail.com",
      from_name: name,
      from_email: email,
      phone: phone || "Not provided",
      budget: budget || "Not provided",
      services: services,
      message: message,
      subject: "New Contact Form Submission - TEAS Gurus",
      reply_to: email,
    };

    console.log("Sending email with params:", {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    });

    // Send email using EmailJS REST API
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams,
        }),
      }
    );

    console.log("EmailJS response status:", response.status);
    console.log(
      "EmailJS response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const result = await response.text();
      console.log("EmailJS success response:", result);
      return NextResponse.json(
        { success: true, message: "Email sent successfully" },
        { status: 200 }
      );
    } else {
      // Handle non-JSON responses
      const responseText = await response.text();
      console.error("EmailJS error response:", responseText);

      let errorMessage = "Failed to send email";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      } catch {
        // If it's not JSON, use the text as error message
        errorMessage = responseText || errorMessage;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
