import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import QuestionCard from "@/components/quiz/QuestionCard";
import ContentRenderer from "@/components/ui/ContentRenderer";
import {
  getNursingEntranceExamQuiz,
  getNursingEntranceExamQuizQuestions,
  getNursingEntranceExamSubPage,
  getNestedSubPage,
  getNursingEntranceExamSubPages,
  getAllQuestionTypes,
} from "@/lib/firestore-operations";

// Enable static generation at build time
export const dynamicParams = false; // Disable dynamic params - all routes must be pre-generated
export const dynamic = "force-static"; // Force static generation
export const revalidate = 3600; // Revalidate every hour (ISR)

// Generate static params for all quiz routes at build time
export async function generateStaticParams() {
  const params: { subPageId: string; quizId: string }[] = [];

  try {
    // Import all necessary functions
    const {
      getNursingEntranceExamSubPages,
      getNestedSubPages,
      getNursingEntranceExamQuizzes,
    } = await import("@/lib/firestore-operations");

    // Get all entrance exam sub-pages
    const entranceSubPages = await getNursingEntranceExamSubPages();
    if (entranceSubPages.success && entranceSubPages.data) {
      for (const parentSubPage of entranceSubPages.data) {
        const parentId = parentSubPage.id || parentSubPage.subPageId;
        const parentSlug = parentSubPage.slug || parentId;
        // Remove -exam suffix if present for nested URLs
        const parentUrlSlug = parentSlug.endsWith("-exam")
          ? parentSlug.slice(0, -5)
          : parentSlug;

        // Get all nested sub-pages for this parent
        const nestedSubPages = await getNestedSubPages(parentId);
        if (nestedSubPages.success && nestedSubPages.data) {
          for (const nestedSubPage of nestedSubPages.data) {
            const nestedId = nestedSubPage.id || nestedSubPage.nestedSubPageId;
            const nestedSlug = nestedSubPage.slug || nestedId;
            const subPageId = `${parentUrlSlug}-${nestedSlug}-questions`;

            // Get all quizzes for this nested sub-page
            const quizzesResult = await getNursingEntranceExamQuizzes(
              parentId,
              nestedId
            );
            if (quizzesResult.success && quizzesResult.data) {
              for (const quiz of quizzesResult.data) {
                const quizSlug = quiz.slug || quiz.id || quiz.quizId;
                params.push({
                  subPageId,
                  quizId: quizSlug,
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `[Static Generation] Generated ${params.length} static params for [subPageId]/[quizId] route`
    );
  } catch (error) {
    console.error(
      "[Static Generation] Error generating static params for quizzes:",
      error
    );
    // Return empty array on error - pages will be generated on-demand
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subPageId: string; quizId: string }>;
}): Promise<Metadata> {
  const { subPageId, quizId } = await params;

  // Parse the subPageId to extract parent and nested sub-page IDs
  const entranceExamNestedMatch = subPageId.match(/^(.+)-(.+)-questions$/);
  if (!entranceExamNestedMatch) {
    return {
      title: "Quiz Not Found | TeasGurus",
      description: "Quiz page not found",
    };
  }

  let parentSubPageId = entranceExamNestedMatch[1];
  const nestedSubPageId = entranceExamNestedMatch[2];

  // Try to find parent sub-page
  let parentResult = await getNursingEntranceExamSubPage(parentSubPageId);
  if (!parentResult.success || !parentResult.data) {
    parentResult = await getNursingEntranceExamSubPage(parentSubPageId + "-exam");
    if (parentResult.success && parentResult.data) {
      parentSubPageId = parentSubPageId + "-exam";
    } else {
      // Try to find by slug
      const allSubPagesResult = await getNursingEntranceExamSubPages();
      if (allSubPagesResult.success && allSubPagesResult.data) {
        const foundParent = allSubPagesResult.data.find((subPage: any) => {
          const subPageSlug = (subPage.slug || subPage.id || "").toLowerCase();
          return subPageSlug === parentSubPageId.toLowerCase();
        });
        if (foundParent) {
          parentSubPageId = foundParent.id || foundParent.subPageId;
        }
      }
    }
  }

  // Get quiz data
  const quizResult = await getNursingEntranceExamQuiz(
    parentSubPageId,
    nestedSubPageId,
    quizId
  );

  if (quizResult.success && quizResult.data) {
    const quizData = quizResult.data as any;
    const meta = quizData.meta || {};

    return {
      title: meta.title || `${quizData.pageName || quizId} | TeasGurus`,
      description: meta.description || `Quiz: ${quizData.pageName || quizId}`,
      keywords: meta.keywords || "",
      openGraph: {
        title: meta.ogTitle || meta.title || `${quizData.pageName || quizId} | TeasGurus`,
        description: meta.ogDescription || meta.description || "",
        url: meta.canonicalUrl || `https://teasgurus.com/${subPageId}/${quizId}`,
        images: [
          {
            url: meta.ogImage || "/teas-gurus-logo.png",
            width: 1200,
            height: 630,
            alt: meta.ogTitle || quizData.pageName || quizId,
          },
        ],
      },
      alternates: {
        canonical: meta.canonicalUrl || `/${subPageId}/${quizId}`,
      },
    };
  }

  return {
    title: "Quiz | TeasGurus",
    description: "Quiz page",
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ subPageId: string; quizId: string }>;
}) {
  const { subPageId, quizId } = await params;

  // Parse the subPageId to extract parent and nested sub-page IDs
  const entranceExamNestedMatch = subPageId.match(/^(.+)-(.+)-questions$/);
  if (!entranceExamNestedMatch) {
    notFound();
  }

  let parentSubPageId = entranceExamNestedMatch[1];
  const nestedSubPageId = entranceExamNestedMatch[2];

  // Try to find parent sub-page
  let parentResult = await getNursingEntranceExamSubPage(parentSubPageId);
  if (!parentResult.success || !parentResult.data) {
    parentResult = await getNursingEntranceExamSubPage(parentSubPageId + "-exam");
    if (parentResult.success && parentResult.data) {
      parentSubPageId = parentSubPageId + "-exam";
    } else {
      // Try to find by slug
      const allSubPagesResult = await getNursingEntranceExamSubPages();
      if (allSubPagesResult.success && allSubPagesResult.data) {
        const foundParent = allSubPagesResult.data.find((subPage: any) => {
          const subPageSlug = (subPage.slug || subPage.id || "").toLowerCase();
          return subPageSlug === parentSubPageId.toLowerCase();
        });
        if (foundParent) {
          parentSubPageId = foundParent.id || foundParent.subPageId;
          parentResult = await getNursingEntranceExamSubPage(parentSubPageId);
        }
      }
    }
  }

  if (!parentResult.success || !parentResult.data) {
    notFound();
  }

  // Get nested sub-page
  const nestedResult = await getNestedSubPage(parentSubPageId, nestedSubPageId);
  if (!nestedResult.success || !nestedResult.data) {
    notFound();
  }

  // Get quiz data
  const quizResult = await getNursingEntranceExamQuiz(
    parentSubPageId,
    nestedSubPageId,
    quizId
  );

  if (!quizResult.success || !quizResult.data) {
    notFound();
  }

  const quizData = quizResult.data as any;

  // Get question types for mapping
  const questionTypesResult = await getAllQuestionTypes();
  const questionTypes = questionTypesResult.success && questionTypesResult.data
    ? questionTypesResult.data
    : [];

  // Helper function to get question type name
  const getQuestionTypeName = (questionTypeId: number): string => {
    if (!questionTypeId) return "Unknown";
    const type = questionTypes.find(
      (t: any) => t.questionTypeId === questionTypeId.toString()
    );
    return type?.questionTypeName || `Type ${questionTypeId}`;
  };

  // Get quiz questions
  const questionsResult = await getNursingEntranceExamQuizQuestions(
    parentSubPageId,
    nestedSubPageId,
    quizId
  );

  // Filter questions to only show types 1, 2, 3, and 7
  const allowedQuestionTypes = [1, 2, 3, 7];
  const allQuestions = questionsResult.success && questionsResult.data
    ? questionsResult.data
    : [];
  
  const questions = allQuestions.filter((question: any) => {
    const questionTypeId = question.questionTypeId || question.question_type_id;
    return allowedQuestionTypes.includes(questionTypeId);
  });


  return (
    <Layout>
      {/* Schema Script */}
      {quizData.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: quizData.schema,
          }}
        />
      )}

      {/* Hero Section */}
      <section className="bg-white py-[1.25rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {quizData.hero?.title || quizData.pageName || quizId}
            </h1>
            {quizData.hero?.description && (
              <div className="text-gray-600 text-base leading-relaxed">
                <ContentRenderer content={quizData.hero.description || ""} />
              </div>
            )}
          </div>

          {/* Start Test button */}
          {questions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="#quiz-questions"
                className="bg-yellow-500 text-gray-900 px-[3.75rem] py-4 rounded-lg text-[2rem] font-bold hover:bg-yellow-400 transition-colors text-center"
              >
                Start Test
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Quiz Content */}
      <section id="quiz-questions" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {questions.length === 0 ? (
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions available
              </h3>
              <p className="text-gray-600">
                Questions for this quiz are not available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {questions.map((question: any, index: number) => {
                const questionTypeId = question.questionTypeId || question.question_type_id || 1;
                
                // Parse options - handle both array and stringified array
                let options: string[] = [];
                if (question.options) {
                  if (Array.isArray(question.options)) {
                    options = question.options;
                  } else if (typeof question.options === "string") {
                    try {
                      const parsed = JSON.parse(question.options);
                      options = Array.isArray(parsed) ? parsed : [parsed];
                    } catch {
                      // If not JSON, treat as single option
                      options = [question.options];
                    }
                  }
                }
                
                const correctAnswer = question.correctAnswer || "";
                
                // Parse correct answer based on question type
                let correctAnswers: string[] = [];
                if (questionTypeId === 2) {
                  // Multiple choice - correct answer is JSON array string
                  try {
                    const parsed = typeof correctAnswer === "string" ? JSON.parse(correctAnswer) : correctAnswer;
                    correctAnswers = Array.isArray(parsed) ? parsed : [];
                  } catch {
                    correctAnswers = [];
                  }
                } else if (questionTypeId === 7) {
                  // Numeric - correct answer is array
                  correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
                } else {
                  // Single choice or True/False
                  correctAnswers = [correctAnswer];
                }
                
                return (
                  <QuestionCard
                    key={question.id || index}
                    question={question}
                    index={index}
                    questionTypeId={questionTypeId}
                    options={options}
                    correctAnswers={correctAnswers}
                    questionTypeName={getQuestionTypeName(questionTypeId)}
                    totalQuestions={questions.length}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

