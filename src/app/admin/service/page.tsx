"use client";

import { useState, useEffect } from "react";
import {
  getAllPages,
  uploadServiceContent,
  deleteServiceContent,
  getAllPillarPages,
  getPillarServicePageContent,
  uploadPillarServicePageContent,
  getAllPillarServicePages,
  deletePillarServicePageContent,
} from "@/lib/firestore-operations";
import Link from "next/link";

interface ServicePage {
  id: string;
  title?: string;
  lastUpdated?: string;
  version?: string;
  hero?: {
    title: string;
  };
  pillarPageId?: string;
  servicePageId?: string;
  pillarPageName?: string;
}

export default function AdminServicePage() {
  const [services, setServices] = useState<ServicePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newServiceId, setNewServiceId] = useState("");
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [selectedPillarPage, setSelectedPillarPage] = useState("teas");
  const [pillarPages, setPillarPages] = useState<Array<{ id: string; pageName?: string }>>([]);
  const [validationError, setValidationError] = useState("");
  const [filterPillarPage, setFilterPillarPage] = useState("all");

  useEffect(() => {
    loadServices();
    loadPillarPages();
  }, []);

  const loadPillarPages = async () => {
    try {
      const result = await getAllPillarPages();
      if (result.success && result.data) {
        setPillarPages(result.data);
      }
    } catch (err) {
      console.error("Error loading pillar pages:", err);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const allServices: ServicePage[] = [];

      // Load regular services (TEAS)
      const result = await getAllPages();
      if (result.success && result.data) {
        const servicesList = Object.keys(result.data).map((id) => ({
          id,
          ...result.data[id],
        }));
        allServices.push(...servicesList);
      }

      // Load services from all pillar pages
      const pillarPagesResult = await getAllPillarPages();
      if (pillarPagesResult.success && pillarPagesResult.data) {
        for (const pillarPage of pillarPagesResult.data) {
          const pillarServicesResult = await getAllPillarServicePages(pillarPage.id);
          if (pillarServicesResult.success && pillarServicesResult.data) {
            const pillarServices = pillarServicesResult.data.map((service: any) => ({
              ...service,
              id: `${pillarPage.id}/${service.servicePageId}`,
              servicePageId: service.servicePageId,
              pillarPageId: pillarPage.id,
              pillarPageName: pillarPage.pageName || pillarPage.id,
            }));
            allServices.push(...pillarServices);
          }
        }
      }

      setServices(allServices);
    } catch (err) {
      setError("Failed to load services");
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateSlugUrl = async (serviceId: string, pillarPageId: string): Promise<string | null> => {
    const normalizedServiceId = serviceId.toLowerCase().replace(/\s+/g, "-");
    
    // If "teas" is selected, check regular services
    if (pillarPageId === "teas") {
      const allPagesResult = await getAllPages();
      if (allPagesResult.success && allPagesResult.data) {
        const existingService = allPagesResult.data[normalizedServiceId];
        if (existingService) {
          return `A service with the slug "${normalizedServiceId}" already exists`;
        }
      }
    } else {
      // Check pillar service pages
      try {
        const result = await getPillarServicePageContent(pillarPageId, normalizedServiceId);
        if (result.success && result.data) {
          return `A service page with the slug "${normalizedServiceId}" already exists under this pillar page`;
        }
      } catch {
        // If there's an error, we'll assume it doesn't exist
      }
    }

    return null;
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServiceId.trim() || !newServiceTitle.trim()) {
      setError("Please provide both service ID and title");
      return;
    }

    setValidationError("");
    setError("");

    // Validate slug URL
    const slugError = await validateSlugUrl(newServiceId, selectedPillarPage);
    if (slugError) {
      setValidationError(slugError);
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Create a basic service template matching math page structure
      const newService = {
        meta: {
          title: `ATI TEAS ${newServiceTitle} Questions - Practice Tests & Study Guide`,
          description: `Master TEAS ${newServiceTitle.toLowerCase()} with our comprehensive practice tests, study guides, and expert tips. Get ready for the 2025 TEAS exam with focused ${newServiceTitle.toLowerCase()} preparation.`,
          keywords: `TEAS ${newServiceTitle.toLowerCase()}, ATI TEAS ${newServiceTitle.toLowerCase()} questions, TEAS ${newServiceTitle.toLowerCase()} practice test, TEAS ${newServiceTitle.toLowerCase()} study guide, 2025 TEAS exam, nursing school entrance exam`,
          ogTitle: `ATI TEAS ${newServiceTitle} Questions - Complete Practice & Study Guide`,
          ogDescription: `Comprehensive TEAS ${newServiceTitle.toLowerCase()} preparation with practice tests, study materials, and expert guidance for nursing school success.`,
          ogImage: `/teas-gurus-logo.png`,
          canonicalUrl: `https://teasgurus.com/${newServiceTitle.toLowerCase()}`,
        },
        schema: `{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "TEAS Gurus",
  "description": "Looking to pay someone to take my teas exam for me? Get expert help, guaranteed results, and full confidentiality from trusted exam professionals at Teas Gurus.",
  "url": "https://teasgurus.com/",
  "logo": "https://teasgurus.com/teas-gurus-logo.png",
  "sameAs": [
    "https://www.instagram.com/teasgurus",
    "https://www.tiktok.com/@teas.gurus",
    "www.youtube.com/@TeasGurus",
    "https://www.linkedin.com/company/teasgurus/"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "1-579-501-1983",
    "contactType": "customer service",
    "availableLanguage": "English"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": {
      "@type": "Country",
      "name": "US"
    }
  }
}`,
        hero: {
          badge: `${newServiceTitle} Practice`,
          title: `ATI TEAS ${newServiceTitle} Questions`,
          subtitle: `Practice the Most Common TEAS ${newServiceTitle} Questions for TEAS Exam Success`,
          description: `Struggling with the ${newServiceTitle.toLowerCase()} portion of the TEAS exam? Our TEAS ${newServiceTitle.toLowerCase()} practice tests are designed to give you focused, exam-like practice that boosts confidence and performance. You'll tackle the most commonly tested TEAS ${newServiceTitle.toLowerCase()} questions, from basic concepts to advanced applications. Whether you're just starting or reviewing before test day, our resources help you practice smart and succeed. Mastering ${newServiceTitle.toLowerCase()} doesn't have to be hard when you have the right tools and support tailored for TEAS exam success.`,
        },
        trustIndicators: [
          {
            title: "Expert TEAS Specialists",
            icon: "check",
          },
          {
            title: "Complete Privacy Assurance",
            icon: "shield",
          },
          {
            title: "High Client Satisfaction Rates",
            icon: "star",
          },
          {
            title: "Guaranteed Success",
            icon: "check-circle",
          },
        ],
        whatToExpect: {
          badge: `TEAS ${newServiceTitle} Practice`,
          title: `What to Expect in the ATI TEAS ${newServiceTitle} Practice Test Section`,
          subtitle: `The ${newServiceTitle.toLowerCase()} practice test for the ATI TEAS is supposed to be the same as the ${newServiceTitle.toLowerCase()} element of the real TEAS test. It helps students become acquainted to the kind of questions, the pace at which they will be asked, and the types of issues they will have to solve on the day of the test.`,
          cards: [
            {
              title: "Test Structure & Timing",
              icon: "check",
              content: [
                `There are normally 36 questions in the ${newServiceTitle.toLowerCase()} part of the TEAS that you have to answer in 57 minutes. These questions test a lot of different skills, such as basic concepts, advanced applications, and practical scenarios. A excellent practice test not only covers the same information as the real test, but it also puts pupils under the same amount of time pressure. This helps kids get the strength they need to do well on the test.`,
                `There are both multiple-choice and multiple-select questions on the TEAS ${newServiceTitle.toLowerCase()} practice test. Usually, the subjects involve core concepts, practical applications, and real-world scenarios. Students can also learn about fundamental principles and advanced techniques.`,
              ],
            },
            {
              title: "Practice & Feedback",
              icon: "check-circle",
              content: [
                `There are a lot of questions in practical scenarios, so you need to read them carefully and adapt real-life events into problem-solving situations. You can use the practice test to get better at solving problems and figure out what you need to study further.`,
                `A well-organized practice exam gives you instant feedback, explanations, and a breakdown of your result. This shows pupils not just what they got wrong, but also why they got it wrong. You need to read this feedback as carefully as you do the test. It helps you remember what you've learnt and shows you where you need to get better.`,
              ],
            },
          ],
          footer: `Regularly taking ATI TEAS ${newServiceTitle} Practice Tests will make you feel more sure of yourself, less nervous about the test, and more accurate. Students who study with real-life resources and focus on the TEAS exam are more likely to pass it the first time they take it.`,
        },
        mostCommonQuestions: {
          badge: "2025 TEAS Exam",
          title: `Most Common TEAS Practice ${newServiceTitle} Questions on the 2025 TEAS Exam`,
          subtitle: `The ${newServiceTitle.toLowerCase()} part of the 2025 TEAS test is very similar to the ${newServiceTitle.toLowerCase()} part of the real test, with a lot of real, commonly tested ${newServiceTitle.toLowerCase()} concepts.`,
          cards: [
            {
              title: "Core Concepts",
              content: [
                `These include working with fundamental principles, advanced techniques, and practical applications. You will also have to solve problems, evaluate scenarios, and figure out what practical situations mean. These aren't just things to practice; these are the actual ${newServiceTitle.toLowerCase()} questions you'll see on the TEAS test. Getting ready with these kinds of questions will help you on the day of the test.`,
                `There are also a lot of tests on practical applications and real-world scenarios. You might have to analyze situations, answer questions about concepts, and interpret information to get the right answers.`,
              ],
            },
            {
              title: "Healthcare Applications",
              content: [
                `A lot of these questions are based on real-life situations in healthcare, like applying ${newServiceTitle.toLowerCase()} concepts to patient care or understanding medical scenarios. The most important thing is to practice the same kinds of questions that will be on the TEAS test so you aren't caught off guard.`,
                `Some students may be wondering, can i pay someone to take my TEAS exam for me? The truth is that their are a number of services that provide this service Teas Gurus being one of them. If you don't want to hire someone, then the best way to pass is to practice the most common TEAS ${newServiceTitle.toLowerCase()} questions a lot. If you can answer these kinds of questions, you'll be ready for the 2025 TEAS exam.`,
              ],
            },
          ],
        },
        studyGuide: {
          badge: "Study Guide",
          title: `Best Way for Students to Study for ATI TEAS ${newServiceTitle}`,
          subtitle: `Comprehensive study strategies for each section of the TEAS exam`,
          sections: [
            {
              title: newServiceTitle,
              icon: "star",
              content: `The ${newServiceTitle.toLowerCase()} part is all about fundamental concepts, practical applications, and real-world scenarios. You will solve problems that use core principles, advanced techniques, and practical situations. A lot of these questions are set up in situations related to healthcare to see if you can use what you've learned. Using TEAS test ${newServiceTitle.toLowerCase()} questions to study makes sure you're ready for the exact kinds of problems that will be on the test. You need to practice under time limits and go over important concepts so you can do the test quickly and correctly.`,
            },
            {
              title: "Reading",
              icon: "star",
              content: `The reading section checks how well you can understand and think about written information. You will have to read passages, figure out what the main idea is, and tell the difference between facts and opinions. When you read complicated texts, you should be able to judge arguments, understand the author's tone, and follow directions. When you practice with ATI TEAS Reading Questions, you get better at skills like summarizing, making inferences, and finding supporting details. This part is very important because you need to be able to read well to do well on the rest of the TEAS exam.`,
            },
            {
              title: "Science",
              icon: "star",
              content: `This part tests how well you know about life sciences, human anatomy and physiology, physical science, and how to think scientifically. You will be tested on things like cells, body systems, the scientific method, and basic chemistry. Going over ATI TEAS Science Questions will help you remember the most important ideas that are often tested. Many people find science to be one of the hardest subjects on the test, so it's important to practice regularly and have a strong understanding of the basics to do well on this part of the TEAS exam.`,
            },
            {
              title: "English",
              icon: "star",
              content: `The English and Language Usage section checks your grammar, punctuation, sentence structure, and vocabulary. You will need to show that you have a good grasp of standard English rules, such as how to spell, capitalize, and make sure that the subject and verb agree. The ATI TEAS English Questions are meant to help you write better and make sure your grammar is correct. At first glance, this part may seem easy, but you need to pay close attention to the details. The best way to avoid making common mistakes and raise your score is to study real practice questions.`,
            },
          ],
        },
        privacyPricing: [
          {
            title: "Privacy & Confidentiality",
            icon: "shield",
            content: `Your privacy is our top priority. All information shared with us is kept strictly confidential. We use secure, encrypted systems to protect your data, and we never share your personal information with third parties. Our team is bound by strict confidentiality agreements, ensuring that your academic journey remains private and secure.`,
          },
          {
            title: "Pricing & Guarantees",
            icon: "dollar",
            content: `We offer competitive pricing for our TEAS exam services, with transparent costs and no hidden fees. Our success rate speaks for itself, but we also provide guarantees to give you peace of mind. We're committed to your success and offer support throughout the entire process, from initial consultation to exam completion.`,
          },
        ],
        faq: {
          title: "Frequently Asked Questions",
          subtitle: "Common questions about our TEAS exam services",
          questions: [
            {
              question: "How does the TEAS exam service work?",
              paragraphs: [
                `Our TEAS exam service is designed to help you achieve your nursing school goals. We work with experienced professionals who are familiar with the TEAS exam format and requirements. The process begins with an initial consultation where we assess your needs and create a personalized plan.`,
                `Throughout the process, we maintain open communication and provide regular updates. Our team handles all aspects of the exam process, from registration to completion, ensuring that everything runs smoothly and according to your timeline.`,
              ],
            },
            {
              question: "Is this service legal and ethical?",
              paragraphs: [
                `We understand concerns about the legality and ethics of exam services. Our approach is to provide comprehensive support and assistance while maintaining academic integrity. We work within the framework of educational support services, providing guidance and resources to help you succeed.`,
                `It's important to note that we operate as an educational support service, providing assistance and resources to help students prepare for and take their exams. We encourage all students to review their institution's policies regarding external support services.`,
              ],
            },
            {
              question: "What if I'm not satisfied with the results?",
              paragraphs: [
                `Customer satisfaction is our top priority. We have a comprehensive quality assurance process in place to ensure that all services meet our high standards. If you're not completely satisfied with our service, we offer various options to address your concerns.`,
                `We believe in transparency and open communication. If there are any issues or concerns, we encourage you to reach out to our support team immediately so we can work together to find a solution that meets your needs.`,
              ],
            },
          ],
        },
      };

      const normalizedServiceId = newServiceId.toLowerCase().replace(/\s+/g, "-");

      // If pillar page is selected (not "teas"), upload to pillar service pages
      if (selectedPillarPage !== "teas") {
        const result = await uploadPillarServicePageContent(
          selectedPillarPage,
          normalizedServiceId,
          {
            ...newService,
            lastUpdated: new Date().toISOString(),
            version: "1.0",
          }
        );

        if (result.success) {
          setSuccess("Service created successfully!");
          setNewServiceId("");
          setNewServiceTitle("");
          setSelectedPillarPage("teas");
          setIsCreating(false);
          loadServices(); // Reload the services list
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(result.message || "Failed to create service");
        }
      } else {
        // Regular service upload
        const result = await uploadServiceContent(normalizedServiceId, newService);

        if (result.success) {
          setSuccess("Service created successfully!");
          setNewServiceId("");
          setNewServiceTitle("");
          setSelectedPillarPage("teas");
          setIsCreating(false);
          loadServices(); // Reload the services list
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(result.message || "Failed to create service");
        }
      }
    } catch (err) {
      setError("Failed to create service");
      console.error("Error creating service:", err);
    }
  };

  const handleDeleteService = async (serviceId: string, pillarPageId?: string, servicePageId?: string) => {
    const displayName = servicePageId || serviceId;
    if (
      !confirm(`Are you sure you want to delete the service "${displayName}"?`)
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      let result;
      if (pillarPageId && servicePageId) {
        // Delete from pillar service pages
        result = await deletePillarServicePageContent(pillarPageId, servicePageId);
      } else {
        // Delete regular service
        result = await deleteServiceContent(serviceId);
      }

      if (result.success) {
        setSuccess("Service deleted successfully!");
        loadServices(); // Reload the services list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete service");
      }
    } catch (err) {
      setError("Failed to delete service");
      console.error("Error deleting service:", err);
    }
  };

  // Filter services based on selected pillar page
  const filteredServices = 
    filterPillarPage === "all"
      ? services
      : filterPillarPage === "teas"
      ? services.filter((service) => !service.pillarPageId)
      : services.filter((service) => service.pillarPageId === filterPillarPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Services CMS
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your service pages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Service Modal */}
        {isCreating && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Service
              </h2>
              <form onSubmit={handleCreateService} className="space-y-4">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{validationError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pillar Page
                  </label>
                  <select
                    value={selectedPillarPage}
                    onChange={(e) => setSelectedPillarPage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    required
                  >
                    <option value="teas">TEAS</option>
                    {pillarPages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.pageName || page.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the pillar page this service belongs to
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service ID
                  </label>
                  <input
                    type="text"
                    value={newServiceId}
                    onChange={(e) => {
                      setNewServiceId(e.target.value);
                      setValidationError("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., reading, science, english"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPillarPage === "teas"
                      ? `This will be used in the URL: /${newServiceId.toLowerCase().replace(/\s+/g, "-") || "[service-id]"}`
                      : `This will be used in the URL: /${selectedPillarPage}/${newServiceId.toLowerCase().replace(/\s+/g, "-") || "[service-id]"}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Reading, Science, English"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be used in the page title and content
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Create Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewServiceId("");
                      setNewServiceTitle("");
                      setSelectedPillarPage("teas");
                      setValidationError("");
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">
              Filter by Pillar Page:
            </label>
            <select
              value={filterPillarPage}
              onChange={(e) => setFilterPillarPage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[200px]"
            >
              <option value="all">All Services</option>
              <option value="teas">TEAS</option>
              {pillarPages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.pageName || page.id}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredServices.length} service(s)
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.hero?.title || service.title || (service.servicePageId || service.id)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    ID: {service.servicePageId || service.id}
                  </p>
                  {service.pillarPageId && (
                    <p className="text-sm text-orange-600 font-medium mb-1">
                      Pillar: {service.pillarPageName || service.pillarPageId}
                    </p>
                  )}
                  {service.lastUpdated && (
                    <p className="text-sm text-gray-500">
                      Updated:{" "}
                      {new Date(service.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/service/${service.id}`}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteService(service.id, service.pillarPageId, service.servicePageId)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  href={service.pillarPageId ? `/${service.pillarPageId}/${service.servicePageId}` : `/${service.id}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Page →
                </Link>
                {service.version && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    v{service.version}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first service page.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
