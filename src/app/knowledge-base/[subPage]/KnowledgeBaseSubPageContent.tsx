import Link from "next/link";

// Helper function to strip HTML tags and get plain text
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, "");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return text.trim().replace(/\s+/g, " ");
};

type SubPageData = Record<string, unknown> & {
  id?: string;
  pageName?: string;
  title?: string;
  heading?: string;
  description?: string;
  hero?: { title?: string; description?: string };
};

type KbArticle = Record<string, unknown> & {
  id?: string;
  pageName?: string;
  title?: string;
  heading?: string;
  slug?: string;
  description?: string;
  hero?: { title?: string; description?: string };
};

interface KnowledgeBaseSubPageContentProps {
  subPageSlug: string;
  subPage: SubPageData | null;
  kbArticles: KbArticle[];
}

export default function KnowledgeBaseSubPageContent({
  subPageSlug,
  subPage,
  kbArticles,
}: KnowledgeBaseSubPageContentProps) {
  const pageName =
    subPage?.pageName ||
    subPage?.hero?.title ||
    subPage?.title ||
    subPage?.heading ||
    subPageSlug ||
    "Knowledge Base";
  const description = subPage?.description || subPage?.hero?.description || "";

  if (!subPage) {
    return (
      <div className="text-center py-10">
        <div className="text-sm text-[#6b7280]">Sub-page not found.</div>
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="relative rounded-[32px] p-[26px_36px] grid grid-cols-[minmax(0,1.55fr)_minmax(0,1.1fr)] gap-[26px] items-center text-[#0f172a] bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#e9d5ff_36%,#eef2ff_72%,#f4f4ff_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden mb-[26px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] lg:p-[22px_24px_24px] md:grid-cols-1 md:p-5 md:rounded-3xl">
        <div className="absolute w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.24),transparent_70%)] -right-[120px] -top-40 opacity-90 pointer-events-none" />

        <div className="relative z-10 pr-2.5">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-[rgba(15,23,42,0.06)] backdrop-blur-[6px] text-[11px] uppercase tracking-[0.16em] text-[#0f172a] mb-3">
            <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
            <span>{pageName} · Knowledge Base</span>
          </div>

          <h1 className="text-[30px] leading-[1.16] font-extrabold mb-2.5 sm:text-2xl">
            Master The <span className="text-[#2563eb]">{pageName}</span>
            <br />
            With <span className="text-[#8b5cf6]">Clear, Realistic Guides</span>
          </h1>

          <p className="text-sm leading-[1.7] text-[#0f172a] max-w-[580px] mb-4">
            {description
              ? stripHtmlTags(String(description))
              : `Learn how ${pageName} works without guessing. This page focuses on the big-picture side: what's on the exam, how scoring works, how to register, and how to build a practical study plan.`}
          </p>

          <div className="flex flex-wrap gap-2 mb-[18px]">
            <div className="inline-flex items-center gap-1.5 py-1 px-[11px] rounded-full bg-[rgba(255,255,255,0.96)] border border-[rgba(255,255,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
              <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
              Aligned With Current Blueprint
            </div>
            <div className="inline-flex items-center gap-1.5 py-1 px-[11px] rounded-full bg-[rgba(255,255,255,0.96)] border border-[rgba(255,255,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
              <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
              Comprehensive Guides &amp; FAQs
            </div>
            <div className="inline-flex items-center gap-1.5 py-1 px-[11px] rounded-full bg-[rgba(255,255,255,0.96)] border border-[rgba(255,255,255,0.9)] text-[11.5px] text-[#4b5563] shadow-[0_6px_16px_rgba(15,23,42,0.12)] whitespace-nowrap">
              <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
              Connects Directly To Practice Sets
            </div>
          </div>

          <div className="flex flex-row gap-2.5 items-center mb-1.5">
            <a
              href="#categories"
              className="flex items-center justify-center gap-2 py-[9px] px-[18px] rounded-full border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.96)] text-[13px] font-medium text-[#111827] no-underline shadow-[0_8px_20px_rgba(15,23,42,0.12)] whitespace-nowrap hover:bg-[#eef2ff]"
            >
              <span>Browse Article Categories</span>
            </a>
          </div>

          <p className="text-[11.5px] text-[#6b7280] max-w-[560px] mt-0.5">
            One login. Your guides, practice tests, and mastery analytics all live
            under the same NursingMocks account.
          </p>
        </div>

        <div className="relative z-10 md:max-w-[420px] md:mx-auto md:mt-1">
          <div className="max-w-[420px] w-full bg-white rounded-[22px] p-4 pb-[18px] shadow-[0_16px_40px_rgba(15,23,42,0.16)] border border-[rgba(148,163,184,0.45)]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#4b5563]">
                {pageName} KB Snapshot
              </div>
              <div className="text-[11px] py-1 px-2.5 rounded-full bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] whitespace-nowrap">
                Active Learning
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 gap-x-3 mb-3">
              <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                  Articles Read
                </div>
                <div className="text-base font-bold mb-0.5">7</div>
                <div className="text-[11.5px] text-[#6b7280]">Last 7 days</div>
              </div>
              <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                  Most Viewed
                </div>
                <div className="text-base font-bold mb-0.5">Basics</div>
                <div className="text-[11.5px] text-[#6b7280]">Getting Started</div>
              </div>
              <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                  Practice Started
                </div>
                <div className="text-base font-bold mb-0.5">5</div>
                <div className="text-[11.5px] text-[#6b7280]">From KB articles</div>
              </div>
              <div className="rounded-[14px] border border-[#e5e7eb] p-2 pb-2.5 bg-[#f9fafb]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-1">
                  Your Focus
                </div>
                <div className="text-base font-bold mb-0.5">Study</div>
                <div className="text-[11.5px] text-[#6b7280]">Preparation guides</div>
              </div>
            </div>

            <div className="text-[11px] uppercase tracking-[0.14em] text-[#9ca3af] mb-1">
              Knowledge Base coverage for your plan
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-[72%] bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="text-[13px] mb-3">
        ←{" "}
        <Link
          href="/knowledge-base"
          className="text-[#2563eb] no-underline hover:underline"
        >
          Back to Knowledge Base Hub
        </Link>
      </div>

      {kbArticles.length > 0 && (
        <>
          <div
            className="text-xs uppercase tracking-[0.16em] text-[#6b7280] my-1 mb-1.5"
            id="categories"
          >
            Articles
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            {kbArticles.map((article, index) => {
              const articleName =
                article.pageName ||
                article.hero?.title ||
                article.title ||
                article.heading ||
                article.slug ||
                "Untitled Article";
              const articleDescription =
                article.description || article.hero?.description || "";
              const articleSlug = article.slug || article.id;
              const articleUrl = articleSlug ? `/${articleSlug}` : "#";

              return (
                <article
                  key={(article.id as string) || index}
                  className="bg-white rounded-[22px] border border-[#e0e7ff] p-4 pb-3.5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280] mb-1">
                    {index + 1} • Article
                  </div>
                  <h2 className="text-lg font-[640] mb-1.5">
                    <Link
                      href={articleUrl}
                      className="text-[#0f172a] no-underline hover:text-[#2563eb] hover:underline"
                    >
                      {String(articleName)}
                    </Link>
                  </h2>
                  {articleDescription ? (
                    <p className="text-[13px] text-[#6b7280] mb-2 leading-[1.6]">
                      {stripHtmlTags(String(articleDescription))}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <Link
                      href={articleUrl}
                      className="text-[#2563eb] text-[13px] font-medium no-underline hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      {kbArticles.length === 0 && (
        <div className="text-center py-10">
          <div className="text-sm text-[#6b7280]">
            No articles found for this sub page.
          </div>
        </div>
      )}
    </>
  );
}
