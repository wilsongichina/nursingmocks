"use client";

import Link from "next/link";
import { useMemo, useEffect } from "react";
import TiptapContentRenderer from "@/components/editor/TiptapContentRenderer";

interface KbArticleViewerProps {
  article: any;
  pillarId?: string;
}

export default function KbArticleViewer({
  article,
  pillarId = "nursing-entrance-exam",
}: KbArticleViewerProps) {
  // Extract article data with defaults
  const pageName = article?.pageName || article?.hero?.title || article?.heading || "Knowledge Base Article";
  const description = article?.hero?.description || article?.description || "";
  const version = article?.version || "ATI TEAS 7";
  const bodyContent = article?.bodyContent || "";
  
  // Extract title for display - prioritize heading (Display title H1) over pageName
  const displayTitle = article?.heading || article?.hero?.title || article?.pageName || pageName;

  // Generate table of contents from headings in bodyContent
  const toc = useMemo(() => {
    if (!bodyContent) return [];
    
    try {
      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(bodyContent, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      const tocItems: Array<{ id: string; title: string; level: number }> = [];
      headings.forEach((heading, index) => {
        const id = heading.id || heading.getAttribute('id') || `heading-${index}`;
        const title = heading.textContent?.trim() || '';
        const level = parseInt(heading.tagName.charAt(1));
        
        // If heading doesn't have an ID, add one
        if (!heading.id && !heading.getAttribute('id')) {
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          heading.id = slug || `heading-${index}`;
        }
        
        tocItems.push({
          id: heading.id || id,
          title,
          level,
        });
      });
      
      return tocItems;
    } catch (error) {
      console.error('Error generating TOC:', error);
      return [];
    }
  }, [bodyContent]);

  // Get pillar display name
  const pillarName = useMemo(() => {
    const names: Record<string, string> = {
      "nursing-entrance-exam": "Nursing Entrance Exam",
      "nursing-exit-exam": "Nursing Exit Exam",
      "nursing-test-bank": "Nursing Test Bank",
    };
    return names[pillarId] || "Knowledge Base";
  }, [pillarId]);

  // Add IDs to headings after content is rendered
  useEffect(() => {
    if (!bodyContent) return;
    
    const articleContent = document.getElementById('article-content');
    if (!articleContent) return;
    
    const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        const title = heading.textContent?.trim() || '';
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        heading.id = slug || `heading-${index}`;
      }
    });
  }, [bodyContent]);

  // Add smooth scroll behavior on mount
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div 
      className="min-h-screen w-full text-[#1a1a1a] py-[14px] px-3 md:py-[22px] md:px-[18px] pb-[30px] md:pb-10"
      style={{
        background: `
          radial-gradient(1000px 380px at 10% 10%, rgba(106, 92, 255, 0.18), transparent 60%),
          radial-gradient(900px 340px at 92% 18%, rgba(106, 92, 255, 0.14), transparent 55%),
          radial-gradient(1200px 520px at 50% 110%, rgba(106, 92, 255, 0.1), transparent 60%),
          #f5f6fb
        `
      }}
    >
      <div className="w-full">
        {/* HERO SECTION */}
        <section 
          className="relative rounded-[26px] md:rounded-[34px] overflow-hidden border border-[rgba(148,163,184,0.35)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-4 md:p-[26px] pb-4 md:pb-[22px] mb-[18px] text-[#1a1a1a]"
          style={{
            background: `
              radial-gradient(1200px 420px at 12% 20%, rgba(106, 92, 255, 0.22), transparent 58%),
              radial-gradient(900px 360px at 88% 20%, rgba(138, 107, 255, 0.2), transparent 55%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 247, 255, 0.95))
            `
          }}
          aria-label="Knowledge Base Hero"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)] gap-[18px] items-start text-[#1a1a1a]">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-[10px] py-[7px] px-3 rounded-full border border-[rgba(148,163,184,0.45)] bg-[rgba(255,255,255,0.65)] text-[#7a819c] text-xs tracking-[0.12em] uppercase w-fit">
                <span 
                  className="w-2 h-2 rounded-full bg-[#22c55e]"
                  style={{ boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.12)' }}
                ></span>
                <span>Knowledge Base Hub • {pillarName} Guides</span>
              </div>

              <h1 className="my-[14px] mt-[14px] mb-[10px] text-[28px] md:text-[40px] leading-[1.08] tracking-[-0.03em] font-[820] text-[#1a1a1a]">
                {displayTitle}
              </h1>

              <p className="m-0 max-w-[760px] text-sm leading-[1.75] text-[#1a1a1a]">
                {description}
              </p>

              <ul className="flex flex-wrap gap-[10px] my-[14px] mb-4 p-0 list-none">
                <li className="inline-flex items-center gap-[10px] py-2 px-3 rounded-full border border-[rgba(148,163,184,0.45)] bg-[rgba(255,255,255,0.7)] text-[#1a1a1a] text-xs shadow-[0_8px_18px_rgba(15,23,42,0.06)] whitespace-nowrap">
                  <span 
                    className="w-2 h-2 rounded-full bg-[#22c55e]"
                    style={{ boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.12)' }}
                  ></span>
                  Sections • timing • scoring basics (fast overview)
                </li>
                <li className="inline-flex items-center gap-[10px] py-2 px-3 rounded-full border border-[rgba(148,163,184,0.45)] bg-[rgba(255,255,255,0.7)] text-[#1a1a1a] text-xs shadow-[0_8px_18px_rgba(15,23,42,0.06)] whitespace-nowrap">
                  <span 
                    className="w-2 h-2 rounded-full bg-[#22c55e]"
                    style={{ boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.12)' }}
                  ></span>
                  Updated for {version} blueprint
                </li>
                <li className="inline-flex items-center gap-[10px] py-2 px-3 rounded-full border border-[rgba(148,163,184,0.45)] bg-[rgba(255,255,255,0.7)] text-[#1a1a1a] text-xs shadow-[0_8px_18px_rgba(15,23,42,0.06)] whitespace-nowrap">
                  <span 
                    className="w-2 h-2 rounded-full bg-[#22c55e]"
                    style={{ boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.12)' }}
                  ></span>
                  Best starting point before skill practice
                </li>
              </ul>

              <div className="flex gap-3 flex-wrap mt-1">
                <a 
                  className="border-0 cursor-pointer font-bold rounded-full py-3 px-4 text-[13px] inline-flex items-center gap-[10px] transition-[0.15s] ease-linear no-underline select-none text-white bg-gradient-to-r from-[#6a5cff] to-[#8a6bff] shadow-[0_14px_26px_rgba(106,92,255,0.22)] hover:-translate-y-[1px] hover:bg-gradient-to-r hover:from-[#5a4cef] hover:to-[#7a5bef]" 
                  href="#search" 
                  role="button" 
                  aria-label="Start quick search"
                >
                  <span className="w-[18px] h-[18px] inline-grid place-items-center rounded-full bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.22)]">🔎</span>
                  Start With A Quick Search
                </a>
                <Link 
                  className="border border-[rgba(148,163,184,0.55)] cursor-pointer font-bold rounded-full py-3 px-4 text-[13px] inline-flex items-center gap-[10px] transition-[0.15s] ease-linear no-underline select-none text-[#1a1a1a] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.07)] hover:-translate-y-[1px]" 
                  href="/knowledge-base" 
                  role="button" 
                  aria-label="Browse TEAS knowledge base hubs"
                >
                  Browse TEAS Knowledge Base Hubs
                </Link>
              </div>

              <p className="mt-[10px] mb-0 text-xs text-[#7a819c] max-w-[560px]">
                One login. Your practice, mastery scores, and Knowledge Base articles all live under the same NursingMocks account.
              </p>
            </div>

            {/* Right Snapshot */}
            <aside className="rounded-[22px] border border-[rgba(148,163,184,0.5)] bg-[rgba(255,255,255,0.78)] shadow-[0_10px_26px_rgba(15,23,42,0.08)] p-[14px] pb-3 overflow-hidden" aria-label="Help and study snapshot">
              <div className="flex items-center justify-between gap-[10px] mb-[10px]">
                <div className="text-xs tracking-[0.14em] uppercase text-[#7a819c] font-extrabold">Help & Article Snapshot</div>
                <div className="py-[6px] px-[10px] rounded-full text-xs border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] text-[#166534] whitespace-nowrap">Version: {version}</div>
              </div>

              <div className="grid grid-cols-2 gap-[10px] mt-[10px]">
                <div className="rounded-2xl border border-[rgba(148,163,184,0.45)] bg-white p-3 pb-[10px] min-h-[78px]">
                  <div className="text-[11px] tracking-[0.14em] uppercase text-[#a0a5bf] mb-[6px] font-extrabold">Total questions</div>
                  <div className="text-xl font-black tracking-[-0.02em] text-[#1a1a1a] mb-[2px]">170</div>
                  <div className="text-xs text-[#7a819c] leading-[1.4]">Full exam question count</div>
                </div>

                <div className="rounded-2xl border border-[rgba(148,163,184,0.45)] bg-white p-3 pb-[10px] min-h-[78px]">
                  <div className="text-[11px] tracking-[0.14em] uppercase text-[#a0a5bf] mb-[6px] font-extrabold">Scored questions</div>
                  <div className="text-xl font-black tracking-[-0.02em] text-[#1a1a1a] mb-[2px]">150</div>
                  <div className="text-xs text-[#7a819c] leading-[1.4]">Pretest items excluded</div>
                </div>

                <div className="rounded-2xl border border-[rgba(148,163,184,0.45)] bg-white p-3 pb-[10px] min-h-[78px]">
                  <div className="text-[11px] tracking-[0.14em] uppercase text-[#a0a5bf] mb-[6px] font-extrabold">Exam time</div>
                  <div className="text-xl font-black tracking-[-0.02em] text-[#1a1a1a] mb-[2px]">209</div>
                  <div className="text-xs text-[#7a819c] leading-[1.4]">Minutes total testing time</div>
                </div>

                <div className="rounded-2xl border border-[rgba(148,163,184,0.45)] bg-white p-3 pb-[10px] min-h-[78px]">
                  <div className="text-[11px] tracking-[0.14em] uppercase text-[#a0a5bf] mb-[6px] font-extrabold">Sections</div>
                  <div className="text-xl font-black tracking-[-0.02em] text-[#1a1a1a] mb-[2px]">4</div>
                  <div className="text-xs text-[#7a819c] leading-[1.4]">Reading, Math, Science, English</div>
                </div>
              </div>

              <div className="my-3 mt-3 mb-[10px] border-t border-dashed border-[rgba(148,163,184,0.7)]"></div>

              <div className="text-[11px] tracking-[0.14em] uppercase text-[#a0a5bf] font-extrabold mb-2">Knowledge Base coverage for this guide</div>
              <div className="h-[7px] rounded-full bg-[rgba(148,163,184,0.35)] overflow-hidden" aria-hidden="true">
                <span className="block h-full w-[72%] bg-gradient-to-r from-[#6a5cff] to-[#8a6bff] rounded-full"></span>
              </div>
            </aside>
          </div>
        </section>

        {/* MOBILE ONLY: On this page card */}
        {toc.length > 0 && (
          <div className="sm:hidden bg-white rounded-2xl border border-[rgba(148,163,184,0.5)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-3 px-[14px] text-[13px] mb-5">
            <div className="text-sm font-extrabold mb-1 text-[#1a1a1a]">On this page</div>
            <div className="text-xs text-[#7a819c] mb-2">Jump to any section of the article.</div>
            <ul className="list-none p-0 m-0 text-[13px]">
              {toc.map((item, index) => (
                <li key={item.id} className="py-1" style={{ paddingLeft: `${(item.level - 1) * 8}px` }}>
                  <a 
                    className="text-[#3b35b6] no-underline text-[13px] hover:underline" 
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {index + 1}. {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LAYOUT: article + sidebar */}
        <div className="grid grid-cols-[minmax(0,2.1fr)_minmax(300px,1fr)] gap-5 items-start max-md:grid-cols-1">
          {/* ARTICLE BODY */}
          <article className="bg-white rounded-[18px] border border-[rgba(148,163,184,0.5)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-4 pl-[18px] pr-[18px] pb-[18px] text-[#1a1a1a]">
            {bodyContent ? (
              <div 
                id="article-content"
                className="text-sm leading-[1.7] text-[#1a1a1a] [&_p]:my-[6px] [&_p]:text-[#1a1a1a] [&_ul]:my-[6px] [&_ul]:mb-2 [&_ul]:ml-[18px] [&_ul]:text-[#1a1a1a] [&_ol]:my-[6px] [&_ol]:mb-2 [&_ol]:ml-[18px] [&_ol]:text-[#1a1a1a] [&_li]:mb-1 [&_li]:text-[#1a1a1a] [&_strong]:text-[#1a1a1a] [&_strong]:font-bold [&_b]:text-[#1a1a1a] [&_b]:font-bold [&_a]:text-[#3b35b6] [&_h1]:text-[#1a1a1a] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-[#1a1a1a] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-[14px] [&_h2]:mb-[6px] [&_h3]:text-[#1a1a1a] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:my-3 [&_h3]:mb-1 [&_h4]:text-[#1a1a1a] [&_h5]:text-[#1a1a1a] [&_h6]:text-[#1a1a1a] [&_.highlight]:font-bold [&_.highlight]:text-[#3b35b6]"
              >
                <TiptapContentRenderer content={bodyContent} />
              </div>
            ) : (
              <div className="text-sm leading-[1.7] text-[#1a1a1a]">
                <p>Content coming soon...</p>
              </div>
            )}

            <div className="mt-3 text-xs text-[#7a819c]">
              This article is part of the TEAS Knowledge Base. For hands-on practice and
              skill-level mastery, use your TEAS practice questions and skill pages in the
              main app.
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-3 max-md:static" style={{ position: 'sticky', top: '22px', alignSelf: 'flex-start', height: 'fit-content' }}>
            {/* TOC - Generate from headings in bodyContent (hidden on mobile, shown above content instead) */}
            {toc.length > 0 && (
              <div className="hidden sm:block bg-white rounded-2xl border border-[rgba(148,163,184,0.5)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-3 px-[14px] text-[13px]">
                <div className="text-sm font-extrabold mb-1 text-[#1a1a1a]">On this page</div>
                <div className="text-xs text-[#7a819c] mb-2">Jump to any section of the article.</div>
                <ul className="list-none p-0 m-0 text-[13px]">
                  {toc.map((item, index) => (
                    <li key={item.id} className="py-1" style={{ paddingLeft: `${(item.level - 1) * 8}px` }}>
                      <a 
                        className="text-[#3b35b6] no-underline text-[13px] hover:underline" 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {index + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick facts */}
            <div className="bg-white rounded-2xl border border-[rgba(148,163,184,0.5)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-3 px-[14px] text-[13px]">
              <div className="text-sm font-extrabold mb-1 text-[#1a1a1a]">Quick TEAS 7 facts</div>
              <div className="text-xs text-[#7a819c] mb-2">Useful numbers you can memorize quickly.</div>
              <div className="grid grid-cols-[1.1fr_1fr] gap-x-3 gap-y-1 text-xs mt-1">
                <div className="text-[#7a819c]">Total questions</div>
                <div className="font-bold text-[#1a1a1a]">170</div>

                <div className="text-[#7a819c]">Scored questions</div>
                <div className="font-bold text-[#1a1a1a]">150</div>

                <div className="text-[#7a819c]">Total time</div>
                <div className="font-bold text-[#1a1a1a]">209 minutes</div>

                <div className="text-[#7a819c]">Sections</div>
                <div className="font-bold text-[#1a1a1a]">4</div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center rounded-full py-[2px] px-[7px] text-[11px] border border-[#bbf7d0] bg-[#dcfce7] text-[#166534] gap-[6px] font-bold">
                  <span className="w-[7px] h-[7px] bg-[#22c55e] rounded-full"></span>
                  Good to memorize before exam day
                </span>
              </div>
            </div>

            {/* Related articles */}
            {article?.relatedArticleIds && article.relatedArticleIds.length > 0 && (
              <div className="bg-white rounded-2xl border border-[rgba(148,163,184,0.5)] shadow-[0_18px_40px_rgba(15,23,42,0.1)] p-3 px-[14px] text-[13px]">
                <div className="text-sm font-extrabold mb-1 text-[#1a1a1a]">Related TEAS articles</div>
                <div className="text-xs text-[#7a819c] mb-2">
                  These guides build on what you just read about TEAS structure.
                </div>
                <ul className="list-none p-0 m-0 text-[13px]">
                  {article.relatedArticleIds.slice(0, 4).map((id: string, index: number) => (
                    <li key={id} className="py-1 border-b border-[#e5e7eb] last:border-b-0">
                      <a className="text-[#3b35b6] no-underline hover:underline" href={`/${id}`}>
                        Related Article {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
                <button className="mt-2 rounded-full border border-[rgba(106,92,255,0.55)] bg-white text-[#3b35b6] py-[7px] px-3 text-xs inline-flex items-center gap-[6px] cursor-pointer font-extrabold">
                  <span className="text-sm leading-none">▶</span>
                  View all TEAS articles
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
