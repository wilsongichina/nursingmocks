import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";
import { getAllSupportPages } from "@/lib/firestore-operations";

interface SupportPageContent {
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
  schema: string;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  content: string;
}

interface PageProps {
  params: Promise<{ serviceId: string; pageId: string }>;
}

// Generate static params at build time
export async function generateStaticParams() {
  try {
    const result = await getAllSupportPages();

    if (result.success && result.data) {
      const pages = result.data;
      const params: Array<{ serviceId: string; pageId: string }> = [];

      // Extract all possible serviceId/pageId combinations
      Object.keys(pages).forEach((serviceId) => {
        const servicePages = pages[serviceId];
        if (servicePages && typeof servicePages === "object") {
          Object.keys(servicePages).forEach((pageId) => {
            params.push({ serviceId, pageId });
          });
        }
      });

      return params;
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  // Return some default pages if Firestore is not available during build
  return [
    { serviceId: "teas", pageId: "math" },
    { serviceId: "teas", pageId: "science" },
    { serviceId: "teas", pageId: "reading" },
    { serviceId: "teas", pageId: "english" },
  ];
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const result = await getAllSupportPages();

    if (result.success && result.data) {
      const pages = result.data;
      const pageData = pages[resolvedParams.serviceId]?.[resolvedParams.pageId];

      if (pageData) {
        return {
          title:
            pageData.meta?.title || `${resolvedParams.pageId} - TEAS Gurus`,
          description: pageData.meta?.description || "",
          keywords: pageData.meta?.keywords || "",
          openGraph: {
            title:
              pageData.meta?.ogTitle ||
              pageData.meta?.title ||
              `${resolvedParams.pageId} - TEAS Gurus`,
            description:
              pageData.meta?.ogDescription || pageData.meta?.description || "",
            url:
              pageData.meta?.canonicalUrl ||
              `https://teasgurus.com/${resolvedParams.serviceId}/${resolvedParams.pageId}`,
            images: [
              {
                url: pageData.meta?.ogImage || "/teas-gurus-logo.png",
                width: 1200,
                height: 630,
                alt:
                  pageData.meta?.title ||
                  `${resolvedParams.pageId} - TEAS Gurus`,
              },
            ],
          },
          alternates: {
            canonical:
              pageData.meta?.canonicalUrl ||
              `/${resolvedParams.serviceId}/${resolvedParams.pageId}`,
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: `${resolvedParams.pageId} - TEAS Gurus`,
    description: `Get help with your ${resolvedParams.pageId} TEAS exam preparation.`,
    alternates: {
      canonical: `/${resolvedParams.serviceId}/${resolvedParams.pageId}`,
    },
  };
}

export default async function SupportPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { serviceId, pageId } = resolvedParams;

  let content: SupportPageContent | null = null;

  try {
    const result = await getAllSupportPages();

    if (result.success && result.data) {
      const pages = result.data;
      content =
        pages[resolvedParams.serviceId]?.[resolvedParams.pageId] || null;
    }
  } catch (error) {
    console.error("Error loading support page content:", error);
  }

  if (!content) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The requested support page could not be found.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Schema Script */}
      {content?.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: content.schema,
          }}
        />
      )}

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                {
                  label:
                    serviceId.charAt(0).toUpperCase() +
                    serviceId.slice(1).replace(/-/g, " "),
                  href: `/${serviceId}`,
                },
                {
                  label:
                    pageId.charAt(0).toUpperCase() +
                    pageId.slice(1).replace(/-/g, " "),
                },
              ]}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {content?.hero?.badge || "TEAS Exam Help"}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {content?.hero?.title || `${resolvedParams.pageId} - TEAS Gurus`}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              {content?.hero?.subtitle ||
                `Get expert help with your ${resolvedParams.pageId} TEAS exam preparation.`}
            </p>
            <div className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              <ContentRenderer
                content={
                  content?.hero?.description ||
                  "Our experienced tutors are here to help you succeed in your TEAS exam."
                }
                textColor="white"
              />
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content with Left Border */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-600 ">
                <ContentRenderer
                  content={content?.content || ""}
                  className="prose prose-lg max-w-none text-gray-900"
                />
              </div>
            </div>

            {/* Right Side CTA */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-lg text-white sticky top-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Excel?</h3>
                  <p className="text-green-100 mb-6 leading-relaxed">
                    Get expert help with your TEAS preparation. Our specialists
                    are here to guide you to success.
                  </p>
                  <Link
                    href="/contact"
                    className="block w-full bg-yellow-400 text-green-900 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors text-center"
                  >
                    Get a Free Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Master Your TEAS Exam?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Get expert help with your TEAS preparation. Our specialists are
                here to guide you to success and ensure you achieve your nursing
                school goals. Join thousands of successful students who have
                achieved their dreams with TEAS Gurus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started Today
                </Link>
                <Link
                  href="https://buy.stripe.com/4gw5mn0nm0mTfUk3e9?success_url=https://teasgurus.com/teas/thank-you&cancel_url=https://teasgurus.com/teas"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Exact Teas - $99
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
