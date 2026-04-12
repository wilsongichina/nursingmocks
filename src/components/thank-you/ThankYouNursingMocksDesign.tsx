const DROPBOX_URL =
  "https://www.dropbox.com/scl/fo/927ocx9whurd076pb8qda/AIEK7sGsPfmMNcD4Cx_wDUk?rlkey=097bg49gl6eia033s02uyv5ux&st=nht1m64m&dl=0";

const NURSINGMOCKS_HOME = "https://www.nursingmocks.com/";

const btnPrimaryClass =
  "rounded-full px-[18px] py-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition duration-150 shadow-[0_12px_30px_rgba(106,92,255,0.35)] whitespace-nowrap cursor-pointer border-0 bg-[#6a5cff] text-white hover:-translate-y-px hover:bg-[#4f46e5] hover:shadow-[0_14px_36px_rgba(79,70,229,0.45)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(106,92,255,0.22)] focus-visible:outline-offset-2";

const btnGhostClass =
  "rounded-full px-[18px] py-3 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition duration-150 whitespace-nowrap cursor-pointer border border-[#e0e3f0] bg-white text-[#7a819c] hover:-translate-y-px hover:bg-[rgba(106,92,255,0.10)] hover:border-[rgba(106,92,255,0.30)] hover:text-[#6a5cff] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(106,92,255,0.22)] focus-visible:outline-offset-2";

export function ThankYouNursingMocksDesign() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(106,92,255,0.06),transparent_55%),#f5f6fb] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#202437] antialiased">
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col justify-center px-4 pb-[70px] pt-[18px] max-md:px-3 max-md:pb-[95px] max-md:pt-4">
          <header
            className="py-2.5 max-md:py-2 max-md:pb-3"
            aria-label="Page header"
          >
            <div className="flex flex-wrap items-start justify-between gap-3.5">
              <div>
                <h1 className="mb-2 text-[26px] font-black tracking-tight text-[#202437] max-md:text-[22px]">
                  Thank You
                </h1>
                <p className="max-w-[92ch] text-sm leading-[1.65] text-[#7a819c]">
                  Your NursingMocks files are ready. Open your Dropbox folder
                  below to access your purchased materials and continue your TEAS
                  preparation.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-[rgba(106,92,255,0.35)] bg-[rgba(106,92,255,0.05)] px-2.5 py-1.5 text-[11px] font-bold text-[#6a5cff]">
                    Purchase successful
                  </span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-[#e0e3f0] bg-[#f1f2fb] px-2.5 py-1.5 text-[11px] font-bold text-[#7a819c]">
                    Instant access
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section
            className="mt-2.5 grid grid-cols-1 items-stretch gap-[18px] min-[981px]:grid-cols-[minmax(0,1fr)_320px]"
            aria-label="Thank you section"
          >
            <main className="overflow-hidden rounded-2xl bg-white p-[22px] shadow-[0_18px_45px_rgba(23,35,79,0.08)] max-md:px-4 max-md:py-[18px]">
              <div>
                <h2 className="mb-2.5 text-[26px] font-black leading-tight tracking-tight text-[#202437] max-md:text-[22px]">
                  Your study files are ready to open
                </h2>
                <p className="max-w-[72ch] text-sm leading-[1.7] text-[#7a819c]">
                  Use the access button below to open your Dropbox files. This
                  page keeps the same NursingMocks visual rhythm with a cleaner
                  layout, lighter typography, and simpler content structure.
                </p>
              </div>

              <hr className="my-[18px] border-0 border-t border-dashed border-[#e0e3f0]" />

              <section
                className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl border border-dashed border-[#e0e3f0] bg-[#f1f2fb] p-3.5 max-md:p-3"
                aria-label="Main action"
              >
                <div>
                  <div className="mb-1.5 text-xs font-extrabold text-[#7a819c]">
                    Access your purchase
                  </div>
                  <div className="max-w-[60ch] text-xs leading-[1.55] text-[#a0a5bf]">
                    Tap the Dropbox button to view or download the files connected
                    to your order.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 max-md:w-full max-md:flex-col max-md:items-stretch">
                  <a
                    href={DROPBOX_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${btnPrimaryClass} max-md:hidden`}
                  >
                    Open Your Files
                  </a>
                  <a
                    href={NURSINGMOCKS_HOME}
                    className={`${btnGhostClass} max-md:w-full`}
                  >
                    Visit NursingMocks
                  </a>
                </div>
              </section>

              <section
                className="mt-4 grid grid-cols-1 gap-3 min-[981px]:grid-cols-3"
                aria-label="Helpful notes"
              >
                <article className="rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-[rgba(106,92,255,0.05)] p-3.5">
                  <h3 className="mb-1.5 text-sm font-extrabold leading-snug tracking-tight text-[#202437]">
                    Open your Dropbox folder
                  </h3>
                  <p className="text-xs leading-relaxed text-[#7a819c]">
                    Use the main button to access the materials included with your
                    purchase.
                  </p>
                </article>
                <article className="rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-[rgba(106,92,255,0.05)] p-3.5">
                  <h3 className="mb-1.5 text-sm font-extrabold leading-snug tracking-tight text-[#202437]">
                    Save your files
                  </h3>
                  <p className="text-xs leading-relaxed text-[#7a819c]">
                    Download the resources to your phone or laptop for easier
                    review later.
                  </p>
                </article>
                <article className="rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-[rgba(106,92,255,0.05)] p-3.5">
                  <h3 className="mb-1.5 text-sm font-extrabold leading-snug tracking-tight text-[#202437]">
                    Start your review
                  </h3>
                  <p className="text-xs leading-relaxed text-[#7a819c]">
                    Begin with the section you want to improve first and build
                    from there.
                  </p>
                </article>
              </section>
            </main>

            <aside
              className="flex flex-col gap-3 overflow-hidden rounded-2xl bg-white p-[18px] shadow-[0_18px_45px_rgba(23,35,79,0.08)] max-md:p-4"
              aria-label="Quick steps"
            >
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#a0a5bf]">
                Next steps
              </h3>
              <hr className="border-0 border-t border-dashed border-[#e0e3f0]" />

              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-white p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-dashed border-[rgba(106,92,255,0.35)] bg-[rgba(106,92,255,0.05)] text-xs font-black text-[#6a5cff]">
                    1
                  </div>
                  <div>
                    <strong className="mb-1 block text-[13px] font-extrabold leading-snug tracking-tight text-[#202437]">
                      Open the files
                    </strong>
                    <span className="text-xs leading-[1.55] text-[#7a819c]">
                      Go to Dropbox and confirm the materials open correctly.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-white p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-dashed border-[rgba(106,92,255,0.35)] bg-[rgba(106,92,255,0.05)] text-xs font-black text-[#6a5cff]">
                    2
                  </div>
                  <div>
                    <strong className="mb-1 block text-[13px] font-extrabold leading-snug tracking-tight text-[#202437]">
                      Download for later
                    </strong>
                    <span className="text-xs leading-[1.55] text-[#7a819c]">
                      Keep a copy on your device so your study materials stay easy
                      to reach.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(106,92,255,0.25)] bg-white p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-dashed border-[rgba(106,92,255,0.35)] bg-[rgba(106,92,255,0.05)] text-xs font-black text-[#6a5cff]">
                    3
                  </div>
                  <div>
                    <strong className="mb-1 block text-[13px] font-extrabold leading-snug tracking-tight text-[#202437]">
                      Begin studying
                    </strong>
                    <span className="text-xs leading-[1.55] text-[#7a819c]">
                      Start with your chosen section and move through the material
                      steadily.
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>

        <div className="fixed bottom-3 left-3 right-3 z-[999] hidden max-md:block">
          <a
            href={DROPBOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimaryClass} w-full py-4 text-sm`}
          >
            Open Your Files
          </a>
        </div>
      </div>
    </div>
  );
}
