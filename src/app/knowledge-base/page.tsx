"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import {
  getNursingEntranceExamSubPages,
  getNursingTestBankSubPages,
  getNursingExitExamSubPages,
  getNestedSubPages,
  getNursingTestBankNestedSubPages,
  getNursingExitExamNestedSubPages,
  getNursingEntranceExamKbArticles,
  getNursingTestBankKbArticles,
  getNursingExitExamKbArticles,
} from "@/lib/firestore-operations";

interface SubPage {
  id: string;
  subPageId?: string;
  slug?: string;
  pageName?: string;
  title?: string;
  description?: string;
  heading?: string;
  hero?: {
    title?: string;
    description?: string;
  };
  pillarId?: string;
  nestedSubPages?: Array<{
    id: string;
    pageName?: string;
    title?: string;
    heading?: string;
  }>;
  kbArticles?: Array<{
    id: string;
    pageName?: string;
    title?: string;
    heading?: string;
    slug?: string;
  }>;
  kbArticlesCount?: number;
}

// Helper function to strip HTML tags and get plain text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  // Remove HTML tags using regex
  let text = html.replace(/<[^>]*>/g, "");
  // Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Clean up extra whitespace
  return text.trim().replace(/\s+/g, " ");
};

export default function KnowledgeBaseHubPage() {
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubPages = async () => {
      try {
        setLoading(true);
        const allSubPages: SubPage[] = [];

        // Fetch sub-pages and KB articles from all three pillars
        const [entranceResult, testBankResult, exitResult, entranceKbResult, testBankKbResult, exitKbResult] = await Promise.all([
          getNursingEntranceExamSubPages(),
          getNursingTestBankSubPages(),
          getNursingExitExamSubPages(),
          getNursingEntranceExamKbArticles(),
          getNursingTestBankKbArticles(),
          getNursingExitExamKbArticles(),
        ]);

        // Get all KB articles for each pillar
        const entranceKbArticles = entranceKbResult.success && entranceKbResult.data ? entranceKbResult.data : [];
        const testBankKbArticles = testBankKbResult.success && testBankKbResult.data ? testBankKbResult.data : [];
        const exitKbArticles = exitKbResult.success && exitKbResult.data ? exitKbResult.data : [];

        // Add nursing entrance exam sub-pages
        if (entranceResult.success && entranceResult.data) {
          for (const subPage of entranceResult.data) {
            // Fetch nested sub-pages for this sub-page
            const nestedResult = await getNestedSubPages(subPage.id);
            const nestedSubPages = nestedResult.success && nestedResult.data ? nestedResult.data.slice(0, 3) : [];
            
            // Filter KB articles by parentId (sub-page ID)
            const allSubPageKbArticles = entranceKbArticles.filter((kb: any) => kb.parentId === subPage.id);
            const subPageKbArticles = allSubPageKbArticles
              .slice(0, 4)
              .map((kb: any) => ({
                id: kb.id,
                pageName: kb.pageName,
                title: kb.title,
                heading: kb.heading,
                slug: kb.slug,
              }));
            
            allSubPages.push({
              ...subPage,
              pillarId: "nursing-entrance-exam",
              nestedSubPages: nestedSubPages,
              kbArticles: subPageKbArticles,
              kbArticlesCount: allSubPageKbArticles.length,
            });
          }
        }

        // Add nursing test bank sub-pages
        if (testBankResult.success && testBankResult.data) {
          for (const subPage of testBankResult.data) {
            // Fetch nested sub-pages for this sub-page
            const nestedResult = await getNursingTestBankNestedSubPages(subPage.id);
            const nestedSubPages = nestedResult.success && nestedResult.data ? nestedResult.data.slice(0, 3) : [];
            
            // Filter KB articles by parentId (sub-page ID)
            const allSubPageKbArticles = testBankKbArticles.filter((kb: any) => kb.parentId === subPage.id);
            const subPageKbArticles = allSubPageKbArticles
              .slice(0, 4)
              .map((kb: any) => ({
                id: kb.id,
                pageName: kb.pageName,
                title: kb.title,
                heading: kb.heading,
                slug: kb.slug,
              }));
            
            allSubPages.push({
              ...subPage,
              pillarId: "nursing-test-bank",
              nestedSubPages: nestedSubPages,
              kbArticles: subPageKbArticles,
              kbArticlesCount: allSubPageKbArticles.length,
            });
          }
        }

        // Add nursing exit exam sub-pages
        if (exitResult.success && exitResult.data) {
          for (const subPage of exitResult.data) {
            // Fetch nested sub-pages for this sub-page
            const nestedResult = await getNursingExitExamNestedSubPages(subPage.id);
            const nestedSubPages = nestedResult.success && nestedResult.data ? nestedResult.data.slice(0, 3) : [];
            
            // Filter KB articles by parentId (sub-page ID)
            const allSubPageKbArticles = exitKbArticles.filter((kb: any) => kb.parentId === subPage.id);
            const subPageKbArticles = allSubPageKbArticles
              .slice(0, 4)
              .map((kb: any) => ({
                id: kb.id,
                pageName: kb.pageName,
                title: kb.title,
                heading: kb.heading,
                slug: kb.slug,
              }));
            
            allSubPages.push({
              ...subPage,
              pillarId: "nursing-exit-exam",
              nestedSubPages: nestedSubPages,
              kbArticles: subPageKbArticles,
              kbArticlesCount: allSubPageKbArticles.length,
            });
          }
        }

        setSubPages(allSubPages);
      } catch (error) {
        console.error("Error loading sub-pages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubPages();
  }, []);

  const getPillarLabel = (pillarId: string) => {
    switch (pillarId) {
      case "nursing-entrance-exam":
        return "Nursing Entrance Exam";
      case "nursing-test-bank":
        return "Nursing Test Bank";
      case "nursing-exit-exam":
        return "Nursing Exit Exam";
      default:
        return "Nursing";
    }
  };

  const _getPillarUrl = (pillarId: string) => {
    switch (pillarId) {
      case "nursing-entrance-exam":
        return "/nursing-entrance-exam";
      case "nursing-test-bank":
        return "/nursing-test-bank";
      case "nursing-exit-exam":
        return "/nursing-exit-exam";
      default:
        return "/";
    }
  };


  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#f4f2ff] via-[#f5f6fb] to-[#f5f6fb]">
        {/* PAGE CONTENT */}
        <div className="page">
        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="hero-pill">
              <span className="hero-pill-dot"></span>
              <span>Knowledge Base Hub · Platform Guides</span>
            </div>

            <h1 className="hero-title">
              Master Every Part Of Your Prep
              <br />
              With The <span className="blue">NursingMocks</span>{" "}
              <span className="purple">Knowledge Base</span>
            </h1>

            <p className="hero-subtext">
              Learn how TEAS, HESI, nursing test banks, and exit exams work
              without guessing. This hub connects exam explanations, platform
              how-tos, and account help into one place, so you can read a guide
              and jump straight into the right{" "}
              <a href="#kb-hubs">practice area</a> when you are ready.
            </p>

            <div className="hero-chips">
              <div className="hero-chip">
                <span className="hero-chip-dot"></span>
                Updated For ATI TEAS 7 &amp; current HESI blueprints
              </div>
              <div className="hero-chip">
                <span className="hero-chip-dot"></span>
                Platform guides for Review &amp; Exam Modes
              </div>
              <div className="hero-chip">
                <span className="hero-chip-dot"></span>
                Account, billing &amp; troubleshooting FAQs
              </div>
            </div>

            <div className="hero-actions">
              <a href="#kb-hubs" className="btn-ghost">
                <span>Browse Exam Knowledge Base Hubs</span>
              </a>
            </div>

            <p className="hero-footnote">
              One login. Your practice, mastery scores, and Knowledge Base
              articles all live under the same NursingMocks account.
            </p>
          </div>

          {/* Snapshot card */}
          <div className="hero-right">
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="hero-card-title">Help &amp; Study Snapshot</div>
                <div className="hero-card-pill">Study Streak · 4 Days</div>
              </div>

              <div className="hero-card-grid">
                <div className="hero-stat">
                  <div className="hero-stat-label">Articles read</div>
                  <div className="hero-stat-main">7</div>
                  <div className="hero-stat-sub">
                    Last 7 days across all hubs
                  </div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">Most viewed hub</div>
                  <div className="hero-stat-main">TEAS</div>
                  <div className="hero-stat-sub">Reading &amp; Math guides</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">Practice launched from KB</div>
                  <div className="hero-stat-main">5</div>
                  <div className="hero-stat-sub">
                    Sets started via &quot;Practice This&quot; links
                  </div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-label">Open tickets</div>
                  <div className="hero-stat-main">0</div>
                  <div className="hero-stat-sub">No pending support requests</div>
                </div>
              </div>

              <div className="hero-progress-label">
                Knowledge Base coverage for your plan
              </div>
              <div className="hero-progress-track">
                <div className="hero-progress-bar"></div>
              </div>
            </div>
          </div>
        </section>

        {/* HUB GRID */}
        <div className="section-label" id="kb-hubs">
          Exam &amp; Platform Knowledge Base Hubs
        </div>
        <section className="hub-grid">
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>Loading sub-pages...</div>
            </div>
          ) : subPages.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                No sub-pages found.
              </div>
            </div>
          ) : (
            subPages.map((subPage) => {
              const pageName = subPage.pageName || subPage.hero?.title || subPage.title || subPage.heading || subPage.id;
              const dbDescription = subPage.description || subPage.hero?.description || "";
              const slug = subPage.slug || subPage.id;
              const pillarLabel = getPillarLabel(subPage.pillarId || "");
              const pageUrl = `/knowledge-base/${slug}`;
              
              // Get nested sub-page names for mini pill
              const nestedSubPages = subPage.nestedSubPages || [];
              const nestedNames = nestedSubPages
                .slice(0, 3)
                .map((nested: any) => nested.pageName || nested.title || nested.heading || nested.id)
                .filter(Boolean);
              
              const miniPillText = nestedNames.length > 0 
                ? nestedNames.join(" · ")
                : "No subjects";

              // Generate description - use database description if available, otherwise use default
              // Strip HTML tags to show only plain text
              const getDescription = () => {
                if (dbDescription) {
                  return stripHtmlTags(dbDescription);
                }
                return `Learn more about ${pageName} and how it works inside NursingMocks. Discover comprehensive guides, practice resources, and detailed explanations to help you master this subject. Our knowledge base provides in-depth articles, step-by-step tutorials, and expert insights to support your learning journey.`;
              };

              return (
                <article
                  key={subPage.id}
                  className="hub-card"
                  onClick={() => (window.location.href = pageUrl)}
                >
                  <div className="hub-cloud-main"></div>
                  <div className="hub-cloud-small"></div>

                  <div className="hub-chip-row">
                    <div className="hub-tag">{pillarLabel}</div>
                    <div className="hub-mini-pill">{miniPillText}</div>
                  </div>

                  <h2 className="hub-title">{pageName} Knowledge Base</h2>
                  <p className="hub-desc">
                    {getDescription()}
                  </p>
                  <p className="hub-links">
                    <span>Popular topics:</span>
                    {subPage.kbArticles && subPage.kbArticles.length > 0 ? (
                      subPage.kbArticles.map((kbArticle, index) => {
                        const kbName = kbArticle.pageName || kbArticle.title || kbArticle.heading || kbArticle.id;
                        const kbSlug = kbArticle.slug || kbArticle.id;
                        const kbUrl = `/${kbSlug}`;
                        return (
                          <span key={kbArticle.id}>
                            {index > 0 && " • "}
                            <a href={kbUrl} onClick={(e) => e.stopPropagation()}>
                              {kbName}
                            </a>
                          </span>
                        );
                      })
                    ) : (
                      <span> none</span>
                    )}
                  </p>
                  <div className="hub-footer">
                    <div className="hub-articles-count">
                      {subPage.kbArticlesCount !== undefined 
                        ? `${subPage.kbArticlesCount} article${subPage.kbArticlesCount !== 1 ? 's' : ''}`
                        : '0 articles'}
                    </div>
                    <Link 
                      className="rounded-full px-[13px] py-[7px] bg-[#111827] text-white text-xs font-medium inline-flex items-center gap-[6px] no-underline border-none shadow-[0_12px_26px_rgba(15,23,42,0.35)] cursor-pointer transition-all hover:translate-y-[-1px] hover:shadow-[0_14px_30px_rgba(15,23,42,0.4)] relative z-10" 
                      href={pageUrl}
                    >
                      <span>Browse {pageName} Articles</span>
                      <span className="text-base leading-none">›</span>
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
        </div>
      </div>

      <style jsx>{`
        :root {
          --bg: #f4f4ff;
          --surface: #ffffff;
          --surface-soft: #f3f4ff;
          --border-soft: #e0e7ff;

          --text-main: #0f172a;
          --text-muted: #6b7280;

          --blue: #2563eb;
          --blue-soft: #bfdbfe;
          --indigo: #4f46e5;
          --purple: #8b5cf6;

          --radius-lg: 24px;
          --radius-pill: 999px;

          --shadow-soft: 0 16px 40px rgba(15, 23, 42, 0.16);
          --shadow-card: 0 20px 60px rgba(15, 23, 42, 0.18);
        }

        * {
          box-sizing: border-box;
          font-family: system-ui, -apple-system, "SF Pro Text", "Segoe UI",
            sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          background: radial-gradient(
            circle at top left,
            #eef2ff 0,
            #f4f4ff 40%,
            #e0f2fe 100%
          );
          color: var(--text-main);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        .shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ===== GLOBAL HEADER ===== */

        .site-header {
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(18px);
          background: linear-gradient(
            to bottom,
            rgba(244, 244, 255, 0.98),
            rgba(244, 244, 255, 0.92)
          );
          border-bottom: 1px solid rgba(199, 210, 254, 0.95);
        }

        .header-inner {
          width: 100%;
          margin: 0 auto;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-bubble {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: radial-gradient(circle at 20% 0, #f97316, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9fafb;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.6);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #6b7280;
        }

        .main-nav {
          display: flex;
          align-items: center;
          gap: 18px;
          justify-content: center;
          flex: 1 1 auto;
        }

        .nav-link {
          font-size: 13px;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 999px;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(79, 70, 229, 0.06);
          color: #111827;
          text-decoration: none;
        }

        .nav-link.active {
          background: #111827;
          color: #f9fafb;
          font-weight: 500;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.35);
        }

        .header-cta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .header-pill {
          font-size: 11px;
          border-radius: 999px;
          padding: 4px 10px;
          border: 1px solid #dbeafe;
          background: #eff6ff;
          color: #1e293b;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .header-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
        }

        .header-cta {
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 12px;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          color: #ffffff;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 14px 30px rgba(79, 70, 229, 0.55);
        }

        .header-cta span.icon {
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .header-inner {
            flex-wrap: wrap;
            justify-content: center;
          }

          .main-nav {
            order: 3;
            flex-wrap: wrap;
          }

          .header-cta-row {
            order: 2;
          }
        }

        @media (max-width: 640px) {
          .header-inner {
            padding: 10px 14px;
          }

          .main-nav {
            gap: 10px;
          }

          .nav-link {
            font-size: 12px;
            padding: 3px 7px;
          }

          .header-pill {
            display: none;
          }
        }

        /* ===== PAGE WRAPPER ===== */

        .page {
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px 40px;
          flex: 1 1 auto;
        }

        .breadcrumb {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
          white-space: nowrap;
          overflow-x: auto;
        }

        .breadcrumb span + span::before {
          content: " / ";
          margin: 0 4px;
          color: #c4c7d0;
        }

        .breadcrumb a {
          color: #6b7280;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        /* ===== HERO ===== */

        .hero {
          position: relative;
          border-radius: 24px;
          padding: 26px 38px 26px;
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.1fr);
          gap: 26px;
          align-items: center;
          color: #111827;
          background: radial-gradient(
            circle at top left,
            #e0f2fe 0,
            #e9d5ff 36%,
            #eef2ff 72%,
            #f4f4ff 100%
          );
          box-shadow: var(--shadow-card);
          overflow: hidden;
          margin-bottom: 26px;
        }

        .hero::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(79, 70, 229, 0.24),
            transparent 70%
          );
          right: -120px;
          top: -160px;
          opacity: 0.9;
          pointer-events: none;
        }

        .hero-left,
        .hero-right {
          position: relative;
          z-index: 1;
        }

        .hero-left {
          padding-right: 10px;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(6px);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #111827;
          margin-bottom: 12px;
        }

        .hero-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
        }

        .hero-title {
          font-size: 30px;
          line-height: 1.16;
          font-weight: 800;
          margin-bottom: 10px;
          color: #111827;
        }

        .hero-title span.blue {
          color: #2563eb;
        }

        .hero-title span.purple {
          color: #8b5cf6;
        }

        .hero-subtext {
          font-size: 14px;
          line-height: 1.7;
          color: #4b5563;
          max-width: 560px;
          margin-bottom: 16px;
        }

        .hero-subtext a {
          color: var(--blue);
          font-weight: 500;
          text-decoration: none;
        }

        .hero-subtext a:hover {
          text-decoration: underline;
        }

        .hero-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }

        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.9);
          font-size: 11.5px;
          color: #4b5563;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
          white-space: nowrap;
        }

        .hero-chip-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #22c55e;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-bottom: 6px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          background: linear-gradient(135deg, #4f46e5, #8b5cf6);
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          border: none;
          box-shadow: 0 18px 40px rgba(79, 70, 229, 0.55);
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-primary:hover {
          filter: brightness(1.04);
          text-decoration: none;
        }

        .btn-icon {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.96);
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
          white-space: nowrap;
        }

        .btn-ghost:hover {
          background: #eef2ff;
          text-decoration: none;
        }

        .hero-footnote {
          font-size: 11.5px;
          color: #6b7280;
          max-width: 540px;
          margin-top: 2px;
        }

        /* RIGHT SNAPSHOT CARD */

        .hero-card {
          max-width: 420px;
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 16px 18px 18px;
          box-shadow: var(--shadow-soft);
          border: 1px solid rgba(148, 163, 184, 0.45);
        }

        .hero-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .hero-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: #4b5563;
        }

        .hero-card-pill {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
          white-space: nowrap;
        }

        .hero-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 12px;
          margin-bottom: 12px;
        }

        .hero-stat {
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          padding: 8px 9px 9px;
          background: #f9fafb;
        }

        .hero-stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .hero-stat-main {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .hero-stat-sub {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .hero-progress-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .hero-progress-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: #e5e7eb;
          overflow: hidden;
          position: relative;
        }

        .hero-progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 70%;
          background: linear-gradient(90deg, #4f46e5, #8b5cf6);
          border-radius: inherit;
        }

        /* ===== SEARCH ===== */

        .search-shell {
          border-radius: 24px;
          padding: 14px 16px;
          background: radial-gradient(
            circle at top left,
            #ffffff 0,
            #eef2ff 40%,
            #f9fafb 100%
          );
          border: 1px solid rgba(148, 163, 184, 0.5);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }

        .search-icon-bubble {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.35);
          flex-shrink: 0;
        }

        .search-icon-inner {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          border: 2px solid #60a5fa;
          position: relative;
        }

        .search-icon-inner::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 2px;
          border-radius: 999px;
          background: #60a5fa;
          right: -4px;
          bottom: -1px;
          transform: rotate(42deg);
        }

        .search-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #111827;
          padding: 0;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-hint-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: #6b7280;
        }

        .key-pill {
          border-radius: 6px;
          border: 1px solid #d1d5db;
          padding: 2px 6px;
          font-size: 10px;
          background: #f9fafb;
          color: #4b5563;
        }

        .search-side-hint {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }

        /* ===== HUB GRID ===== */

        .section-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #6b7280;
          margin: 4px 0 6px;
        }

        .hub-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 6px;
        }

        .hub-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 18px 18px 16px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: radial-gradient(
            circle at top left,
            #ffffff 0,
            #f4f4ff 44%,
            #eef2ff 100%
          );
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          cursor: pointer;
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out,
            border-color 0.18s ease-out;
        }

        .hub-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 50px rgba(79, 70, 229, 0.26);
          border-color: rgba(129, 140, 248, 0.9);
        }

        .hub-chip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }

        .hub-tag {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .hub-mini-pill {
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 11px;
          border: 1px solid #e0e7ff;
          background: rgba(255, 255, 255, 0.9);
          color: #4b5563;
          position: relative;
          z-index: 3;
        }

        .hub-title {
          font-size: 19px;
          font-weight: 660;
          margin-bottom: 6px;
          color: #111827;
        }

        .hub-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 10px;
          max-width: 440px;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 78px;
        }
        .hub-links {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .hub-links span {
          margin-right: 6px;
          font-weight: 500;
          color: #374151;
        }

        .hub-links a {
          color: #2563eb;
          text-decoration: none;
          white-space: nowrap;
        }

        .hub-links a:hover {
          text-decoration: underline;
        }

        .hub-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
          flex-wrap: wrap;
        }

        .hub-articles-count {
          color: #6b7280;
        }

        .hub-cta,
        a.hub-cta {
          border-radius: var(--radius-pill);
          padding: 7px 13px;
          background: #111827 !important;
          background-color: #111827 !important;
          color: #ffffff !important;
          font-size: 12px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none !important;
          border: none;
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.35);
          cursor: pointer;
          transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
        }

        .hub-cta:hover,
        a.hub-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.4);
          text-decoration: none !important;
          background: #111827 !important;
          background-color: #111827 !important;
          color: #ffffff !important;
        }

        .hub-cta:visited,
        a.hub-cta:visited {
          background: #111827 !important;
          background-color: #111827 !important;
          color: #ffffff !important;
        }

        .hub-cta:active,
        a.hub-cta:active {
          background: #111827 !important;
          background-color: #111827 !important;
          color: #ffffff !important;
        }

        .hub-cta span.icon {
          font-size: 16px;
          line-height: 0;
        }

        .hub-cloud-main {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 40px;
          background: radial-gradient(circle at 20% 0, #e0e7ff, #c7d2fe);
          opacity: 0.55;
          top: -40px;
          right: -30px;
          transform: rotate(14deg);
        }

        .hub-cloud-small {
          position: absolute;
          width: 70px;
          height: 70px;
          border-radius: 28px;
          background: radial-gradient(circle at 40% 0, #dbeafe, #a5b4fc);
          opacity: 0.4;
          bottom: -26px;
          right: 18px;
          transform: rotate(-16deg);
        }

        /* ===== POPULAR TOPICS ===== */

        .popular {
          margin-top: 28px;
        }

        .popular-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          font-size: 13px;
        }

        .popular-card {
          border-radius: 16px;
          border: 1px solid #e0e7ff;
          background: #ffffff;
          padding: 10px 12px;
          box-shadow: 0 10px 22px rgba(148, 163, 184, 0.15);
        }

        .popular-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 3px;
          color: #111827;
        }

        .popular-desc {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.6;
        }

        .popular-link {
          color: #2563eb;
          text-decoration: none;
        }

        .popular-link:hover {
          text-decoration: underline;
        }

        /* ===== RESPONSIVE ===== */

        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.1fr);
            padding: 22px 24px 24px;
          }
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: minmax(0, 1fr);
            padding: 20px 18px 22px;
            border-radius: 24px;
          }

          .hero-right {
            max-width: 420px;
            margin: 4px auto 0;
          }

          .hub-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 720px) {
          .search-shell {
            align-items: flex-start;
            gap: 10px;
          }

          .search-side-hint {
            display: none;
          }

          .popular-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 540px) {
          .hero-title {
            font-size: 24px;
          }

          .btn-primary,
          .btn-ghost {
            width: 100%;
            justify-content: center;
          }

          .popular-list {
            grid-template-columns: minmax(0, 1fr);
          }

          .page {
            padding: 18px 14px 30px;
          }
        }
      `}</style>
    </Layout>
  );
}


