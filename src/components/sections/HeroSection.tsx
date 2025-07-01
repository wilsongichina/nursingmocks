import ContactForm from "../ui/ContactForm";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center">
          {/* Left Side - Hero Content */}
          <div>
            <p className="text-xl font-semibold mb-4 w-full text-center">
              Pay Only After You Pass
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 w-full text-center">
              Pay Someone to Take My TEAS Exam for Me
            </h1>
            <h2 className="text-xl md:text-2xl mb-8 w-full text-center">
              The Versatile Online Teas Proctored Help Company for Students.
              Teas Guru Makes Taking Exams & Answering Refreshing. Order Your
              Teas Exam, Tests, Quizzes and More…
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors text-center"
              >
                Download Eng Set
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                But Exact Teas - $99
              </Link>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
