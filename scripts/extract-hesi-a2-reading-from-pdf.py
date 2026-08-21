import json
import re
import sys
from pathlib import Path
from pypdf import PdfReader

HESI_ROOT = Path(r"C:\Users\wilso\OneDrive\Desktop\Teas Guru\Current TEAS Questions\HESI")
PDF_PATH = HESI_ROOT / "HESI A2 ACTUAL EXAM -MERGED (1).pdf"
SOURCE = "HESI A2 ACTUAL EXAM - MERGED"
MAP_PATH = HESI_ROOT / "review-reports" / "hesi-a2-merged-extraction-map-reviewed.json"
OUT_DIR = HESI_ROOT / "converted-json"
REPORT_DIR = HESI_ROOT / "review-reports"


def slugify(value):
    value = re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip().lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    value = re.sub(r"-{2,}", "-", value)
    return value


def clean_text(value):
    value = str(value or "")
    value = value.replace("\u2022", "?")
    value = value.replace("???", "'").replace("???", '"').replace("???", '"')
    value = value.replace("???", "-").replace("???", "-")
    value = re.sub(r"[ \t]+", " ", value)
    return value.strip()


def html(value):
    return "<p>" + clean_text(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") + "</p>"


def read_map():
    text = MAP_PATH.read_text(encoding="utf-8-sig")
    return json.loads(text)


def section_by_id(section_id):
    for section in read_map().get("sections", []):
        if int(section.get("id", 0)) == int(section_id):
            return section
    raise SystemExit(f"Section {section_id} not found")


def extract_pages(reader, start, end):
    chunks = []
    offset = 0
    page_ranges = []
    for page_no in range(start, end + 1):
        text = reader.pages[page_no - 1].extract_text() or ""
        marker = f"\n[[PAGE:{page_no}]]\n"
        part = marker + text
        chunks.append(part)
        page_ranges.append((offset, offset + len(part), page_no))
        offset += len(part)
    return "".join(chunks), page_ranges


def page_for_offset(page_ranges, offset):
    for start, end, page_no in page_ranges:
        if start <= offset < end:
            return page_no
    return page_ranges[-1][2]


def parse_options(options_text):
    labels = list(re.finditer(r"(?:^|\n)\s*(?:•\s*)?([A-F])\.\s*", options_text))
    options = {}
    for index, match in enumerate(labels):
        label = match.group(1)
        start = match.end()
        end = labels[index + 1].start() if index + 1 < len(labels) else len(options_text)
        choice = clean_text(options_text[start:end])
        choice = re.sub(r"\s*?\s*$", "", choice).strip()
        if choice:
            options[label] = {"choice": choice, "reason": ""}
    return options


def parse_questions(full_text, page_ranges, section):
    target_total_pattern = re.compile(r"Question\s+(\d+)\s+of\s+60\s*:", re.I)
    matches = list(target_total_pattern.finditer(full_text))
    questions = []
    for idx, match in enumerate(matches):
        qnum = int(match.group(1))
        block_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(full_text)
        block = full_text[match.end():block_end]
        answer_match = re.search(r"(?:^|\n)\s*(?:•\s*)?Correct Answer:\s*([A-F])\b", block, re.I)
        if not answer_match:
            continue
        usable = block[:answer_match.start()]
        correct = answer_match.group(1).upper()
        first_option = re.search(r"(?:^|\n)\s*(?:•\s*)?[A-F]\.\s*", usable)
        if not first_option:
            continue
        stem = clean_text(usable[:first_option.start()])
        options = parse_options(usable[first_option.start():])
        if not stem or not options:
            continue
        start_page = page_for_offset(page_ranges, match.start())
        end_page = page_for_offset(page_ranges, match.start() + answer_match.end())
        source_pages = list(range(start_page, end_page + 1))
        questions.append({
            "sourceQuestionNumber": qnum,
            "question": html(stem),
            "options": options,
            "correctAnswer": correct,
            "correct_answer": correct,
            "solution": html(f"The source document marks option {correct} as the correct answer."),
            "question_type_id": 1,
            "subquestions": [],
            "match_option": None,
            "image_path": None,
            "units": None,
            "sourcePages": source_pages,
            "answerSource": "source_visible",
            "optionsSource": "source_visible",
            "explanationSource": "ai_generated",
            "continuationMerged": len(source_pages) > 1,
            "needsReview": False,
            "reviewNotes": "Extracted from embedded PDF text; source answer preserved.",
        })
    # Keep first occurrence for each visible source question number.
    deduped = []
    seen = set()
    for question in questions:
        number = question["sourceQuestionNumber"]
        if number in seen:
            continue
        seen.add(number)
        deduped.append(question)
    return deduped


def normalize_question(raw, index, section):
    subject_slug = slugify(section["subject"])
    question_text = raw["question"]
    return {
        "id": f"hesi-a2-actual-set-{section['setNumber']}-{subject_slug}-q{index + 1}",
        "question": question_text,
        "tabs": None,
        "options": raw["options"],
        "correctAnswer": raw["correctAnswer"],
        "correct_answer": raw["correct_answer"],
        "solution": raw["solution"],
        "question_type_id": 1,
        "subquestions": [],
        "match_option": None,
        "image_path": None,
        "units": None,
        "question_slug": slugify(re.sub(r"<[^>]*>", " ", question_text)[:160]) or f"question-{index + 1}",
        "subtopic": section["suggestedQuizTitle"],
        "subtopic_slug": section["suggestedSlug"],
        "sourceMetadata": {
            "sourceFile": SOURCE,
            "sourcePages": raw["sourcePages"],
            "setNumber": section["setNumber"],
            "setLabel": section["setLabel"],
            "subject": section["subject"],
            "sectionId": section["id"],
            "sourceQuestionNumber": raw["sourceQuestionNumber"],
            "answerSource": raw["answerSource"],
            "optionsSource": raw["optionsSource"],
            "explanationSource": raw["explanationSource"],
            "continuationMerged": raw["continuationMerged"],
            "needsReview": raw["needsReview"],
            "reviewNotes": raw["reviewNotes"],
        },
    }


def validate(questions, section):
    issues = []
    expected = int(section.get("expectedQuestions") or 0)
    if expected and len(questions) != expected:
        issues.append({
            "issue": "question_count_mismatch",
            "expectedQuestions": expected,
            "actualQuestions": len(questions),
            "note": "PDF text extraction count differs from reviewed map.",
        })
    source_numbers = [q["sourceMetadata"]["sourceQuestionNumber"] for q in questions]
    duplicates = sorted({n for n in source_numbers if source_numbers.count(n) > 1})
    if duplicates:
        issues.append({"issue": "duplicate_source_question_numbers", "sourceQuestionNumbers": duplicates})
    if expected:
        missing = [n for n in range(1, expected + 1) if n not in source_numbers]
        if missing:
            issues.append({"issue": "missing_source_question_numbers", "sourceQuestionNumbers": missing})
    for index, q in enumerate(questions, start=1):
        if len([o for o in q.get("options", {}).values() if o.get("choice")]) < 2:
            issues.append({"questionNumber": index, "issue": "too_few_options", "sourcePages": q["sourceMetadata"].get("sourcePages", [])})
        if not q.get("correctAnswer"):
            issues.append({"questionNumber": index, "issue": "missing_correct_answer", "sourcePages": q["sourceMetadata"].get("sourcePages", [])})
    return issues


def write_section(section_id):
    section = section_by_id(section_id)
    reader = PdfReader(str(PDF_PATH))
    full_text, page_ranges = extract_pages(reader, int(section["startPage"]), int(section["endPage"]))
    raw_questions = parse_questions(full_text, page_ranges, section)
    questions = [normalize_question(q, i, section) for i, q in enumerate(raw_questions)]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    slug = section["suggestedSlug"]
    payload = {
        "status": True,
        "subtopic": {
            "id": f"hesi-a2-actual-exam-set-{section['setNumber']}-{slugify(section['subject'])}",
            "name": section["suggestedQuizTitle"],
            "slug": slug,
            "questionsCount": len(questions),
            "sourceFile": SOURCE,
            "setNumber": section["setNumber"],
            "setLabel": section["setLabel"],
            "subject": section["subject"],
            "sourcePages": [section["startPage"], section["endPage"]],
        },
        "setNumber": section["setNumber"],
        "setLabel": section["setLabel"],
        "subject": section["subject"],
        "questionsToShow": len(questions),
        "totalQuestions": len(questions),
        "expectedQuestions": section.get("expectedQuestions"),
        "questions": questions,
    }
    issues = validate(questions, section)
    (OUT_DIR / f"{slug}.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (REPORT_DIR / f"{slug}-review-report.json").write_text(json.dumps({
        "section": section,
        "provider": "local-pypdf",
        "model": None,
        "pdfPath": str(PDF_PATH),
        "questionCount": len(questions),
        "expectedQuestions": section.get("expectedQuestions"),
        "questionCountMatchesExpected": len(questions) == int(section.get("expectedQuestions") or -1),
        "issueCount": len(issues),
        "issues": issues,
        "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"slug": slug, "questionCount": len(questions), "expectedQuestions": section.get("expectedQuestions"), "issueCount": len(issues), "issues": issues[:5]}, indent=2))


def main():
    ids = [int(arg) for arg in sys.argv[1:]] or [12, 24]
    for section_id in ids:
        write_section(section_id)

if __name__ == "__main__":
    main()

