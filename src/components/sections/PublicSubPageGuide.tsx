"use client";

import { useState } from "react";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";
import { QuizCardRenderer } from "@/components/editor/QuizCardRenderer";

export interface PublicSubPageGuideSection {
  id: string;
  title: string;
  content: string;
  contentParts?: Array<
    | { type: "html"; html: string }
    | { type: "quizCard"; key: string; quizTitle: string; questions: any[] }
  >;
}

interface PublicSubPageGuideProps {
  title: string;
  description: string;
  sections: PublicSubPageGuideSection[];
}

export default function PublicSubPageGuide({
  title,
  description,
  sections,
}: PublicSubPageGuideProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = sections[activeIndex] || sections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <section id="content" className="public-guide-section">
      <div className="mx-auto mb-5 flex max-w-3xl flex-col items-center gap-3 text-center">
        <h2 className="user-section-title public-section-heading mt-2">
          {title}
        </h2>
        <p className="user-helper max-w-2xl text-base">{description}</p>
      </div>

      <article className="public-guide-shell">
        <div className="public-guide-layout">
          <nav className="public-guide-nav" aria-label={`${title} sections`}>
            <div className="public-guide-nav-title">In this guide</div>
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`public-guide-tab ${
                  activeIndex === index ? "public-guide-tab-active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-current={activeIndex === index ? "true" : undefined}
              >
                {section.title}
              </button>
            ))}
          </nav>

          <div className="public-guide-content">
            <h3 id={activeSection.id}>{activeSection.title}</h3>
            <div className="public-tiptap-content public-guide-article">
              {activeSection.contentParts?.length ? (
                activeSection.contentParts.map((part, index) => {
                  if (part.type === "quizCard") {
                    return (
                      <QuizCardRenderer
                        key={part.key}
                        questions={part.questions}
                        quizTitle={part.quizTitle}
                        isEditable={false}
                      />
                    );
                  }

                  return (
                    <TiptapContentRenderer
                      key={`html-${index}`}
                      content={part.html}
                    />
                  );
                })
              ) : (
                <TiptapContentRenderer content={activeSection.content} />
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
