"use client";

import { useMemo, useState } from "react";
import { FaCircleCheck, FaCircleExclamation, FaPaperPlane } from "react-icons/fa6";

interface SupportFormData {
  name: string;
  email: string;
  topic: string;
  urgency: string;
  message: string;
}

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialFormData: SupportFormData = {
  name: "",
  email: "",
  topic: "",
  urgency: "",
  message: "",
};

const topicOptions = [
  "Account And Login",
  "Payment Or Billing",
  "Exam Access",
  "Technical Problem",
  "Results Or Progress",
  "Content Feedback",
  "Other",
];

const urgencyOptions = [
  "I Have An Exam This Week",
  "I Have An Exam This Month",
  "General Question",
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SupportContactForm() {
  const [formData, setFormData] = useState<SupportFormData>(initialFormData);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingCharacters = useMemo(
    () => Math.max(0, 4000 - formData.message.length),
    [formData.message.length],
  );

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitState.status !== "idle") {
      setSubmitState({ status: "idle", message: "" });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Enter your full name.";
    }
    if (!isValidEmail(formData.email)) {
      return "Enter a valid email address.";
    }
    if (!formData.topic) {
      return "Choose the topic that best matches your request.";
    }
    if (!formData.urgency) {
      return "Choose how urgent this request is.";
    }
    if (formData.message.trim().length < 20) {
      return "Add a few more details so support can understand the issue.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitState({ status: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: unknown = await response.json();
      const responseMessage =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "Could not send your message. Please try again.";
      const successMessage =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Message sent. We created a support request and emailed a confirmation to you.";

      if (!response.ok) {
        throw new Error(responseMessage);
      }

      setFormData(initialFormData);
      setSubmitState({
        status: "success",
        message: successMessage,
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      {submitState.status !== "idle" && (
        <div
          className={`flex gap-3 rounded-2xl border px-4 py-3 text-[14px] leading-6 ${
            submitState.status === "success"
              ? "border-[#bbf7d0] bg-[#ecfdf3] text-[#166534]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          }`}
          role="status"
          aria-live="polite"
        >
          {submitState.status === "success" ? (
            <FaCircleCheck className="mt-1 shrink-0" />
          ) : (
            <FaCircleExclamation className="mt-1 shrink-0" />
          )}
          <span>{submitState.message}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Full Name
          </label>
          <input
            id="support-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            className="min-h-11 w-full rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 text-[15px] leading-6 text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#c7d2fe]"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="support-email" className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Account Email
          </label>
          <input
            id="support-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="min-h-11 w-full rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 text-[15px] leading-6 text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#c7d2fe]"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="support-topic" className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Topic
          </label>
          <select
            id="support-topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="min-h-11 w-full rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 text-[15px] leading-6 text-[#111827] outline-none transition focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#c7d2fe]"
          >
            <option value="">Choose A Topic</option>
            {topicOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="support-urgency" className="mb-2 block text-[14px] font-semibold text-[#374151]">
            Urgency
          </label>
          <select
            id="support-urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="min-h-11 w-full rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 text-[15px] leading-6 text-[#111827] outline-none transition focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#c7d2fe]"
          >
            <option value="">Choose Urgency</option>
            {urgencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="support-message" className="text-[14px] font-semibold text-[#374151]">
            Message
          </label>
          <span className="text-[12px] text-[#6b7280]">
            {remainingCharacters} characters left
          </span>
        </div>
        <textarea
          id="support-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          maxLength={4000}
          className="min-h-[150px] w-full resize-y rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-[15px] leading-7 text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#c7d2fe]"
          placeholder="Example: I paid for ATI TEAS access using this email, but the exam still shows locked on my dashboard. I tried refreshing and signing out."
        />
        <p className="m-0 mt-2 text-[12px] leading-5 text-[#6b7280]">
          Do not include card numbers, passwords, or private medical information.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 max-w-[390px] text-[12px] leading-5 text-[#6b7280]">
          For screenshots, submit the request first and reply to the confirmation email with the image attached.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#111827] bg-[#111827] px-5 text-[14px] font-semibold text-[#f9fafb] transition hover:border-[#4f46e5] hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
          <FaPaperPlane className="text-[12px]" />
        </button>
      </div>
    </form>
  );
}
