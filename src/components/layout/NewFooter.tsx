import Link from "next/link";

export default function NewFooter() {
  return (
    <footer className="bg-[#050b19] text-[#e5e7eb] pt-10 pb-[18px] relative">
      <div className="max-w-[1320px] mx-auto w-[94%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1.2fr_1.2fr] gap-10 items-start">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[18px] text-[#f9fafb] no-underline"
              style={{ fontWeight: 600 }}
              aria-label="NursingMocks home"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563eb] to-[#22c55e] flex items-center justify-center text-[18px] text-[#f9fafb] shadow-[0_12px_30px_rgba(15,23,42,0.7)]">
                N
              </div>
              <span>NursingMocks</span>
            </Link>
            <div className="text-[14px] text-[#9ca3af] max-w-[380px] leading-[1.5]">
              NursingMocks helps nursing students move from entrance exams to graduation with one organized prep hub:
              ATI TEAS, HESI A2, ATI &amp; HESI nursing test banks, and nursing exit exams for LPN &amp; RN programs.
            </div>
            <div className="flex gap-2.5 items-center">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#e5e7eb] hover:bg-[#111827] hover:border-[#4b5563] hover:-translate-y-[1px] transition-all"
                aria-label="Visit NursingMocks on TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#e5e7eb] hover:bg-[#111827] hover:border-[#4b5563] hover:-translate-y-[1px] transition-all"
                aria-label="Visit NursingMocks on Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-[#020617] border border-[#1f2937] flex items-center justify-center text-[#e5e7eb] hover:bg-[#111827] hover:border-[#4b5563] hover:-translate-y-[1px] transition-all"
                aria-label="Visit NursingMocks on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company Column */}
          <div className="text-[14px]">
            <div className="text-[15px] text-[#f9fafb] mb-2.5" style={{ fontWeight: 600 }}>
              Company
            </div>
            <Link
              href="/pricing"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Frequently asked questions
            </Link>
            <Link
              href="/how-it-works"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              How NursingMocks works
            </Link>
            <Link
              href="/contact"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Contact NursingMocks
            </Link>
            <Link
              href="/privacy-policy"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Terms &amp; conditions
            </Link>
            <Link
              href="/money-back-guarantee"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Money-back guarantee
            </Link>
          </div>

          {/* Exams Covered Column */}
          <div className="text-[14px]">
            <div className="text-[15px] text-[#f9fafb] mb-2.5" style={{ fontWeight: 600 }}>
              Exams Covered
            </div>
            <Link
              href="/ati-teas"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              ATI TEAS 7
            </Link>
            <Link
              href="/hesi-a2"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              HESI A2
            </Link>
            <Link
              href="/nursing-test-bank"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              Nursing Test Banks (LPN &amp; RN)
            </Link>
            <Link
              href="/nursing-exit-exams"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              Nursing Exit Exams
            </Link>
          </div>
        </div>

        <div className="mt-[26px] mb-3 h-px w-full bg-[#1f2937]"></div>
        <p className="text-[12px] text-[#6b7280] text-center max-w-[900px] mx-auto leading-relaxed">
          NursingMocks is an independent resource for nursing students and is not affiliated with ATI, Elsevier, HESI, or any nursing program.
          All trademarks are the property of their respective owners. Always follow your school's policies and academic integrity guidelines.
        </p>
      </div>
    </footer>
  );
}

