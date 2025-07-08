"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export default function PillarPage() {
  const [loading] = useState(false);

  useEffect(() => {
    // Update page metadata
    document.title =
      "How Many Math Questions Are On The TEAS - Complete Guide | TEAS Gurus";

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      "Learn how many math questions are on the TEAS test (38 questions in 57 minutes). Get detailed breakdown of math section structure, question types, and study strategies for nursing school success."
    );

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute(
      "content",
      "TEAS math questions, how many math questions on TEAS, TEAS test math section, ATI TEAS math, nursing school math test, TEAS math practice"
    );

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute(
      "content",
      "How Many Math Questions Are On The TEAS - Complete Guide"
    );

    let ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute(
      "content",
      "Learn how many math questions are on the TEAS test (38 questions in 57 minutes). Get detailed breakdown of math section structure, question types, and study strategies for nursing school success."
    );

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", "/teas-gurus-logo.png");

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute(
      "href",
      "https://teasgurus.com/pillarpage/title"
    );
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "How Many Math Questions Are On The TEAS - Complete Guide",
            description:
              "Learn how many math questions are on the TEAS test (38 questions in 57 minutes). Get detailed breakdown of math section structure, question types, and study strategies for nursing school success.",
            image: "https://teasgurus.com/teas-gurus-logo.png",
            author: {
              "@type": "Organization",
              name: "TEAS Gurus",
            },
            publisher: {
              "@type": "Organization",
              name: "TEAS Gurus",
              logo: {
                "@type": "ImageObject",
                url: "https://teasgurus.com/teas-gurus-logo.png",
              },
            },
            datePublished: "2024-01-01",
            dateModified: "2024-01-01",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://teasgurus.com/pillarpage/title",
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              TEAS Math Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How Many Math Questions Are On The TEAS
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Complete Guide to TEAS Math Section Structure and Preparation
            </p>
            <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              You may need to take the ATI TEAS Test of Essential Academic
              Skills if you want to go to nursing school. One of the most
              typical things individuals ask when they take a test is: How many
              math problems are on the TEAS test? In this tutorial, we will
              address that question and also go over the math part in detail,
              covering the kinds of problems, the timing, and how to do well
              using ATI TEAS Math Questions as your study guide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hesi-a2"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Our Services
              </Link>
              <Link
                href="/prices"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                1. The Structure of The TEAS Test: How Math Fits In
              </h2>
              <p className="text-gray-700 mb-6">
                The TEAS test has four basic parts:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Reading</li>
                <li>Math</li>
                <li>Science</li>
                <li>English and Language Usage</li>
              </ul>
              <p className="text-gray-700 mb-6">
                There are 38 questions in the Math part, and students taking the
                test have 57 minutes to finish it. That means you have roughly
                1.5 minutes to answer each question. But keep in mind that not
                all of these questions will be graded. Most of the time, 4 out
                of the 38 math problems are not scored and are solely utilized
                for ATI's own tests. You will not know which ones do not count,
                so treat every question as if it did.
              </p>
              <p className="text-gray-700 mb-8">
                Math makes up about 22 percent of the TEAS test, and how well
                you do in this portion is quite crucial. Most nursing schools
                want you to get at least a certain score on the composite test.
                If you do not do well in math, that score can go down a lot.
                This is why it is very important to practice and understand ATI
                TEAS Math Questions.
              </p>

              <hr className="my-8 border-gray-300" />

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                2. What Kinds of Math Problems Are On The TEAS
              </h2>
              <p className="text-gray-700 mb-6">
                The arithmetic section of the test is aimed to determine how
                effectively you can do simple math problems that are regularly
                utilized in the medical field. It focuses on two key categories
                of content:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                A. Algebra and Numbers
              </h3>
              <p className="text-gray-700 mb-4">
                This region normally has between 18 and 22 questions. It looks
                at:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Ratios and proportions</li>
                <li>Solving equations</li>
                <li>Word problems that apply real-life situations</li>
                <li>Fractions, decimals, and percentages</li>
                <li>Changing numbers from one form to another</li>
                <li>The order of operations PEMDAS</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Nurses utilize these simple math skills every day, including
                calculating how much medicine to give someone or how much water
                to drink. In these approaches, it is very necessary to practice
                ATI TEAS Math Questions to get faster and more sure of yourself.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                B. Data and Measurement
              </h3>
              <p className="text-gray-700 mb-4">
                This group has 16 to 20 questions and is about:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Reading tables, charts, and graphs</li>
                <li>Basic geometry such as area, perimeter, volume</li>
                <li>Mean, median, and mode</li>
                <li>
                  Changing units of measurement like milliliters to liters
                </li>
                <li>Looking at and making sense of data</li>
              </ul>
              <p className="text-gray-700 mb-8">
                You are not simply completing arithmetic. You are also intended
                to apply it like a nurse or other health care provider would in
                real life. For example, you could be given a chart of vital
                signs and asked to find a pattern or average a patient's blood
                pressure data using ATI TEAS Math Questions that are supposed to
                seem like real-life circumstances.
              </p>

              <hr className="my-8 border-gray-300" />

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                3. How Long Do You Have to Do Math for TEAS
              </h2>
              <p className="text-gray-700 mb-6">
                You have 57 minutes to finish the math part. That means you have
                about 90 seconds to answer each question. This may seem like a
                lot of time, but if you are not ready, the word problems and
                equations that need more than one step can make this phase feel
                rushed.
              </p>
              <p className="text-gray-700 mb-4">
                Here is what this means for you:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>
                  Stay on track. Do not spend too much time on one question. If
                  you do not know the answer, mark it and move on.
                </li>
                <li>
                  Use your calculator wisely. You can use a simple four-function
                  calculator on the TEAS, but you cannot bring your own. It will
                  be on the screen.
                </li>
                <li>
                  Do quizzes on a timer. To get acclimated to working under
                  pressure, use sets of ATI TEAS Math Questions that are like
                  the real test.
                </li>
              </ul>

              <hr className="my-8 border-gray-300" />

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                4. How to Get Ready for TEAS Math Questions
              </h2>
              <p className="text-gray-700 mb-6">
                You need to study hard because the math component is a large
                part of your final score. Here are some tried-and-true
                strategies to help you get ready:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                A. Review the basics
              </h3>
              <p className="text-gray-700 mb-4">
                A lot of individuals who take the test are astonished by how
                much they have forgotten, even if the math is based on what they
                learned in high school. Improve at:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>Converting decimals to fractions</li>
                <li>Solving algebraic equations</li>
                <li>Reading tables and graphs</li>
              </ul>
              <p className="text-gray-700 mb-6">
                The ATI TEAS Math Questions are a wonderful place to start
                because they test your basic arithmetic and algebra skills.
                Then, move on to harder subjects.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                B. Learn the most important formulas by heart
              </h3>
              <p className="text-gray-700 mb-4">
                You will not get a sheet containing the formulas for the TEAS
                test on it. That implies you need to remember these formulas
                that come up a lot:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                <li>
                  To find the area of a rectangle, multiply the length by the
                  breadth
                </li>
                <li>
                  The formula base times height divided by 2 will give you the
                  area of a triangle
                </li>
                <li>
                  Use the formula pi times r squared times height to figure out
                  the volume of a cylinder
                </li>
                <li>Percent equals part divided by whole times 100</li>
                <li>Distance equals rate times time</li>
              </ul>
              <p className="text-gray-700 mb-6">
                If you know these formulas, you will not have to waste time
                guessing when you take the ATI TEAS Math Questions.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                C. Do practice tests
              </h3>
              <p className="text-gray-700 mb-6">
                Take practice tests with questions like the TEAS to figure out
                where you need to improve. You can practice for the real test
                with hundreds of ATI TEAS Math Questions from sources like Teas
                Gurus, ATI's official materials, or online platforms.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                D. Be careful with word issues
              </h3>
              <p className="text-gray-700 mb-8">
                Many of the arithmetic questions on the TEAS are word problems.
                Learn how to find key numbers, put sentences into equations, and
                solve them effectively. Word-based ATI TEAS Math Questions help
                you think rationally, which is a skill you need for nursing
                school.
              </p>

              <hr className="my-8 border-gray-300" />

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                5. The Math Section Is More Important Than You Think
              </h2>
              <p className="text-gray-700 mb-6">
                Many pupils do not know how vital the math part is. Here is the
                reason:
              </p>
              <p className="text-gray-700 mb-6">
                Nursing needs rapid and accurate math skills, whether you are
                measuring drugs, changing IV flow rates, or figuring out lab
                values. Getting a good score on the math section of the TEAS can
                make a big difference in whether or not you get into a nursing
                program. Many institutions have minimum math score requirements,
                and these can be higher than the average.
              </p>
              <p className="text-gray-700 mb-6">
                A school might, for instance, require a math score of at least
                70 percent. That means you got around 65.8 percent of the
                questions right, or 25 out of 38. That might not be enough to
                get by. That is why you should make ATI TEAS Math Questions a
                key priority in your study schedule. They not only help you
                pass, but they also help you stand out when you know how to use
                them.
              </p>

              <hr className="my-8 border-gray-300" />

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Final Thoughts
              </h2>
              <p className="text-gray-700 mb-6">
                So, how many math problems are on the TEAS test?
              </p>
              <p className="text-gray-700 mb-8 font-semibold text-lg">
                You have 57 minutes to answer 38 questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Master TEAS Math?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Join thousands of successful students who have achieved their
                nursing school dreams with TEAS Gurus. Get started today and pay
                only after you pass.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/hesi-a2"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Our Services
                </Link>
                <Link
                  href="/prices"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
