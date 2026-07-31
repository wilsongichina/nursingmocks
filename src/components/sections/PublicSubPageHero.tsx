import Link from "next/link";
import ContentRenderer from "@/components/ui/ContentRenderer";

export interface PublicSubPageHeroCard {
  id: string;
  title: string;
  href: string;
  questionCount: number | null;
  description: string;
}

export interface PublicSubPageHeroActionLabels {
  primary: string;
  secondary: string;
  sectionTitle: string;
}

interface PublicSubPageHeroProps {
  pillarHref: string;
  pillarLabel: string;
  backHref?: string;
  backLabel?: string;
  examBadge: string;
  pageHeading: string;
  pageDescription: string;
  childCards: PublicSubPageHeroCard[];
  childSummaryLabel?: string;
  firstChildHref: string;
  actionLabels: PublicSubPageHeroActionLabels;
  primaryActionHref?: string;
  secondaryActionHref?: string;
  totalChildQuestions: number;
}

const decodeHeadingText = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findHighlightPhrase = (heading: string, examBadge: string) => {
  const candidates = [
    /ATI TEAS(?: 7)?(?: (?:Reading|Math|Mathematics|Science|English(?: and Language Usage)?))?/i,
    /TEAS(?: (?:Reading|Math|Mathematics|Science|English(?: and Language Usage)?))?/i,
    /HESI A2(?: (?:Reading|Math|Mathematics|Science|English(?: and Language Usage)?|Vocabulary|Grammar|Anatomy and Physiology))?/i,
    /Nursing Test Bank/i,
    /Nursing Exit Exams?/i,
    /RN(?: Exit Exams?| Exams?| Test Bank)?/i,
    /LPN(?: Exit Exams?| Exams?| Test Bank)?/i,
  ];

  for (const candidate of candidates) {
    const match = heading.match(candidate);
    if (match?.[0]) {
      return match[0];
    }
  }

  if (examBadge && new RegExp(escapeRegExp(examBadge), "i").test(heading)) {
    return examBadge;
  }

  return "";
};

function HighlightedPublicHeading({
  heading,
  examBadge,
}: {
  heading: string;
  examBadge: string;
}) {
  const cleanHeading = decodeHeadingText(heading);
  const highlightPhrase = findHighlightPhrase(cleanHeading, examBadge);

  if (!highlightPhrase) {
    return <>{cleanHeading}</>;
  }

  const match = cleanHeading.match(new RegExp(escapeRegExp(highlightPhrase), "i"));
  if (!match?.index && match?.index !== 0) {
    return <>{cleanHeading}</>;
  }

  const before = cleanHeading.slice(0, match.index);
  const highlighted = cleanHeading.slice(match.index, match.index + match[0].length);
  const after = cleanHeading.slice(match.index + match[0].length);

  return (
    <>
      {before}
      <span className="bg-gradient-to-r from-[#6a5cff] via-[#5548e0] to-[#4338ca] bg-clip-text text-transparent">
        {highlighted}
      </span>
      {after}
    </>
  );
}

export default function PublicSubPageHero({
  pillarHref,
  pillarLabel,
  backHref,
  backLabel,
  examBadge,
  pageHeading,
  pageDescription,
  childCards,
  childSummaryLabel = "Subjects",
  firstChildHref,
  actionLabels,
  primaryActionHref,
  secondaryActionHref,
  totalChildQuestions,
}: PublicSubPageHeroProps) {
  const formattedQuestionCount = totalChildQuestions.toLocaleString("en-US");
  const primaryHref = primaryActionHref || firstChildHref;
  const secondaryHref = secondaryActionHref || "#practice-paths";
  const resolvedBackHref = backHref || pillarHref;
  const resolvedBackLabel = backLabel || pillarLabel;

  return (
    <section className="mb-7">
      <div className="mx-auto max-w-[980px]">
        <div className="flex min-h-full flex-col py-2 sm:py-3 lg:py-4">
          <div className="mb-5 flex w-full justify-center text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <Link
                href={resolvedBackHref}
                className="inline-flex min-h-[34px] items-center rounded-full border border-[#e1e5f2] bg-white px-3 py-1.5 text-sm font-semibold text-[#4f5872] no-underline shadow-sm transition hover:border-[#c7c3ff] hover:text-[#4338ca]"
              >
                Back to {resolvedBackLabel}
              </Link>
              <span className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-[#d8d5ff] bg-white px-3 py-1.5 text-xs font-extrabold uppercase text-[#5548e0] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
                {examBadge} Practice
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="max-w-[850px] text-center text-[2rem] font-extrabold leading-[1.06] text-[#202437] [overflow-wrap:anywhere] sm:text-[3.2rem] sm:leading-[1.04] lg:text-[4rem]">
              <HighlightedPublicHeading heading={pageHeading} examBadge={examBadge} />
            </h1>

            <div className="mt-5 max-w-[78ch] text-center text-base leading-7 text-[#3b4058] sm:text-lg sm:leading-8 [&_.rich-text-content_p]:mb-0 [&_.rich-text-content_p:last-child]:mb-0 [&_.pb-25]:!pb-0 [&_div.pb-25]:!pb-0">
              <ContentRenderer content={pageDescription} />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="user-pill user-pill-purple">Exam: {examBadge}</span>
              <span className="user-pill">Category: {pillarLabel}</span>
              <span className="user-badge user-badge-green">Preview: Free</span>
              {childCards.length > 0 && (
                <span className="user-badge">
                  {childSummaryLabel}: {childCards.length}
                </span>
              )}
              {totalChildQuestions > 0 && (
                <span className="user-badge user-badge-green">
                  Questions: {formattedQuestionCount}
                </span>
              )}
            </div>

            <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <a href={primaryHref} className="user-button-primary w-full max-w-[20rem] sm:w-auto">
                {actionLabels.primary}
              </a>
              <a href={secondaryHref} className="user-button-secondary w-full max-w-[20rem] sm:w-auto">
                {actionLabels.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
