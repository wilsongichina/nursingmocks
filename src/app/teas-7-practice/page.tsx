"use client";

import type { MouseEvent } from "react";
import Script from "next/script";

function startCheckout(event: MouseEvent<HTMLAnchorElement>, url: string) {
  event.preventDefault();

  const eventId = "checkout_" + Date.now();

  const ttq = (window as Window & { ttq?: { track: (...args: unknown[]) => void } })
    .ttq;
  ttq?.track(
    "InitiateCheckout",
    {
      content_type: "product",
      content_ids: ["teas_7_bundle"],
      content_name: "ATI TEAS 7 Practice Sets",
      value: 99,
      currency: "USD",
    },
    {
      event_id: eventId,
    },
  );

  setTimeout(() => {
    window.location.href = url;
  }, 150);
}

export default function Teas7PracticePage() {
  return (
    <>
      <Script
        src="https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.min.mjs"
        type="module"
        strategy="afterInteractive"
      />
      <Script src="/teas-7-practice/library.js" strategy="afterInteractive" />

      <div className="page-inner">
        <header className="page-header" aria-label="Page header">
          <div className="page-header-grid">
            <div>
              <h1>TEAS Version 7 Sets Library</h1>
              <p>
                Select a set to preview its sample files. Each set contains{" "}
                <strong>20 preview questions</strong>, with{" "}
                <strong>5 questions from each subject</strong>, so students can
                review the structure, balance, and realism before purchase.
              </p>
              <div className="header-badges">
                <span className="pill pill-neutral">10 Sets</span>
                <span className="pill">20 Preview Questions Per Set</span>
                <span className="pill">5 Questions From Each Subject</span>
              </div>
            </div>

            <div className="header-actions">
              <button className="btn-ghost" id="bookmarkBtn" type="button">
                ☆ Bookmark This Page
              </button>
              <a
                id="buy-all-sets-main"
                className="btn-buy js-buy-all-sets"
                href="https://stan.store/NursingMocks/p/ati-teas-guide--nursingmocks"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => startCheckout(e, e.currentTarget.href)}
                data-event="buy_all_10_sets"
                data-content_name="Buy All 10 Sets"
                data-content_type="product"
                data-value="99"
                data-currency="USD"
              >
                Buy All 10 Sets – $99
              </a>
            </div>
          </div>
        </header>

        <nav className="mobile-tabs" id="mobileTabs" aria-label="Set tabs" />

        <div className="layout">
          <aside className="card sets-card" aria-label="Set list">
            <div className="card-header">
              <h2>Sets</h2>
              <span className="pill">10 Total</span>
            </div>
            <hr className="dotted-divider" />
            <div className="sets" id="setsList" />
          </aside>

          <main className="card" aria-label="Set details">
            <div className="content">
              <div className="content-top">
                <div className="content-title">
                  <h2 id="setHeading">2026 - TEAS Version 7 Set 6</h2>
                  <p id="setSub">
                    This set includes available preview files. Each preview
                    contains 20 sample questions, with 5 questions from each
                    subject.
                  </p>
                </div>
              </div>

              <hr className="dotted-divider" />

              <section className="content-actions" aria-label="Set summary">
                <div className="actions-left">
                  <div className="label" id="fullSetLabel">
                    Selected Set
                  </div>
                  <div className="hint">
                    Open any available preview format below. Share, download,
                    and open in new tab are available inside the preview popup.
                  </div>
                </div>

                <div className="actions-right">
                  <a
                    id="buy-all-sets-panel"
                    className="btn-buy js-buy-all-sets"
                    href="https://stan.store/NursingMocks/p/ati-teas-guide--nursingmocks"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => startCheckout(e, e.currentTarget.href)}
                    data-event="buy_all_10_sets"
                    data-content_name="Buy All 10 Sets"
                    data-content_type="product"
                    data-value="99"
                    data-currency="USD"
                  >
                    Buy All 10 Sets – $99
                  </a>
                </div>
              </section>

              <section
                className="preview-grid"
                id="previewGrid"
                aria-label="Preview options"
              />
            </div>
          </main>
        </div>
      </div>

      <div className="sticky-buy">
        <a
          id="buy-all-sets-sticky"
          className="btn-buy js-buy-all-sets"
          href="https://stan.store/NursingMocks/p/ati-teas-guide--nursingmocks"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => startCheckout(e, e.currentTarget.href)}
          data-event="buy_all_10_sets"
          data-content_name="Buy All 10 Sets"
          data-content_type="product"
          data-value="99"
          data-currency="USD"
        >
          Buy All 10 Sets – $99
        </a>
      </div>

      <div
        id="previewModal"
        className="modal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-panel" role="document">
          <div className="modal-header">
            <div>
              <div id="modalTitle" className="modal-title">
                <span id="modalFileBadge" className="modal-file-badge pdf">
                  <svg
                    id="modalFileIcon"
                    className="file-icon pdf"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  />
                </span>
                <span id="modalTitleText">Document Preview</span>
              </div>
              <div id="modalSubtitle" className="modal-subtitle">
                File name
              </div>
            </div>

            <div className="modal-actions">
              <button id="shareModalBtn" className="btn-share" type="button">
                Share
              </button>
              <a id="downloadModalBtn" className="btn-download" href="#" download>
                Download
              </a>
              <a
                id="openNewTab"
                className="btn-newtab"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in New Tab
              </a>
              <button id="closeModal" className="btn-primary" type="button">
                Close
              </button>
            </div>
          </div>

          <div className="modal-body">
            <div id="docxLoading" className="docx-loading">
              <div className="spinner" />
              <div className="loading-text">Loading document preview...</div>
            </div>

            <iframe id="previewFrame" className="viewer-frame" title="PDF preview" />

            <div id="mobilePdfViewer" className="mobile-pdf-viewer">
              <div className="mobile-pdf-toolbar">
                <button id="mobilePdfPrevBtn" className="btn-ghost" type="button">
                  Prev
                </button>
                <span id="mobilePdfPageInfo" className="mobile-pdf-page-info">
                  Page 1 of 1
                </span>
                <button id="mobilePdfNextBtn" className="btn-ghost" type="button">
                  Next
                </button>
                <button id="mobilePdfZoomOutBtn" className="btn-ghost" type="button">
                  -
                </button>
                <button id="mobilePdfZoomInBtn" className="btn-ghost" type="button">
                  +
                </button>
              </div>
              <div id="mobilePdfCanvasWrap" className="mobile-pdf-canvas-wrap" />
            </div>

            <div id="docxViewer" className="docx-viewer">
              <div id="docxPaper" className="docx-paper" />
            </div>

            <div id="fallback" className="fallback">
              <div className="fallback-card">
                <h3>Preview not available here</h3>
                <p>This file could not be previewed in the current browser or environment.</p>
                <p id="fallbackText" />
                <p>You can still use the download button or open the file in a new tab.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="toast" className="toast" role="status" aria-live="polite" />

      <style jsx global>{`
        :root{
          --bg-page:#f5f6fb;
          --bg-card:#ffffff;
          --bg-soft:#f1f2fb;

          --accent:#6a5cff;
          --accent-2:#4f46e5;
          --accent-soft:rgba(106, 92, 255, 0.10);
          --accent-soft-2:rgba(106, 92, 255, 0.05);

          --text-main:#202437;
          --text-muted:#7a819c;
          --text-soft:#a0a5bf;

          --border-subtle:#e0e3f0;
          --shadow-soft:0 18px 45px rgba(23, 35, 79, 0.08);
          --shadow-strong:0 18px 42px rgba(106,92,255,.26);

          --radius-lg:16px;
          --radius-md:12px;
          --radius-pill:999px;

          --page-inner-width:1220px;
          --left-col:360px;

          --share-bg:#eff6ff;
          --share-border:#93c5fd;
          --share-text:#1d4ed8;
          --share-hover:#2563eb;

          --download-bg:#ecfdf3;
          --download-border:#86efac;
          --download-text:#15803d;
          --download-hover:#16a34a;

          --newtab-bg:#fff7ed;
          --newtab-border:#fdba74;
          --newtab-text:#c2410c;
          --newtab-hover:#ea580c;

          --pdf-red:#dc2626;
          --pdf-red-soft:#fee2e2;
          --word-blue:#2563eb;
          --word-blue-soft:#dbeafe;
        }

        *{box-sizing:border-box;margin:0;padding:0}
        html, body{width:100%;overflow-x:hidden}
        body{
          font-family:system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
          background:radial-gradient(circle at top, rgba(106, 92, 255, 0.06), transparent 55%), var(--bg-page);
          color:var(--text-main);
          min-height:100vh;
        }

        a{color:inherit;text-decoration:none}
        button{font-family:inherit}
        iframe{display:block}
        svg{display:block}

        .page-inner{
          max-width:var(--page-inner-width);
          margin:0 auto;
          padding:18px 16px 70px;
        }

        .page-header{
          padding:10px 0 14px;
        }

        .page-header-grid{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:14px;
          flex-wrap:wrap;
        }

        .page-header h1{
          font-size:26px;
          font-weight:900;
          letter-spacing:-0.02em;
          margin-bottom:8px;
          color:var(--text-main);
        }

        .page-header p{
          color:var(--text-muted);
          font-size:14px;
          line-height:1.65;
          max-width:92ch;
        }

        .header-badges{
          margin-top:10px;
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        .pill{
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:5px 10px;
          border-radius:var(--radius-pill);
          background:var(--accent-soft-2);
          color:var(--accent);
          font-size:11px;
          font-weight:700;
          border:1px dashed rgba(106,92,255,.35);
          white-space:nowrap;
        }

        .pill-neutral{
          background:var(--bg-soft);
          color:var(--text-muted);
          border:1px dashed var(--border-subtle);
        }

        .header-actions{
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
          justify-content:flex-end;
          margin-top:4px;
        }

        .btn-primary,
        .btn-ghost,
        .btn-buy,
        .btn-share,
        .btn-download,
        .btn-newtab{
          border-radius:var(--radius-pill);
          padding:10px 15px;
          font-size:12px;
          font-weight:800;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          transition:transform .08s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease, color .14s ease;
          white-space:nowrap;
          cursor:pointer;
          border:1px solid transparent;
        }

        .btn-primary{
          border:none;
          background:var(--accent);
          color:#fff;
          box-shadow:0 12px 30px rgba(106,92,255,.35);
        }

        .btn-primary:hover{
          transform:translateY(-1px);
          background:var(--accent-2);
          box-shadow:0 14px 36px rgba(79,70,229,.45);
        }

        .btn-ghost{
          border:1px solid var(--border-subtle);
          background:#fff;
          color:var(--text-muted);
        }

        .btn-ghost:hover{
          transform:translateY(-1px);
          background:var(--accent-soft);
          border-color:rgba(106,92,255,.30);
          color:var(--accent);
        }

        .btn-buy{
          border:none;
          background:linear-gradient(135deg, #6a5cff 0%, #8b7dff 100%);
          color:#fff;
          box-shadow:var(--shadow-strong);
        }

        .btn-buy:hover{
          transform:translateY(-1px);
          filter:brightness(.98);
        }

        .btn-share{
          background:var(--share-bg);
          color:var(--share-text);
          border-color:var(--share-border);
          box-shadow:0 10px 24px rgba(37,99,235,.14);
        }

        .btn-share:hover{
          transform:translateY(-1px);
          background:var(--share-hover);
          color:#fff;
          border-color:var(--share-hover);
          box-shadow:0 14px 30px rgba(37,99,235,.28);
        }

        .btn-download{
          background:var(--download-bg);
          color:var(--download-text);
          border-color:var(--download-border);
          box-shadow:0 10px 24px rgba(22,163,74,.14);
        }

        .btn-download:hover{
          transform:translateY(-1px);
          background:var(--download-hover);
          color:#fff;
          border-color:var(--download-hover);
          box-shadow:0 14px 30px rgba(22,163,74,.28);
        }

        .btn-newtab{
          background:var(--newtab-bg);
          color:var(--newtab-text);
          border-color:var(--newtab-border);
          box-shadow:0 10px 24px rgba(234,88,12,.14);
        }

        .btn-newtab:hover{
          transform:translateY(-1px);
          background:var(--newtab-hover);
          color:#fff;
          border-color:var(--newtab-hover);
          box-shadow:0 14px 30px rgba(234,88,12,.28);
        }

        .card{
          background:var(--bg-card);
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-soft);
          overflow:hidden;
        }

        .layout{
          display:grid;
          grid-template-columns:var(--left-col) 1fr;
          gap:18px;
          align-items:start;
          margin-top:10px;
        }

        .card-header{
          padding:14px 16px 12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
        }

        .card-header h2{
          font-size:11px;
          text-transform:uppercase;
          color:var(--text-soft);
          letter-spacing:.08em;
          font-weight:700;
        }

        .dotted-divider{border-top:1px dashed var(--border-subtle);margin:0}

        .sets{
          padding:10px;
          display:flex;
          flex-direction:column;
          gap:10px;
          max-height:calc(100vh - 260px);
          overflow:auto;
        }

        .set-item{
          width:100%;
          border-radius:var(--radius-md);
          padding:12px 12px;
          background:#fff;
          border:1px dashed rgba(106,92,255,.25);
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          cursor:pointer;
          transition:transform .08s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
          text-align:left;
          position:relative;
          -webkit-tap-highlight-color:transparent;
        }

        .set-item:hover{
          transform:translateY(-1px);
          background:rgba(255,255,255,.96);
          box-shadow:0 10px 24px rgba(23,35,79,.10);
          border-color:rgba(106,92,255,.35);
        }

        .set-item.active{
          background:var(--accent-soft-2);
          border-style:solid;
          border-color:rgba(106,92,255,.35);
        }

        .set-item.active::before{
          content:"";
          position:absolute;
          left:0; top:10px; bottom:10px;
          width:4px;
          border-radius:999px;
          background:rgba(106,92,255,.65);
        }

        .set-left{
          display:flex;
          gap:12px;
          align-items:flex-start;
          min-width:0;
        }

        .set-ico{
          width:38px;height:38px;
          border-radius:14px;
          background:var(--accent-soft-2);
          border:1px dashed rgba(106,92,255,.35);
          display:grid;place-items:center;
          color:var(--accent);
          font-size:13px;
          font-weight:900;
          flex:0 0 auto;
        }

        .set-meta{min-width:0}
        .set-meta h3{
          font-size:14px;
          font-weight:700;
          letter-spacing:-.01em;
          line-height:1.42;
          margin-bottom:5px;
        }

        .set-meta p{
          font-size:12px;
          color:var(--text-muted);
          line-height:1.42;
        }

        .set-right{
          flex:0 0 auto;
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          gap:6px;
        }

        .tiny-status{
          font-size:11px;
          color:var(--text-soft);
          white-space:nowrap;
        }

        .mobile-tabs{
          display:none;
          gap:10px;
          overflow-x:auto;
          padding:0 0 6px;
          -webkit-overflow-scrolling:touch;
          margin:10px 0 12px;
        }

        .tab{
          border-radius:var(--radius-pill);
          border:1px solid var(--border-subtle);
          background:#fff;
          padding:10px 12px;
          font-size:13px;
          font-weight:900;
          color:var(--text-main);
          cursor:pointer;
          white-space:nowrap;
          transition:transform .2s ease, background .2s ease, border-color .2s ease;
          flex:0 0 auto;
          display:inline-flex;
          align-items:center;
          gap:8px;
        }

        .tab.active{
          background:#fbfbff;
          color:var(--accent);
          border-color:rgba(106,92,255,.55);
          box-shadow:0 10px 22px rgba(106,92,255,.10);
        }

        .content{padding:14px 16px 16px}
        .content-top{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:10px;
        }

        .content-title h2{
          font-size:18px;
          font-weight:950;
          letter-spacing:-0.01em;
          display:flex;
          align-items:center;
          gap:10px;
          line-height:1.35;
        }

        .content-title p{
          margin-top:6px;
          font-size:13px;
          color:var(--text-muted);
          line-height:1.55;
          max-width:88ch;
        }

        .content-actions{
          margin-top:12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          flex-wrap:wrap;
          padding:12px;
          border-radius:var(--radius-md);
          background:var(--bg-soft);
          border:1px dashed var(--border-subtle);
        }

        .actions-left{
          display:flex;
          flex-direction:column;
          gap:6px;
          min-width:220px;
        }

        .actions-left .label{
          font-size:12px;
          color:var(--text-muted);
          font-weight:800;
        }

        .actions-left .hint{
          font-size:12px;
          color:var(--text-soft);
          line-height:1.45;
        }

        .actions-right{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          align-items:center;
        }

        .preview-grid{
          margin-top:12px;
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:12px;
        }

        .preview-card{
          border-radius:var(--radius-md);
          padding:12px;
          background:var(--accent-soft-2);
          border:1px dashed rgba(106,92,255,.25);
          display:flex;
          flex-direction:column;
          gap:10px;
          min-height:180px;
          transition:transform .08s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
        }

        .preview-card:hover{
          transform:translateY(-1px);
          background:rgba(255,255,255,.95);
          box-shadow:0 10px 24px rgba(23,35,79,.10);
          border-color:rgba(106,92,255,.35);
        }

        .preview-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:10px;
        }

        .preview-left{
          display:flex;
          gap:10px;
          align-items:flex-start;
          min-width:0;
        }

        .preview-ico{
          width:42px;
          height:42px;
          border-radius:14px;
          background:#fff;
          display:grid;
          place-items:center;
          flex:0 0 auto;
          box-shadow:0 8px 18px rgba(106,92,255,.08);
          border:1px solid #eef0fa;
          overflow:hidden;
        }

        .preview-ico.pdf{
          background:var(--pdf-red-soft);
          border-color:#fecaca;
        }

        .preview-ico.word{
          background:var(--word-blue-soft);
          border-color:#bfdbfe;
        }

        .file-icon{
          width:24px;
          height:24px;
        }

        .file-icon.pdf{color:var(--pdf-red)}
        .file-icon.word{color:var(--word-blue)}

        .preview-title{
          font-size:14px;
          font-weight:800;
          letter-spacing:-.01em;
          line-height:1.35;
          margin-top:1px;
        }

        .preview-sub{
          margin-top:5px;
          font-size:12px;
          color:var(--text-muted);
          line-height:1.48;
        }

        .preview-foot{
          margin-top:auto;
          display:flex;
          justify-content:flex-end;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
        }

        .sticky-buy{
          position:fixed;
          right:18px;
          bottom:18px;
          z-index:999;
        }

        .modal{
          position:fixed;inset:0;
          background:rgba(14,18,38,.68);
          display:none;
          align-items:center;
          justify-content:center;
          padding:18px;
          z-index:9999;
        }

        .modal.show{display:flex}

        .modal-panel{
          width:min(1220px,100%);
          height:min(92vh,920px);
          background:#fff;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 24px 60px rgba(0,0,0,.24);
          display:flex;
          flex-direction:column;
        }

        .modal-header{
          padding:14px 16px 12px;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
          background:#fff;
          border-bottom:1px dashed var(--border-subtle);
        }

        .modal-title{
          font-size:18px;
          font-weight:900;
          letter-spacing:-0.01em;
          line-height:1.35;
          margin-bottom:4px;
          color:var(--text-main);
          word-break:break-word;
          display:flex;
          align-items:center;
          gap:10px;
        }

        .modal-file-badge{
          width:36px;
          height:36px;
          border-radius:12px;
          display:grid;
          place-items:center;
          border:1px solid #eef0fa;
          flex:0 0 auto;
        }

        .modal-file-badge.pdf{
          background:var(--pdf-red-soft);
          border-color:#fecaca;
        }

        .modal-file-badge.word{
          background:var(--word-blue-soft);
          border-color:#bfdbfe;
        }

        .modal-file-badge .file-icon{
          width:20px;
          height:20px;
        }

        .modal-subtitle{
          color:var(--text-muted);
          font-size:13px;
          line-height:1.45;
          word-break:break-word;
        }

        .modal-actions{
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        }

        .modal-body{
          position:relative;
          flex:1;
          min-height:0;
          background:var(--bg-soft);
          overflow:hidden;
        }

        .viewer-frame{
          width:100%;
          height:100%;
          border:0;
          background:#fff;
          display:none;
        }

        .mobile-pdf-viewer{
          display:none;
          height:100%;
          overflow:auto;
          padding:14px;
          background:#fff;
        }

        .mobile-pdf-viewer.show{
          display:block;
        }

        .mobile-pdf-canvas-wrap{
          display:flex;
          flex-direction:column;
          gap:12px;
          max-width:820px;
          margin:0 auto;
        }

        .mobile-pdf-toolbar{
          position:sticky;
          top:0;
          z-index:2;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          flex-wrap:wrap;
          padding:10px;
          margin-bottom:10px;
          border:1px solid #e8ebf6;
          border-radius:12px;
          background:rgba(255,255,255,.94);
          backdrop-filter:blur(4px);
        }

        .mobile-pdf-page-info{
          font-size:12px;
          font-weight:800;
          color:var(--text-main);
          min-width:96px;
          text-align:center;
        }

        .mobile-pdf-page{
          width:100%;
          border:1px solid #e8ebf6;
          border-radius:10px;
          box-shadow:0 8px 20px rgba(23,35,79,.08);
          background:#fff;
        }

        .docx-viewer{
          display:none;
          height:100%;
          overflow:auto;
          padding:22px;
          background:#f7f8ff;
        }

        .docx-viewer.show{
          display:block;
        }

        .docx-paper{
          max-width:920px;
          margin:0 auto;
          background:#fff;
          border-radius:18px;
          border:1px dashed var(--border-subtle);
          box-shadow:var(--shadow-soft);
          padding:32px 36px;
        }

        .docx-paper h1,
        .docx-paper h2,
        .docx-paper h3,
        .docx-paper h4,
        .docx-paper h5,
        .docx-paper h6{
          color:var(--text-main);
          margin:0 0 14px;
          line-height:1.35;
        }

        .docx-paper p{
          margin:0 0 14px;
          color:#2e344c;
          line-height:1.75;
          font-size:15px;
        }

        .docx-paper ul,
        .docx-paper ol{
          margin:0 0 16px 22px;
          color:#2e344c;
        }

        .docx-paper li{
          margin-bottom:8px;
          line-height:1.7;
        }

        .docx-paper table{
          width:100%;
          border-collapse:collapse;
          margin:16px 0;
        }

        .docx-paper td,
        .docx-paper th{
          border:1px solid #e6e8f2;
          padding:10px 12px;
          text-align:left;
          font-size:14px;
        }

        .docx-loading{
          display:none;
          position:absolute;
          inset:0;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          gap:12px;
          background:rgba(245,246,251,.92);
          z-index:4;
        }

        .docx-loading.show{
          display:flex;
        }

        .spinner{
          width:42px;
          height:42px;
          border-radius:999px;
          border:4px solid rgba(106,92,255,.15);
          border-top-color:var(--accent);
          animation:spin .8s linear infinite;
        }

        @keyframes spin{
          to{transform:rotate(360deg)}
        }

        .loading-text{
          font-size:13px;
          font-weight:800;
          color:var(--text-muted);
        }

        .fallback{
          display:none;
          height:100%;
          overflow:auto;
          padding:20px;
        }

        .fallback.show{display:block}

        .fallback-card{
          max-width:760px;
          margin:0 auto;
          background:#fff;
          border-radius:var(--radius-lg);
          box-shadow:var(--shadow-soft);
          padding:18px;
          border:1px dashed var(--border-subtle);
        }

        .fallback-card h3{
          font-size:18px;
          font-weight:900;
          letter-spacing:-0.01em;
          margin-bottom:8px;
        }

        .fallback-card p{
          font-size:13px;
          color:var(--text-muted);
          line-height:1.6;
          margin-bottom:10px;
        }

        .toast{
          position:fixed;
          left:50%;
          bottom:26px;
          transform:translateX(-50%) translateY(14px);
          background:#202437;
          color:#fff;
          padding:11px 16px;
          border-radius:999px;
          font-size:12px;
          font-weight:700;
          box-shadow:0 16px 40px rgba(0,0,0,.22);
          opacity:0;
          pointer-events:none;
          transition:all .18s ease;
          z-index:10001;
        }

        .toast.show{
          opacity:1;
          transform:translateX(-50%) translateY(0);
        }

        .empty-state{
          grid-column:1 / -1;
          border-radius:var(--radius-md);
          padding:20px;
          background:var(--bg-soft);
          border:1px dashed var(--border-subtle);
          color:var(--text-muted);
          font-size:14px;
          line-height:1.6;
        }

        .btn-primary:focus,
        .btn-ghost:focus,
        .btn-buy:focus,
        .btn-share:focus,
        .btn-download:focus,
        .btn-newtab:focus,
        .set-item:focus,
        .tab:focus{
          outline:3px solid rgba(106,92,255,.22);
          outline-offset:2px;
        }

        @media (max-width: 980px){
          .layout{grid-template-columns:1fr}
          .sets-card{display:none}
          .mobile-tabs{display:flex}
          .preview-grid{grid-template-columns:1fr}
          .page-header h1{font-size:22px}
          .sets{max-height:none}
        }

        @media (max-width: 768px){
          .page-inner{padding:16px 12px 95px}
          .page-header{padding:8px 0 12px}
          .page-header h1{font-size:22px}
          .header-actions{width:100%;justify-content:flex-start}
          .modal{padding:10px}
          .modal-panel{height:95vh;border-radius:16px}
          .modal-header{padding:12px}
          .modal-title{font-size:16px}
          .modal-subtitle{font-size:12px}
          .modal-actions{width:100%}
          .modal-actions .btn-primary,
          .modal-actions .btn-ghost,
          .modal-actions .btn-buy,
          .modal-actions .btn-share,
          .modal-actions .btn-download,
          .modal-actions .btn-newtab{width:100%}
          .sticky-buy{
            left:12px;
            right:12px;
            bottom:12px;
          }
          .sticky-buy .btn-buy{width:100%}
          .docx-viewer{padding:14px}
          .docx-paper{padding:20px}
        }
      `}</style>

      <Script
        id="tiktok-teas7-viewcontent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `ttq.track('ViewContent', {
  contents: [
    {
      content_id: 'teas_7_sets',
      content_name: 'ATI TEAS 7 Practice Sets'
    }
  ],
  value: 99,
  currency: 'USD'
});`,
        }}
      />
    </>
  );
}

