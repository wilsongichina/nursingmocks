"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { getPageBySlug, getNursingEntranceExamKbArticles, getNursingTestBankKbArticles, getNursingExitExamKbArticles } from "@/lib/firestore-operations";

export default function KnowledgeBaseSubPage() {
  const params = useParams();
  const subPageSlug = params?.subPage as string;
  const [subPage, setSubPage] = useState<any>(null);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_pillarId, setPillarId] = useState<string>("");

  useEffect(() => {
    const loadSubPage = async () => {
      if (!subPageSlug) return;

      try {
        setLoading(true);
        const result = await getPageBySlug(subPageSlug);
        if (result.success && result.data) {
          setSubPage(result.data);
          const pagePillarId = (result as any).pillarId || (result.data as any).pillarId || "nursing-entrance-exam";
          setPillarId(pagePillarId);
          
          // Fetch KB articles for this pillar
          let articlesResult;
          if (pagePillarId === "nursing-entrance-exam") {
            articlesResult = await getNursingEntranceExamKbArticles();
          } else if (pagePillarId === "nursing-test-bank") {
            articlesResult = await getNursingTestBankKbArticles();
          } else if (pagePillarId === "nursing-exit-exam") {
            articlesResult = await getNursingExitExamKbArticles();
          } else {
            articlesResult = await getNursingEntranceExamKbArticles();
          }
          
          if (articlesResult.success && articlesResult.data) {
            // Filter articles by parentId (sub page ID)
            const subPageId = result.data.id;
            const filteredArticles = articlesResult.data.filter((article: any) => 
              article.parentId === subPageId || article.parentSubPageId === subPageId
            );
            setKbArticles(filteredArticles);
          }
        }
      } catch (error) {
        console.error("Error loading sub-page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubPage();
  }, [subPageSlug]);

  const pageName = subPage?.pageName || subPage?.hero?.title || subPage?.title || subPage?.heading || subPageSlug || "Knowledge Base";
  const description = subPage?.description || subPage?.hero?.description || "";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#f4f2ff] via-[#f5f6fb] to-[#f5f6fb]">
        <div className="max-w-[1160px] mx-auto px-5 py-6 pb-10 md:px-5 md:py-6 md:pb-10 sm:px-[14px] sm:py-[18px] sm:pb-[30px]">
          {loading ? (
            <div className="text-center py-10">
              <div className="text-sm text-[#6b7280]">Loading...</div>
            </div>
          ) : !subPage ? (
            <div className="text-center py-10">
              <div className="text-sm text-[#6b7280]">Sub-page not found.</div>
            </div>
          ) : (
            <>
              {/* HERO */}
              <section className="relative rounded-[32px] p-[26px_36px] grid grid-cols-[minmax(0,1.55fr)_minmax(0,1.1fr)] gap-[26px] items-center text-[#0f172a] bg-[radial-gradient(circle_at_top_left,#e0f2fe_0,#e9d5ff_36%,#eef2ff_72%,#f4f4ff_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden mb-[26px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] lg:p-[22px_24px_24px] md:grid-cols-1 md:p-5 md:rounded-3xl">
                {/* Hero background decoration */}
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
                    {description || `Learn how ${pageName} works without guessing. This page focuses on the big-picture side: what's on the exam, how scoring works, how to register, and how to build a practical study plan.`}
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
                    <a href="#categories" className="flex items-center justify-center gap-2 py-[9px] px-[18px] rounded-full border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.96)] text-[13px] font-medium text-[#111827] no-underline shadow-[0_8px_20px_rgba(15,23,42,0.12)] whitespace-nowrap hover:bg-[#eef2ff]">
                      <span>Browse Article Categories</span>
                    </a>
                  </div>

                  <p className="text-[11.5px] text-[#6b7280] max-w-[560px] mt-0.5">
                    One login. Your guides, practice tests, and mastery analytics all live under the same NursingMocks account.
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

              {/* Back link */}
              <div className="text-[13px] mb-3">
                ← <Link href="/knowledge-base" className="text-[#2563eb] no-underline hover:underline">Back to Knowledge Base Hub</Link>
              </div>

              {/* ARTICLES */}
              {kbArticles.length > 0 && (
                <>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7280] my-1 mb-1.5" id="categories">
                    Articles
                  </div>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                    {kbArticles.map((article, index) => {
                      const articleName = article.pageName || article.hero?.title || article.title || article.heading || article.slug || "Untitled Article";
                      const articleDescription = article.description || article.hero?.description || "";
                      const articleSlug = article.slug || article.id;
                      const articleUrl = articleSlug ? `/${articleSlug}` : "#";
                      
                      return (
                        <article key={article.id || index} className="bg-white rounded-[22px] border border-[#e0e7ff] p-4 pb-3.5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                          <div className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280] mb-1">
                            {index + 1} • Article
                          </div>
                          <h2 className="text-lg font-[640] mb-1.5">
                            <Link href={articleUrl} className="text-[#0f172a] no-underline hover:text-[#2563eb] hover:underline">
                              {articleName}
                            </Link>
                          </h2>
                          {articleDescription && (
                            <p className="text-[13px] text-[#6b7280] mb-2 leading-[1.6]">
                              {articleDescription}
                            </p>
                          )}
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
              
              {kbArticles.length === 0 && !loading && (
                <div className="text-center py-10">
                  <div className="text-sm text-[#6b7280]">No articles found for this sub page.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
