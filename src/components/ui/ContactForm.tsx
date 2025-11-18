"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  budget: string;
  services: string;
  message: string;
}

interface ContactFormProps {
  className?: string;
  title?: string;
}

export default function ContactForm({
  className = "",
  title = "Get In Touch With Us",
}: ContactFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    budget: "",
    services: "",
    message: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email using API route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form data
        setFormData({
          name: "",
          email: "",
          phone: "",
          budget: "",
          services: "",
          message: "",
        });

        // Redirect to thank you page
        router.push("/thank-you");
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending form:", error);
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {title}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email address"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Budget Field */}
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Budget
            </label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your budget "
            />
          </div>

          {/* Services Field */}
          <div className="md:col-span-2">
            <label
              htmlFor="services"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Services *
            </label>
            <select
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select a service</option>
              <option value="teas-practice-material">
                TEAS Practice Material
              </option>
              <option value="teas-exam-help">TEAS Exam Help</option>
            </select>
          </div>

          {/* Message Field */}
          <div className="md:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Tell us about your TEAS exam goals and how we can help you..."
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-button text-white px-6 py-3 rounded-lg font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
