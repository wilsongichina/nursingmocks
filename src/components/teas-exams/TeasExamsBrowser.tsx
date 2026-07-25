"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type PublicTeasExamQuestion,
  type TeasExamSubject,
} from "@/lib/teas-exams/types";

type SubjectFilter = TeasExamSubject | "English";

type SearchBlock = {
  id: string;
  text: string;
  startIndex: number;
  count: number;
  questionId?: string;
};

type TeasExamsBrowserProps = {
  dataUrl: string;
};

type TeasExamPreviewData = {
  generatedAt?: string;
  questionCount?: number;
  questions?: PublicTeasExamQuestion[];
};

const SUBJECT_FILTERS: SubjectFilter[] = ["Reading", "Mathematics", "Science", "English"];

export default function TeasExamsBrowser({ dataUrl }: TeasExamsBrowserProps) {
  const [questions, setQuestions] = useState<PublicTeasExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>("Reading");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const matchRefs = useRef<Record<number, HTMLElement | null>>({});
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadQuestions() {
      setLoading(true);
      try {
        const response = await fetch(dataUrl, { cache: "force-cache" });
        if (!response.ok) throw new Error("Could not load TEAS questions.");
        const payload = (await response.json()) as TeasExamPreviewData;
        if (!cancelled) setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
      } catch (error) {
        console.warn("TEAS Exams static data could not be loaded", error);
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => {
      return (
        question.subject === selectedSubject ||
        (selectedSubject === "English" && question.subject === "English and Language Usage")
      );
    });
  }, [questions, selectedSubject]);

  const searchBlocks = useMemo(() => buildSearchBlocks(visibleQuestions, selectedSubject, searchTerm), [
    visibleQuestions,
    selectedSubject,
    searchTerm,
  ]);
  const totalMatches = searchBlocks.reduce((total, block) => total + block.count, 0);

  useEffect(() => {
    setActiveMatch(0);
    matchRefs.current = {};
  }, [searchTerm, selectedSubject]);

  useEffect(() => {
    if (!searchTerm || totalMatches === 0) return;
    const activeBlock = searchBlocks.find((block) => activeMatch >= block.startIndex && activeMatch < block.startIndex + block.count);
    const question = activeBlock?.questionId ? questionRefs.current[activeBlock.questionId] : null;
    const match = matchRefs.current[activeMatch];
    (question || match)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeMatch, searchBlocks, searchTerm, totalMatches]);

  const goToMatch = (direction: 1 | -1) => {
    if (totalMatches === 0) return;
    setActiveMatch((current) => (current + direction + totalMatches) % totalMatches);
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    goToMatch(event.shiftKey ? -1 : 1);
  };

  const blockById = new Map(searchBlocks.map((block) => [block.id, block]));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-3">
            <label className="block">
              <span className="sr-only">Find text in questions</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Find text in questions"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-950 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToMatch(-1)}
                disabled={totalMatches === 0}
                className="min-h-10 rounded-lg border border-purple-200 bg-purple-50 px-3 text-sm font-semibold text-purple-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToMatch(1)}
                disabled={totalMatches === 0}
                className="min-h-10 rounded-lg border border-purple-200 bg-purple-50 px-3 text-sm font-semibold text-purple-700 disabled:opacity-50"
              >
                Next
              </button>
              <p className="text-sm font-medium text-gray-600">
                {searchTerm && totalMatches > 0 ? `${activeMatch + 1} of ${totalMatches} matches` : `${totalMatches} matches`}
              </p>
            </div>

            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex min-w-max gap-2">
                {SUBJECT_FILTERS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                      selectedSubject === subject
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-gray-500">
              Searching {selectedSubject} - {visibleQuestions.length} visible question{visibleQuestions.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-5 pt-56 sm:pt-52">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            Loading TEAS questions.
          </div>
        ) : visibleQuestions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            No visible questions are available for this subject.
          </div>
        ) : (
          <QuestionGroups
            questions={visibleQuestions}
            blocks={blockById}
            searchTerm={searchTerm}
            activeMatch={activeMatch}
            matchRefs={matchRefs}
            questionRefs={questionRefs}
          />
        )}
      </main>
    </div>
  );
}

function QuestionGroups({
  questions,
  blocks,
  searchTerm,
  activeMatch,
  matchRefs,
  questionRefs,
}: {
  questions: PublicTeasExamQuestion[];
  blocks: Map<string, SearchBlock>;
  searchTerm: string;
  activeMatch: number;
  matchRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  questionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}) {
  const grouped = groupQuestions(questions);

  return (
    <div className="space-y-6">
      {grouped.map((subjectGroup) => (
        <section key={subjectGroup.subject} className="space-y-3">
          <h2 className="text-lg font-bold text-gray-950">
            <HighlightedText
              block={blocks.get(`subject:${subjectGroup.subject}`)}
              fallback={`TEAS 7 ${subjectGroup.subject}`}
              searchTerm={searchTerm}
              activeMatch={activeMatch}
              matchRefs={matchRefs}
            />
          </h2>
          <div className="space-y-3">
              {subjectGroup.questions.map((question) => (
                <article
                  key={question.id}
                  ref={(element) => {
                    questionRefs.current[question.id] = element;
                  }}
                  className="scroll-mt-56 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:scroll-mt-52"
                >
                  <h4 className="mb-3 text-sm font-bold text-gray-950">
                    <HighlightedText
                      block={blocks.get(`question-heading:${question.id}`)}
                      fallback={`Set ${question.setNumber} - Question ${question.questionNumber || ""}`}
                      searchTerm={searchTerm}
                      activeMatch={activeMatch}
                      matchRefs={matchRefs}
                    />
                  </h4>
                  {question.passageText && (
                    <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm leading-6 text-gray-800">
                      <p className="mb-1 font-semibold text-purple-800">Passage</p>
                      <HighlightedText
                        block={blocks.get(`passage:${question.id}`)}
                        fallback={question.passageText}
                        searchTerm={searchTerm}
                        activeMatch={activeMatch}
                        matchRefs={matchRefs}
                      />
                    </div>
                  )}
                  <p className="text-base leading-7 text-gray-950">
                    <HighlightedText
                      block={blocks.get(`question:${question.id}`)}
                      fallback={question.questionText}
                      searchTerm={searchTerm}
                      activeMatch={activeMatch}
                      matchRefs={matchRefs}
                    />
                  </p>
                  {question.choices.length > 0 && (
                    <ol className="mt-3 space-y-2">
                      {question.choices.map((choice, index) => (
                        <li
                          key={`${question.id}-${choice}-${index}`}
                          className={`rounded-lg border px-3 py-2 text-sm leading-6 ${
                            isCorrectChoice(question, choice, index)
                              ? "border-green-300 bg-green-50 text-green-900"
                              : "border-gray-200 bg-gray-50 text-gray-800"
                          }`}
                        >
                          <HighlightedText
                            block={blocks.get(`choice:${question.id}:${index}`)}
                            fallback={choice}
                            searchTerm={searchTerm}
                            activeMatch={activeMatch}
                            matchRefs={matchRefs}
                          />
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function HighlightedText({
  block,
  fallback,
  searchTerm,
  activeMatch,
  matchRefs,
}: {
  block: SearchBlock | undefined;
  fallback: string;
  searchTerm: string;
  activeMatch: number;
  matchRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
}) {
  const text = block?.text ?? fallback;
  const query = searchTerm.trim();
  if (!query || !block || block.count === 0) return <>{text}</>;

  const parts = splitMatches(text, query);
  let matchOffset = 0;
  return (
    <>
      {parts.map((part, index) => {
        if (!part.match) return <span key={`${part.text}-${index}`}>{part.text}</span>;
        const globalIndex = block.startIndex + matchOffset;
        matchOffset += 1;
        return (
          <mark
            key={`${part.text}-${index}-${globalIndex}`}
            ref={(element) => {
              matchRefs.current[globalIndex] = element;
            }}
            className={globalIndex === activeMatch ? "rounded bg-purple-600 px-0.5 text-white" : "rounded bg-yellow-200 px-0.5 text-gray-950"}
          >
            {part.text}
          </mark>
        );
      })}
    </>
  );
}

function buildSearchBlocks(
  questions: PublicTeasExamQuestion[],
  selectedSubject: SubjectFilter,
  searchTerm: string
) {
  const grouped = groupQuestions(questions);
  let cursor = 0;
  const blocks: SearchBlock[] = [];
  const add = (id: string, text: string, questionId?: string) => {
    const count = countMatches(text, searchTerm);
    blocks.push({ id, text, startIndex: cursor, count, questionId });
    cursor += count;
  };

  grouped.forEach((subjectGroup) => {
    add(`subject:${subjectGroup.subject}`, `TEAS 7 ${subjectGroup.subject}`);
      subjectGroup.questions.forEach((question) => {
        add(`question-heading:${question.id}`, `Set ${question.setNumber} - Question ${question.questionNumber || ""}`, question.id);
        if (question.passageText) add(`passage:${question.id}`, question.passageText, question.id);
        add(`question:${question.id}`, question.questionText, question.id);
        question.choices.forEach((choice, index) => add(`choice:${question.id}:${index}`, choice, question.id));
      });
  });

  if (questions.length === 0) {
    add("empty", `${selectedSubject}`);
  }

  return blocks;
}

function groupQuestions(questions: PublicTeasExamQuestion[]) {
  const subjects = Array.from(new Set(questions.map((question) => question.subject)));
  return subjects.map((subject) => ({
    subject,
    questions: questions.filter((question) => question.subject === subject),
  }));
}

function isCorrectChoice(question: PublicTeasExamQuestion, choice: string, index: number) {
  const label = String.fromCharCode(65 + index);
  if (question.correctAnswerLabels.map((answer) => answer.toUpperCase()).includes(label)) return true;
  return Boolean(question.correctAnswerText) && question.correctAnswerText.trim().toLowerCase() === choice.trim().toLowerCase();
}

function countMatches(text: string, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;
  let count = 0;
  let fromIndex = 0;
  const haystack = text.toLowerCase();
  while (true) {
    const index = haystack.indexOf(needle, fromIndex);
    if (index < 0) break;
    count += 1;
    fromIndex = index + needle.length;
  }
  return count;
}

function splitMatches(text: string, query: string) {
  const needle = query.trim();
  if (!needle) return [{ text, match: false }];
  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const parts: Array<{ text: string; match: boolean }> = [];
  let fromIndex = 0;
  while (true) {
    const index = lowerText.indexOf(lowerNeedle, fromIndex);
    if (index < 0) break;
    if (index > fromIndex) parts.push({ text: text.slice(fromIndex, index), match: false });
    parts.push({ text: text.slice(index, index + needle.length), match: true });
    fromIndex = index + needle.length;
  }
  if (fromIndex < text.length) parts.push({ text: text.slice(fromIndex), match: false });
  return parts;
}
