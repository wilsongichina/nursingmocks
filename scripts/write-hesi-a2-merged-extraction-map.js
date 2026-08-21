const fs = require("fs");
const path = require("path");
const HESI_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Teas Guru\\Current TEAS Questions\\HESI";
function slugify(value) {
  return String(value || "").replace(/\u00a0/g, " ").trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
const sections = [
  { setNumber: 1, subject: "Mathematics", startPage: 1, endPage: 9, expectedQuestions: 38, notes: "Visible Set 1 Mathematics starts page 1. Page 9 is included as transition page because it contains the end of Mathematics and start of Vocabulary." },
  { setNumber: 1, subject: "Vocabulary", startPage: 9, endPage: 20, expectedQuestions: 50, notes: "Visible Vocabulary starts page 9 after Mathematics ends." },
  { setNumber: 1, subject: "Grammar", startPage: 21, endPage: 32, expectedQuestions: 50, notes: "Grammar starts page 21. Page 32 is included as transition page because Biology starts after Grammar content." },
  { setNumber: 1, subject: "Biology", startPage: 32, endPage: 37, expectedQuestions: 25, notes: "Biology starts page 32. Page 37 is included as transition page because Chemistry starts after Biology content." },
  { setNumber: 1, subject: "Chemistry", startPage: 37, endPage: 42, expectedQuestions: 25, notes: "Chemistry starts page 37. Page 42 is included as transition page because Reading starts after Chemistry content." },
  { setNumber: 1, subject: "Reading Comprehension", startPage: 42, endPage: 69, expectedQuestions: 60, notes: "Reading starts page 42. Pages 60-69 contain repeated/continued reading rows in model output; extract only reading questions and deduplicate by question text/number." },

  { setNumber: 2, subject: "Mathematics", startPage: 70, endPage: 77, expectedQuestions: 38, notes: "Visible Set 2 Mathematics starts page 70." },
  { setNumber: 2, subject: "Vocabulary", startPage: 78, endPage: 85, expectedQuestions: 50, notes: "Vocabulary starts page 78. Page 85 contains Vocabulary Q29-31 and the start of Grammar, so it is shared." },
  { setNumber: 2, subject: "Grammar", startPage: 85, endPage: 97, expectedQuestions: 50, notes: "Grammar starts on transition page 85. Page 90 is blank/low-confidence but kept for continuity." },
  { setNumber: 2, subject: "Biology", startPage: 98, endPage: 104, expectedQuestions: 25, notes: "Biology starts page 98. Chemistry starts on/near page 104; use subject filter during extraction." },
  { setNumber: 2, subject: "Chemistry", startPage: 104, endPage: 105, expectedQuestions: 25, notes: "Chemistry starts page 104 and page 105 transitions into Reading after Chemistry Q8. This section is likely incomplete in the merged source; requires review after extraction." , requiresReview: true},
  { setNumber: 2, subject: "Reading Comprehension", startPage: 105, endPage: 138, expectedQuestions: 60, notes: "Reading starts page 105 after Chemistry transition." },

  { setNumber: 3, subject: "Mathematics", startPage: 139, endPage: 148, expectedQuestions: 38, notes: "Set 3 inferred from page sequence and visible Math reset. Page 148 transitions into Vocabulary." },
  { setNumber: 3, subject: "Vocabulary", startPage: 148, endPage: 159, expectedQuestions: 50, notes: "Vocabulary starts page 148. Page 159 transitions into Grammar." },
  { setNumber: 3, subject: "Grammar", startPage: 159, endPage: 169, expectedQuestions: 50, notes: "Grammar starts page 159. Page 169 transitions into Biology." },
  { setNumber: 3, subject: "Biology", startPage: 169, endPage: 175, expectedQuestions: 25, notes: "Biology starts page 169. Page 175 transitions into Chemistry." },
  { setNumber: 3, subject: "Chemistry", startPage: 175, endPage: 179, expectedQuestions: 25, notes: "Chemistry starts page 175. Page 179 transitions into Reading after Chemistry Q25." },
  { setNumber: 3, subject: "Reading Comprehension", startPage: 179, endPage: 207, expectedQuestions: 60, notes: "Reading starts page 179. Pages include source watermark text and possible repeated passages; deduplicate after extraction." },

  { setNumber: 4, subject: "Mathematics", startPage: 208, endPage: 217, expectedQuestions: 38, notes: "Visible Set 4 Mathematics starts page 208. Page 217 transitions into Vocabulary." },
  { setNumber: 4, subject: "Vocabulary", startPage: 217, endPage: 227, expectedQuestions: 50, notes: "Vocabulary starts page 217. Page 227 transitions into Grammar." },
  { setNumber: 4, subject: "Grammar", startPage: 227, endPage: 238, expectedQuestions: 50, notes: "Grammar starts page 227. Page 238 transitions into Biology." },
  { setNumber: 4, subject: "Biology", startPage: 238, endPage: 243, expectedQuestions: 25, notes: "Biology starts page 238. Page 243 transitions into Chemistry." },
  { setNumber: 4, subject: "Chemistry", startPage: 243, endPage: 249, expectedQuestions: 25, notes: "Chemistry starts page 243. Page 249 transitions into Reading after Chemistry Q25." },
  { setNumber: 4, subject: "Reading Comprehension", startPage: 249, endPage: 278, expectedQuestions: 60, notes: "Reading starts page 249 and appears complete through Q60 on page 278." },

  { setNumber: null, subject: "Vocabulary", startPage: 279, endPage: 280, expectedQuestions: null, notes: "Loose fragment after Set 4 Reading. Shows Vocabulary Q1-5 with total shown as 38 by model. Do not import until reviewed or assigned to a known set.", requiresReview: true, fragment: true },
  { setNumber: null, subject: "Reading Comprehension", startPage: 281, endPage: 287, expectedQuestions: null, notes: "Loose fragment after page 280. Shows Reading questions around Q44-56 and blank final page. Do not import until reviewed or assigned to a known set.", requiresReview: true, fragment: true },
];
const enriched = sections.map((section, index) => {
  const setLabel = section.setNumber ? `Set ${section.setNumber}` : "Set unknown";
  const title = section.fragment
    ? `HESI A2 Actual Exam Unassigned Fragment - ${section.subject}`
    : `HESI A2 Actual Exam ${setLabel} - ${section.subject}`;
  return {
    id: index + 1,
    ...section,
    setLabel,
    pageCount: section.endPage - section.startPage + 1,
    extractOnlySubject: section.subject,
    suggestedQuizTitle: title,
    suggestedSlug: slugify(title),
    source: "HESI A2 ACTUAL EXAM - MERGED",
    mapStatus: section.requiresReview ? "review_before_import" : "ready_for_section_extraction",
  };
});
const report = {
  source: "HESI A2 ACTUAL EXAM - MERGED",
  pageCount: 287,
  officialSubjectBasis: "Elsevier HESI Admission Assessment Exam Review 6th edition lists Mathematics, Reading Comprehension, Vocabulary, Grammar, Biology, Chemistry, and Anatomy and Physiology. The 5th edition also listed Physics; this source did not visibly require Physics in the mapped sections.",
  mapMethod: "OpenAI page inspection using official subject labels, then manual correction using visible headers, question-number resets, and transition-page overlap.",
  transitionRule: "If a page contains the end of one subject and the start of the next, include that page in both section ranges. Extraction must filter by target subject.",
  sections: enriched,
  readySectionCount: enriched.filter((s) => s.mapStatus === "ready_for_section_extraction").length,
  reviewSectionCount: enriched.filter((s) => s.mapStatus !== "ready_for_section_extraction").length,
  generatedAt: new Date().toISOString(),
};
const outDir = path.join(HESI_ROOT, "review-reports");
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, "hesi-a2-merged-extraction-map-reviewed.json");
const csvPath = path.join(outDir, "hesi-a2-merged-extraction-map-reviewed.csv");
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
const headers = ["id", "setNumber", "setLabel", "subject", "startPage", "endPage", "pageCount", "expectedQuestions", "mapStatus", "suggestedQuizTitle", "suggestedSlug", "notes"];
const csv = [headers.join(","), ...enriched.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
fs.writeFileSync(csvPath, `${csv}\n`, "utf8");
console.log(JSON.stringify({ jsonPath, csvPath, sectionCount: enriched.length, readySectionCount: report.readySectionCount, reviewSectionCount: report.reviewSectionCount }, null, 2));
