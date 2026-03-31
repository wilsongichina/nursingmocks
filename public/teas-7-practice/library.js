(function () {
  const sets = [
    { id: 6, display: "2026 - TEAS Version 7 Set 6", files: [{ type: "pdf", name: "2026 - ATI TEAS Version 7 Set 6_updated.pdf" }, { type: "word", name: "2026 - ATI TEAS Version 7 Set 6_updated.docx" }] },
    { id: 7, display: "2026 - TEAS Version 7 Set 7", files: [{ type: "pdf", name: "2026 - ATI TEAS Version 7 Set 7_updated.pdf" }, { type: "word", name: "2026 - ATI TEAS Version 7 Set 7_updated.docx" }] },
    { id: 8, display: "2026 - TEAS Version 7 Set 8", files: [{ type: "pdf", name: "2026 - ATI TEAS Version 7 Set 8_updated.pdf" }, { type: "word", name: "2026 - ATI TEAS Version 7 Set 8_updated.docx" }] },
    { id: 9, display: "2026 - TEAS Version 7 Set 9", files: [{ type: "pdf", name: "2026 - ATI TEAS Version 7 Set 9_updated.pdf" }, { type: "word", name: "2026 - ATI TEAS Version 7 Set 9_updated.docx" }] },
    { id: 10, display: "2026 - TEAS Version 7 Set 10", files: [{ type: "pdf", name: "2026 - ATI TEAS Version 7 Set 10_updated.pdf" }, { type: "word", name: "2026 - ATI TEAS Version 7 Set 10_updated.docx" }] },
    { id: 1, display: "2025 - TEAS Version 7 Set 1", files: [{ type: "pdf", name: "2025 - ATI TEAS Version 7 Set 1_updated.pdf" }, { type: "word", name: "2025 - ATI TEAS Version 7 Set 1_updated.docx" }] },
    { id: 2, display: "2025 - TEAS Version 7 Set 2", files: [{ type: "pdf", name: "2025 - ATI TEAS Version 7 Set 2_updated.pdf" }, { type: "word", name: "2025 - ATI TEAS Version 7 Set 2_updated.docx" }] },
    { id: 3, display: "2025 - TEAS Version 7 Set 3", files: [{ type: "pdf", name: "2025 - ATI TEAS Version 7 Set 3_updated.pdf" }, { type: "word", name: "2025 - ATI TEAS Version 7 Set 3_updated.docx" }] },
    { id: 4, display: "2025 - TEAS Version 7 Set 4", files: [{ type: "pdf", name: "2025 - ATI TEAS Version 7 Set 4_updated.pdf" }, { type: "word", name: "2025 - ATI TEAS Version 7 Set 4_updated.docx" }] },
    { id: 5, display: "2025 - TEAS Version 7 Set 5", files: [{ type: "pdf", name: "2025 - ATI TEAS Version 7 Set 5_updated.pdf" }, { type: "word", name: "2025 - ATI TEAS Version 7 Set 5_updated.docx" }] },
  ];

  const SUBJECT_TEXT = "20 preview questions • 5 questions from each subject";
  const BOOKMARK_KEY = "nursingmocks-teas-library-bookmark-v7";
  let activeSetId = sets[0].id;
  let currentModalFile = null;
  let mobilePdfRenderToken = 0;
  let mobilePdfState = {
    doc: null,
    page: 1,
    pages: 1,
    scale: 1,
  };

  const els = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const raw of cookies) {
      const entry = raw.trim();
      if (entry.startsWith(prefix)) return entry.slice(prefix.length);
    }
    return "";
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function readBookmarkState() {
    try {
      return localStorage.getItem(BOOKMARK_KEY) === "true";
    } catch (_err) {
      return getCookie(BOOKMARK_KEY) === "true";
    }
  }

  function persistBookmarkState(isBookmarked) {
    const value = isBookmarked ? "true" : "false";
    try {
      localStorage.setItem(BOOKMARK_KEY, value);
    } catch (_err) {}
    setCookie(BOOKMARK_KEY, value, 365);
  }

  function applyBookmarkUi(isBookmarked) {
    if (!els.bookmarkBtn) return;
    els.bookmarkBtn.textContent = isBookmarked ? "★ Bookmarked" : "☆ Bookmark This Page";
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      els.toast.classList.remove("show");
    }, 2000);
  }

  function initBookmark() {
    if (!els.bookmarkBtn) return;
    applyBookmarkUi(readBookmarkState());
    els.bookmarkBtn.addEventListener("click", () => {
      const next = !readBookmarkState();
      persistBookmarkState(next);
      applyBookmarkUi(next);
      showToast(next ? "Page bookmarked." : "Bookmark removed.");
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function resolveAccessibleUrl(filename) {
    const encoded = encodeURIComponent(filename);
    const candidates = [
      `/teas-7-practice/${encoded}`,
      `/public/teas-7-practice/${encoded}`,
    ];
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { method: "HEAD" });
        if (response.ok) return new URL(candidate, window.location.origin).href;
      } catch (_err) {}
    }
    return new URL(candidates[0], window.location.origin).href;
  }

  function fileIconSvg(type) {
    if (type === "word") {
      return '<svg class="file-icon word" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" fill="currentColor" opacity=".16"/><path d="M14 2v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 10.5l1.1 5 1.2-3.1 1.2 3.1 1.1-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    return '<svg class="file-icon pdf" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" fill="currentColor" opacity=".16"/><path d="M14 2v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.8 16.2v-4.4h1.9a1.3 1.3 0 1 1 0 2.6H8.8m6.3 1.8c-1.8 0-2.9-.9-2.9-2.2s1.1-2.2 2.9-2.2m0 0h.1m-3.1 4.4h3.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function hideAllViewers() {
    mobilePdfRenderToken += 1;
    els.previewFrame.style.display = "none";
    els.previewFrame.src = "about:blank";
    els.mobilePdfViewer.classList.remove("show");
    els.mobilePdfCanvasWrap.innerHTML = "";
    mobilePdfState = { doc: null, page: 1, pages: 1, scale: 1 };
    updateMobilePdfUiState();
    els.docxViewer.classList.remove("show");
    els.docxPaper.innerHTML = "";
    els.fallback.classList.remove("show");
    els.docxLoading.classList.remove("show");
  }

  function isMobileDevice() {
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  }

  function setModalIcon(type) {
    els.modalFileBadge.className = `modal-file-badge ${type === "word" ? "word" : "pdf"}`;
    els.modalFileBadge.innerHTML = fileIconSvg(type);
  }

  function renderSets() {
    els.setsList.innerHTML = sets.map((set) => {
      const isActive = set.id === activeSetId;
      return `<button class="set-item ${isActive ? "active" : ""}" type="button" data-set="${set.id}" aria-pressed="${isActive}"><div class="set-left"><div class="set-ico">${set.id}</div><div class="set-meta"><h3>${escapeHtml(set.display)}</h3><p>${SUBJECT_TEXT}</p></div></div><div class="set-right"><div class="tiny-status">${isActive ? "Viewing" : "Select"}</div></div></button>`;
    }).join("");

    els.mobileTabs.innerHTML = sets.map((set) => {
      const isActive = set.id === activeSetId;
      return `<button class="tab ${isActive ? "active" : ""}" type="button" data-set="${set.id}">Set ${set.id}</button>`;
    }).join("");

    document.querySelectorAll("[data-set]").forEach((btn) => {
      btn.addEventListener("click", () => setActiveSet(Number(btn.getAttribute("data-set"))));
    });
  }

  function renderRightPanel() {
    const set = sets.find((s) => s.id === activeSetId);
    if (!set) return;

    els.setHeading.textContent = set.display;
    els.setSub.innerHTML = `This set includes <strong>20 preview questions</strong>, with <strong>5 questions from each subject</strong>, available in ${set.files.map((f) => f.type.toUpperCase()).join(" + ")} format.`;
    els.fullSetLabel.textContent = set.display;

    els.previewGrid.innerHTML = set.files.map((file) => {
      const niceType = file.type === "pdf" ? "PDF" : "Word";
      return `<article class="preview-card"><div class="preview-head"><div class="preview-left"><div class="preview-ico ${file.type === "pdf" ? "pdf" : "word"}">${fileIconSvg(file.type)}</div><div><div class="preview-title">${escapeHtml(set.display)} — ${niceType} Preview</div><div class="preview-sub">Open the ${niceType} preview for this set. Share, download, and open in new tab are available inside the popup.</div></div></div><span class="pill">${niceType} File</span></div><div class="preview-foot"><button class="btn-primary open-preview-btn" type="button" data-file="${escapeHtml(file.name)}" data-type="${file.type}" data-title="${escapeHtml(set.display)} — ${niceType} Preview">Preview ${niceType}</button></div></article>`;
    }).join("");

    document.querySelectorAll(".open-preview-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openPreview({
          title: btn.dataset.title,
          fileName: btn.dataset.file,
          type: btn.dataset.type,
        });
      });
    });
  }

  function setActiveSet(id) {
    activeSetId = id;
    renderSets();
    renderRightPanel();
  }

  async function renderWordPreview(absoluteFileUrl) {
    hideAllViewers();
    els.docxLoading.classList.add("show");
    try {
      const response = await fetch(absoluteFileUrl);
      if (!response.ok) throw new Error("Failed to load");
      const buffer = await response.arrayBuffer();
      if (!window.mammoth) throw new Error("Mammoth unavailable");
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
      els.docxPaper.innerHTML = result.value || "<p>No preview content found.</p>";
      els.docxViewer.classList.add("show");
    } catch (_err) {
      els.fallback.classList.add("show");
      els.fallbackText.textContent = "The Word preview could not be rendered here. You can still download the file or open it in a new tab.";
    } finally {
      els.docxLoading.classList.remove("show");
    }
  }

  function openPdfPreview(url) {
    hideAllViewers();
    if (isMobileDevice()) {
      renderMobilePdfPreview(url);
      return;
    }
    els.previewFrame.style.display = "block";
    els.previewFrame.src = url;
  }

  async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    try {
      const pdfModule = await import("https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.min.mjs");
      if (!window.pdfjsLib) {
        window.pdfjsLib = pdfModule;
      }
    } catch (_err) {
      return null;
    }
    return window.pdfjsLib || null;
  }

  function updateMobilePdfUiState() {
    if (!els.mobilePdfPageInfo || !els.mobilePdfPrevBtn || !els.mobilePdfNextBtn) return;
    const { doc, page, pages } = mobilePdfState;
    els.mobilePdfPageInfo.textContent = `Page ${page} of ${pages}`;
    const disabled = !doc;
    els.mobilePdfPrevBtn.disabled = disabled || page <= 1;
    els.mobilePdfNextBtn.disabled = disabled || page >= pages;
    if (els.mobilePdfZoomOutBtn) els.mobilePdfZoomOutBtn.disabled = disabled;
    if (els.mobilePdfZoomInBtn) els.mobilePdfZoomInBtn.disabled = disabled;
  }

  async function renderMobilePdfCurrentPage() {
    const token = mobilePdfRenderToken;
    const { doc, page, scale } = mobilePdfState;
    if (!doc) return;

    els.docxLoading.classList.add("show");
    try {
      const pdfPage = await doc.getPage(page);
      if (token !== mobilePdfRenderToken) return;
      const viewport = pdfPage.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas unavailable");
      canvas.className = "mobile-pdf-page";
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      els.mobilePdfCanvasWrap.innerHTML = "";
      els.mobilePdfCanvasWrap.appendChild(canvas);
      await pdfPage.render({ canvasContext: context, viewport }).promise;
    } finally {
      if (token === mobilePdfRenderToken) {
        els.docxLoading.classList.remove("show");
      }
    }
  }

  async function renderMobilePdfPreview(url) {
    const token = mobilePdfRenderToken;
    els.docxLoading.classList.add("show");
    els.mobilePdfViewer.classList.add("show");

    try {
      const pdfjs = await loadPdfJs();
      if (!pdfjs) throw new Error("pdfjs unavailable");

      // Required for PDF.js worker support when loaded from CDN.
      pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";

      const loadingTask = pdfjs.getDocument(url);
      const pdfDoc = await loadingTask.promise;
      if (token !== mobilePdfRenderToken) return;
      const firstPage = await pdfDoc.getPage(1);
      const initialViewport = firstPage.getViewport({ scale: 1 });
      const containerWidth = Math.max(280, els.mobilePdfCanvasWrap.clientWidth || 320);
      const fitScale = containerWidth / initialViewport.width;
      mobilePdfState = {
        doc: pdfDoc,
        page: 1,
        pages: pdfDoc.numPages,
        scale: fitScale,
      };
      updateMobilePdfUiState();
      await renderMobilePdfCurrentPage();
    } catch (_err) {
      els.mobilePdfViewer.classList.remove("show");
      els.fallback.classList.add("show");
      els.fallbackText.textContent = "Mobile PDF preview is unavailable right now. Use Open in New Tab or download the file.";
      mobilePdfState = { doc: null, page: 1, pages: 1, scale: 1 };
      updateMobilePdfUiState();
    } finally {
      if (token === mobilePdfRenderToken) {
        els.docxLoading.classList.remove("show");
      }
    }
  }

  async function openPreview({ title, fileName, type }) {
    const absoluteFileUrl = await resolveAccessibleUrl(fileName);
    currentModalFile = { title, fileName, absoluteFileUrl, type };

    els.modalTitleText.textContent = title;
    els.modalSubtitle.textContent = `${fileName} • ${SUBJECT_TEXT}`;
    els.openNewTab.href = absoluteFileUrl;
    els.downloadModalBtn.href = absoluteFileUrl;
    els.downloadModalBtn.setAttribute("download", fileName);
    setModalIcon(type);

    els.previewModal.classList.add("show");
    els.previewModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (type === "pdf") openPdfPreview(absoluteFileUrl);
    else await renderWordPreview(absoluteFileUrl);
  }

  function closePreview() {
    els.previewModal.classList.remove("show");
    els.previewModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentModalFile = null;
    hideAllViewers();
  }

  async function shareCurrentFile() {
    if (!currentModalFile) {
      showToast("Open a file preview first.");
      return;
    }

    const shareUrl = currentModalFile.absoluteFileUrl;
    const shareText = `${currentModalFile.title}\n\n${SUBJECT_TEXT}\n\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentModalFile.title,
          text: SUBJECT_TEXT,
          url: shareUrl,
        });
        showToast("File link shared.");
        return;
      } catch (_err) {}
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("File link copied.");
        return;
      } catch (_err) {}
    }

    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("File link copied.");
    } catch (_err) {
      showToast("Unable to share link.");
    } finally {
      document.body.removeChild(textArea);
    }
  }

  function init() {
    els.setsList = byId("setsList");
    els.mobileTabs = byId("mobileTabs");
    els.setHeading = byId("setHeading");
    els.setSub = byId("setSub");
    els.fullSetLabel = byId("fullSetLabel");
    els.previewGrid = byId("previewGrid");
    els.previewModal = byId("previewModal");
    els.modalTitleText = byId("modalTitleText");
    els.modalSubtitle = byId("modalSubtitle");
    els.modalFileBadge = byId("modalFileBadge");
    els.openNewTab = byId("openNewTab");
    els.downloadModalBtn = byId("downloadModalBtn");
    els.shareModalBtn = byId("shareModalBtn");
    els.closeModal = byId("closeModal");
    els.previewFrame = byId("previewFrame");
    els.mobilePdfViewer = byId("mobilePdfViewer");
    els.mobilePdfCanvasWrap = byId("mobilePdfCanvasWrap");
    els.mobilePdfPrevBtn = byId("mobilePdfPrevBtn");
    els.mobilePdfNextBtn = byId("mobilePdfNextBtn");
    els.mobilePdfZoomOutBtn = byId("mobilePdfZoomOutBtn");
    els.mobilePdfZoomInBtn = byId("mobilePdfZoomInBtn");
    els.mobilePdfPageInfo = byId("mobilePdfPageInfo");
    els.docxViewer = byId("docxViewer");
    els.docxPaper = byId("docxPaper");
    els.docxLoading = byId("docxLoading");
    els.fallback = byId("fallback");
    els.fallbackText = byId("fallbackText");
    els.bookmarkBtn = byId("bookmarkBtn");
    els.toast = byId("toast");

    if (!els.setsList || !els.previewGrid || !els.previewModal) return;

    els.closeModal.addEventListener("click", closePreview);
    if (els.shareModalBtn) {
      els.shareModalBtn.addEventListener("click", shareCurrentFile);
    }
    els.previewModal.addEventListener("click", (event) => {
      if (event.target === els.previewModal) closePreview();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.previewModal.classList.contains("show")) closePreview();
    });
    if (els.mobilePdfPrevBtn) {
      els.mobilePdfPrevBtn.addEventListener("click", async () => {
        if (!mobilePdfState.doc || mobilePdfState.page <= 1) return;
        mobilePdfState.page -= 1;
        updateMobilePdfUiState();
        await renderMobilePdfCurrentPage();
      });
    }
    if (els.mobilePdfNextBtn) {
      els.mobilePdfNextBtn.addEventListener("click", async () => {
        if (!mobilePdfState.doc || mobilePdfState.page >= mobilePdfState.pages) return;
        mobilePdfState.page += 1;
        updateMobilePdfUiState();
        await renderMobilePdfCurrentPage();
      });
    }
    if (els.mobilePdfZoomOutBtn) {
      els.mobilePdfZoomOutBtn.addEventListener("click", async () => {
        if (!mobilePdfState.doc) return;
        mobilePdfState.scale = Math.max(0.5, mobilePdfState.scale - 0.1);
        await renderMobilePdfCurrentPage();
      });
    }
    if (els.mobilePdfZoomInBtn) {
      els.mobilePdfZoomInBtn.addEventListener("click", async () => {
        if (!mobilePdfState.doc) return;
        mobilePdfState.scale = Math.min(3, mobilePdfState.scale + 0.1);
        await renderMobilePdfCurrentPage();
      });
    }

    renderSets();
    renderRightPanel();
    setModalIcon("pdf");
    initBookmark();
    updateMobilePdfUiState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

