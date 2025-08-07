import Layout from "@/components/layout/Layout";
import {
  getQuestionContentByCategory,
  getAllQuestions,
} from "@/lib/firestore-operations";
import SchemaScripts from "@/components/ui/SchemaScripts";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";
import { HiOutlineCheckCircle } from "react-icons/hi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceId: string; question_title: string }>;
}): Promise<Metadata> {
  const { serviceId, question_title } = await params;
  const result = await getQuestionContentByCategory(serviceId, question_title);
  if (!result.success || !result.data) return { title: "Question Not Found" };
  const meta = result.data.meta || {};
  return {
    title:
      meta.title ||
      result.data.questionText?.replace(/<[^>]+>/g, "") ||
      "Question",
    description: meta.description || undefined,
    keywords: meta.keywords || undefined,
    openGraph: {
      title: meta.ogTitle || meta.title,
      description: meta.ogDescription || meta.description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
      url: meta.canonicalUrl || undefined,
    },
    alternates: meta.canonicalUrl
      ? { canonical: meta.canonicalUrl }
      : undefined,
  };
}

function getPreview(text: string) {
  return (
    text.replace(/<[^>]+>/g, "").slice(0, 100) +
    (text.length > 100 ? "..." : "")
  );
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ serviceId: string; question_title: string }>;
}) {
  const { serviceId, question_title } = await params;
  const result = await getQuestionContentByCategory(serviceId, question_title);
  if (!result.success || !result.data) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center text-2xl text-gray-500">
          Question not found
        </div>
      </Layout>
    );
  }
  const question = result.data;
  const questionTitle =
    question.questionText?.replace(/<[^>]+>/g, "").slice(0, 120) || "Question";
  const correctIdx = question.correctAnswer
    ? question.correctAnswer.charCodeAt(0) - 65
    : 0;

  // Related Questions
  let relatedQuestions: any[] = [];
  try {
    const allQuestionsRes = await getAllQuestions();
    if (allQuestionsRes.success && allQuestionsRes.data) {
      // Helper function to normalize tags (handle both string and array)
      const normalizeTags = (tags: any): string[] => {
        if (Array.isArray(tags)) {
          return tags;
        } else if (typeof tags === "string") {
          return tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);
        }
        return [];
      };

      const currentQuestionTags = normalizeTags(question.tags);

      // Debug: Log current question tags
      console.log("Current question tags:", currentQuestionTags);
      console.log("Current question category:", question.category);

      relatedQuestions = allQuestionsRes.data
        .filter((q: any) => {
          if (q.slug === question.slug) {
            return false;
          }

          const qTags = normalizeTags(q.tags);
          const sharedTags = qTags.filter((tag: string) =>
            currentQuestionTags.includes(tag)
          );

          // Debug: Log comparison details
          console.log(`Comparing with question ${q.slug}:`, {
            qTags,
            sharedTags,
            sharedCount: sharedTags.length,
          });

          return sharedTags.length >= 8;
        })
        .slice(0, 10);

      // Debug: Log final results
      console.log("Related questions found:", relatedQuestions.length);
    }
  } catch (error) {
    console.error("Error loading related questions:", error);
  }

  return (
    <Layout>
      {question.schema && <SchemaScripts schema={question.schema} />}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-14 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/gifs/4.gif')] bg-cover bg-center pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: question.category, href: `/${serviceId}` },
                { label: "Questions", href: `/${serviceId}/question` },
                { label: questionTitle },
              ]}
              className="text-white"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight drop-shadow-lg">
            {questionTitle}
          </h1>
          {question.meta?.description && (
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl animate-fade-in-slow drop-shadow">
              {question.meta.description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/contact"
              className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold shadow-xl hover:bg-yellow-400 transition-colors flex items-center gap-2 text-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H7a1 1 0 00-1 1v9m12 4h-4m0 0V3m0 13v4"
                />
              </svg>
              Get a Free Quote
            </Link>
            <Link
              href="https://wa.me/15795011983"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-200 flex items-center gap-2 text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              WhatsApp
            </Link>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 mb-8">
          {/* Category */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <Link
              href={`/${serviceId}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
            >
              {question.category}
            </Link>
            {/* Tags */}
            {question.tags?.map((tag: string) => (
              <Link
                key={tag}
                href={`/${serviceId}/question?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
          {/* Question Text */}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight">
            {questionTitle}
          </h1>
          {/* Image */}
          {question.image && (
            <div className="mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.image}
                alt="Question visual"
                className="rounded max-h-64 shadow-lg border border-gray-200"
              />
            </div>
          )}
          {/* Answer Options */}
          <div className="mb-8">
            <div className="mb-2 font-semibold text-gray-700">
              Answer Choices
            </div>
            <div className="flex flex-col gap-3">
              {question.answerChoices?.map((choice: string, idx: number) => {
                const isCorrect = idx === correctIdx;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-default select-none
                      ${
                        isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-blue-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={isCorrect}
                      readOnly
                      className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500 cursor-default"
                      tabIndex={-1}
                    />
                    <span
                      className={`inline-block w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center shadow-sm border-2
                      ${
                        [
                          "bg-blue-100 text-blue-700 border-blue-200",
                          "bg-purple-100 text-purple-700 border-purple-200",
                          "bg-green-100 text-green-700 border-green-200",
                          "bg-yellow-100 text-yellow-700 border-yellow-200",
                          "bg-pink-100 text-pink-700 border-pink-200",
                          "bg-indigo-100 text-indigo-700 border-indigo-200",
                        ][idx]
                      }
                    `}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-base text-gray-900">
                      {choice}
                    </span>
                    {isCorrect && (
                      <span className="flex items-center gap-1 text-green-700 font-semibold">
                        <HiOutlineCheckCircle className="w-6 h-6" /> Correct
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          {/* Explanation */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <h2 className="font-bold text-lg text-yellow-700">Explanation</h2>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 text-yellow-900 shadow-sm">
              <RichTextRenderer content={question.explanation} />
            </div>
          </div>
        </div>
        {/* Related Questions */}
        {relatedQuestions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Related Questions
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedQuestions.map((rq) => (
                <div
                  key={rq.id}
                  className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col gap-2 hover:shadow-lg transition-shadow"
                >
                  <Link
                    href={`/${rq.category}/question/${rq.slug}`}
                    className="text-lg font-semibold text-blue-700 hover:underline mb-1"
                  >
                    {rq.questionText?.replace(/<[^>]+>/g, "").slice(0, 80) ||
                      "Question"}
                  </Link>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/${rq.category}`}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                    >
                      {rq.category}
                    </Link>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {getPreview(rq.questionText || "")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
