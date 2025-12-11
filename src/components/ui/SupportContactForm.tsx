"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaperPlane } from "react-icons/fa6";

interface SupportFormData {
  name: string;
  email: string;
  topic: string;
  urgency: string;
  message: string;
  attachment?: File | null;
}

export default function SupportContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SupportFormData>({
    name: "",
    email: "",
    topic: "",
    urgency: "",
    message: "",
    attachment: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      attachment: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload support
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("topic", formData.topic);
      submitData.append("urgency", formData.urgency);
      submitData.append("message", formData.message);
      
      if (formData.attachment) {
        submitData.append("attachment", formData.attachment);
      }

      // Send email using API route
      const response = await fetch("/api/contact", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form data
        setFormData({
          name: "",
          email: "",
          topic: "",
          urgency: "",
          message: "",
          attachment: null,
        });

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        // Redirect to thank you page
        router.push("/thank-you");
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending form:", error);
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-[12px] grid grid-cols-1 md:grid-cols-2 gap-[12px] text-[13px]">
      <div className="support-field">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          Full name
          <span className="font-normal text-[11px] text-[#9ca3af]">So we know how to address you</span>
        </label>
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="First and last name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit" }}
        />
      </div>

      <div className="support-field">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          Email used on NursingMocks
          <span className="font-normal text-[11px] text-[#9ca3af]">We use this to find your account</span>
        </label>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit" }}
        />
      </div>

      <div className="support-field">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          Topic
          <span className="font-normal text-[11px] text-[#9ca3af]">Helps us route your message</span>
        </label>
        <select
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit" }}
        >
          <option value="">Choose a topic…</option>
          <option>Account & login</option>
          <option>Billing & subscription</option>
          <option>TEAS practice exams</option>
          <option>HESI A2 practice exams</option>
          <option>Nursing test banks</option>
          <option>Nursing exit exams</option>
          <option>Technical problem</option>
          <option>Feedback or suggestion</option>
          <option>Other</option>
        </select>
      </div>

      <div className="support-field">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          Urgency
          <span className="font-normal text-[11px] text-[#9ca3af]">Honesty is appreciated</span>
        </label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          required
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit" }}
        >
          <option value="">How urgent is this?</option>
          <option>I have an exam this week</option>
          <option>I have an exam this month</option>
          <option>Planning ahead / general question</option>
        </select>
      </div>

      <div className="support-field md:col-span-2">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          What is going on?
          <span className="font-normal text-[11px] text-[#9ca3af]">
            Include steps you took, error messages, and any exam IDs or set names.
          </span>
        </label>
        <textarea
          name="message"
          placeholder="Example: 'I tried to start ATI TEAS Math Questions – Set 4 from my dashboard. The page loads but shows a blank screen, and the timer starts counting down.'"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] resize-y focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit", minHeight: "90px" }}
        />
      </div>

      <div className="support-field md:col-span-2">
        <label className="text-[12px] font-medium text-[#374151] flex justify-between mb-[4px]">
          Attach a screenshot (optional)
          <span className="font-normal text-[11px] text-[#9ca3af]">We never share your screenshots outside support</span>
        </label>
        <input
          type="file"
          name="attachment"
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="w-full rounded-[12px] border border-[#d1d5db] outline-none bg-[#f9fafb] text-[#111827] focus:border-[#4f46e5] focus:bg-white focus:shadow-[0_0_0_1px_rgba(129,140,248,0.35)]"
          style={{ padding: "8px 9px", fontSize: "13px", fontFamily: "inherit" }}
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-between gap-[10px] mt-[6px]">
        <p className="text-[11px] text-[#6b7280] max-w-[320px] m-0">
          If your question is about scores or study planning, feel free to tell us your latest TEAS or HESI
          results and when your next exam date is. That context helps us give realistic advice instead of
          generic tips.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full border-none bg-[#111827] text-[#f9fafb] text-[13px] cursor-pointer inline-flex items-center gap-[6px] disabled:opacity-50 disabled:cursor-not-allowed font-normal"
          style={{ padding: "9px 18px" }}
        >
          {isSubmitting ? "Sending..." : "Send message"}
          <FaPaperPlane className="text-[12px]" />
        </button>
      </div>
    </form>
  );
}
