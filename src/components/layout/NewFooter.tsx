"use client";

import Image from "next/image";
import Link from "next/link";

interface NewFooterProps {
  showSidebar?: boolean;
  isCollapsed?: boolean;
}

export default function NewFooter({ showSidebar = false, isCollapsed: _isCollapsed = false }: NewFooterProps) {
  // For pages with sidebar, show only the legal links section with same height as logout button block
  // Logout button block: p-4 (16px) + button py-3 (12px) + icon h-8 (32px) + button py-3 (12px) + p-4 (16px) = 88px
  if (showSidebar) {
    return (
      <footer className="bg-[#050b19] text-[#e5e7eb] border-t border-[#1f2937] min-h-[88px] flex flex-col justify-center w-full py-3">
        <div className="w-full px-4 max-w-[1320px] mx-auto">
          <p className="text-[12px] text-[#6b7280] text-center mb-3 leading-relaxed max-w-[900px] mx-auto">
            NursingMocks is an independent resource for nursing students and is not affiliated with ATI, Elsevier, HESI, or any nursing program. All trademarks are the property of their respective owners. Always follow your school's policies and academic integrity guidelines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#9ca3af]">
            <Link
              href="/privacy-policy"
              className="no-underline hover:text-[#e5e7eb] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[#1f2937]">•</span>
            <Link
              href="/terms-and-conditions"
              className="no-underline hover:text-[#e5e7eb] transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-[#1f2937]">•</span>
            <Link
              href="/money-back-guarantee"
              className="no-underline hover:text-[#e5e7eb] transition-colors"
            >
              Money-Back Guarantee
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  // For pages without sidebar, show full footer
  return (
    <footer className="bg-[#050b19] text-[#e5e7eb] pt-10 pb-[18px] relative">
      <div className="max-w-[1320px] mx-auto w-[94%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.2fr_1.2fr_1.2fr] gap-10 items-start">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 no-underline"
              aria-label="TEAS Gurus home"
            >
              <Image
                src="/teas-gurus-logo.png"
                alt="TEAS Gurus Logo"
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <div className="text-[14px] text-[#9ca3af] max-w-[380px] leading-[1.5]">
              NursingMocks helps nursing students move from entrance exams to graduation with one organized prep hub:
              ATI TEAS, HESI A2, ATI &amp; HESI nursing test banks, and nursing exit exams for LPN &amp; RN programs.
            </div>
          </div>

          {/* Exams Covered Column */}
          <div className="text-[14px]">
            <div className="text-[15px] text-[#f9fafb] mb-2.5" style={{ fontWeight: 600 }}>
              Exams Covered
            </div>
            <Link
              href="/ati-teas-practice-test"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              ATI TEAS 7
            </Link>
            <Link
              href="/hesi-a2-practice-test"
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
              href="/nursing-exit-exam"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#e5e7eb] hover:translate-x-[2px] transition-all"
            >
              Nursing Exit Exams (LPN &amp; RN)
            </Link>
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
              href="/contact"
              className="block text-[13px] text-[#9ca3af] mb-1.5 no-underline hover:text-[#f9fafb] hover:translate-x-[2px] transition-all"
            >
              Contact Us
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

