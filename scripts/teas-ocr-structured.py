import argparse
import json
import re
import time
from pathlib import Path

import cv2
from paddleocr import PaddleOCR


def parse_args():
    parser = argparse.ArgumentParser(description="Export TEAS OCR text with coordinates as JSON.")
    parser.add_argument("--input", required=True, help="Source folder containing JPG/JPEG/PNG images.")
    parser.add_argument("--output-dir", required=True, help="Folder where structured JSON is written.")
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=10**9)
    return parser.parse_args()


def page_number(name):
    page_match = re.search(r"page-(\d+)\.(jpe?g|png)$", name, re.I)
    if page_match:
        return int(page_match.group(1))
    plain_match = re.search(r"^(\d+)\.(jpe?g|png)$", name, re.I)
    if plain_match:
        return int(plain_match.group(1))
    return None


def flatten_ocr(result):
    rows = []
    if not result:
        return rows
    for page in result:
        if not page:
            continue
        for item in page:
            if not item or len(item) < 2:
                continue
            points, rec = item[0], item[1]
            if not points or not rec:
                continue
            text, score = rec[0], float(rec[1])
            xs = [float(p[0]) for p in points]
            ys = [float(p[1]) for p in points]
            rows.append(
                {
                    "text": str(text),
                    "score": score,
                    "left": min(xs),
                    "top": min(ys),
                    "right": max(xs),
                    "bottom": max(ys),
                    "width": max(xs) - min(xs),
                    "height": max(ys) - min(ys),
                    "points": [[float(p[0]), float(p[1])] for p in points],
                }
            )
    rows.sort(key=lambda row: (row["top"], row["left"]))
    return rows


def clean_line(line):
    line = re.sub(r"\s+", " ", line).strip()
    line = re.sub(r"Question:\s*(\d+)\s*of\s*(\d+)", r"Question: \1 of \2", line, flags=re.I)
    return line


def is_ui_text(text):
    lowered = text.lower().strip()
    compact = re.sub(r"[^a-z]", "", lowered)
    return (
        "time remaining" in lowered
        or lowered in {"flag", "close"}
        or compact in {"previous", "continue", "next", "submit", "review", "previouscontinue", "continueprevious"}
        or "previous continue" in lowered
        or "continue previous" in lowered
        or lowered.startswith("ati.")
        or lowered.startswith("ati ")
        or "teas version" in lowered
        or re.fullmatch(r"question:\s*\d+\s*of\s*\d+", lowered) is not None
        or re.fullmatch(r"stimulus:\s*\d+\s*of\s*\d+", lowered) is not None
    )


def line_groups_from_rows(rows):
    lines = []
    current = []
    current_y = None
    for row in sorted(rows, key=lambda item: (item["top"], item["left"])):
        height = max(1, row["bottom"] - row["top"])
        if current_y is None or abs(row["top"] - current_y) <= max(9, height * 0.65):
            current.append(row)
            current_y = row["top"] if current_y is None else (current_y + row["top"]) / 2
        else:
            current.sort(key=lambda item: item["left"])
            lines.append(line_from_rows(current))
            current = [row]
            current_y = row["top"]
    if current:
        current.sort(key=lambda item: item["left"])
        lines.append(line_from_rows(current))
    return lines


def region_line_groups_from_rows(rows, width, height):
    grouped_rows = {"header": [], "left_context": [], "question_column": [], "footer": []}
    for row in rows:
        center_x = (row["left"] + row["right"]) / 2
        center_y = (row["top"] + row["bottom"]) / 2
        if center_y < height * 0.12:
            grouped_rows["header"].append(row)
        elif center_y > height * 0.88:
            grouped_rows["footer"].append(row)
        elif center_x < width * 0.47:
            grouped_rows["left_context"].append(row)
        else:
            grouped_rows["question_column"].append(row)

    lines = []
    for region, region_rows in grouped_rows.items():
        for line in line_groups_from_rows(region_rows):
            line["region"] = region
            lines.append(line)
    lines.sort(key=lambda line: (line["top"], line["left"]))
    return lines


def line_from_rows(rows):
    return {
        "text": clean_line(" ".join(row["text"] for row in rows)),
        "left": min(row["left"] for row in rows),
        "top": min(row["top"] for row in rows),
        "right": max(row["right"] for row in rows),
        "bottom": max(row["bottom"] for row in rows),
        "rows": rows,
    }


def subject_from_rows(rows):
    joined = " ".join(row["text"] for row in rows[:8]).lower()
    if "math" in joined:
        return "Math"
    if "science" in joined:
        return "Science"
    if "english" in joined or "language usage" in joined:
        return "English and Language Usage"
    if "reading" in joined:
        return "Reading"
    return ""


def marker_score(image, box):
    height, width = image.shape[:2]
    left = max(0, int(box["left"] - width * 0.08))
    right = max(left + 1, int(box["left"] - 2))
    top = max(0, int(box["top"] - 12))
    bottom = min(height, int(box["bottom"] + 12))
    crop = image[top:bottom, left:right]
    if crop.size == 0:
        return 0
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    dark = int((gray < 170).sum())
    blue = int(((crop[:, :, 0] > 90) & (crop[:, :, 1] < 190) & (crop[:, :, 2] < 190)).sum())
    return dark + blue * 2


def classify_region(line, width, height):
    center_x = (line["left"] + line["right"]) / 2
    center_y = (line["top"] + line["bottom"]) / 2
    if center_y < height * 0.12:
        return "header"
    if center_y > height * 0.88:
        return "footer"
    if center_x < width * 0.47:
        return "left_context"
    return "question_column"


def question_column_summary(lines, image):
    question_lines = [
        line for line in lines
        if line["region"] == "question_column" and line["text"] and not line["isUiText"]
    ]
    if not question_lines:
        return adaptive_question_summary(lines, image, "adaptive_all_content")

    summary = summarize_question_lines(question_lines, image, "question_column")
    if len(summary["choiceLines"]) < 3 or not summary["promptLines"]:
        adaptive = adaptive_question_summary(lines, image, "adaptive_all_content")
        if len(adaptive["choiceLines"]) >= len(summary["choiceLines"]):
            return adaptive
    return summary


def summarize_question_lines(question_lines, image, layout_mode):
    start_index = question_start_index(question_lines)
    working_lines = question_lines[start_index:] if start_index is not None else question_lines

    prompt_lines = []
    choice_lines = []
    prompt_done = False
    for index, line in enumerate(working_lines):
        if not prompt_done:
            prompt_lines.append(line)
            if "?" in line["text"]:
                prompt_done = True
            continue
        choice_lines.append(line)

    if not choice_lines and len(working_lines) > 1:
        marker_scores = [marker_score(image, line) for line in working_lines]
        marker_indexes = [index for index, score in enumerate(marker_scores) if score >= 120]
        first_choice_index = marker_indexes[0] if marker_indexes else 1
        prompt_lines = working_lines[:first_choice_index]
        choice_lines = working_lines[first_choice_index:]
    elif choice_lines:
        first_marker_index = next(
            (index for index, line in enumerate(choice_lines) if marker_score(image, line) >= 120),
            None,
        )
        if first_marker_index and first_marker_index > 0:
            prompt_lines.extend(choice_lines[:first_marker_index])
            choice_lines = choice_lines[first_marker_index:]

    choice_groups = group_choice_lines(choice_lines)[:6]
    scores = [marker_score(image, group[0]) for group in choice_groups]
    selected_answer = ""
    selected_score = 0
    second_score = 0
    confidence_ratio = 0
    if scores:
        best_index = max(range(len(scores)), key=lambda index: scores[index])
        sorted_scores = sorted(scores, reverse=True)
        selected_score = sorted_scores[0]
        second_score = sorted_scores[1] if len(sorted_scores) > 1 else 0
        confidence_ratio = selected_score / second_score if second_score else selected_score
        if sorted_scores[0] >= 12 and (len(sorted_scores) == 1 or sorted_scores[0] >= sorted_scores[1] * 1.18):
            labels = ["A", "B", "C", "D", "E", "F"]
            selected_answer = labels[best_index] if best_index < len(labels) else str(best_index + 1)

    return {
        "promptLines": [line["text"] for line in prompt_lines],
        "choiceLines": [" ".join(line["text"] for line in group).strip() for group in choice_groups],
        "selectedAnswer": selected_answer,
        "markerScores": scores,
        "selectedAnswerScore": selected_score,
        "secondAnswerScore": second_score,
        "selectedAnswerConfidenceRatio": round(confidence_ratio, 3),
        "layoutMode": layout_mode,
    }


def adaptive_question_summary(lines, image, layout_mode):
    content_lines = [
        line for line in lines
        if line["text"]
        and not line["isUiText"]
        and line["region"] in {"left_context", "question_column"}
    ]
    content_lines.sort(key=lambda line: (line["top"], line["left"]))
    return summarize_question_lines(content_lines, image, layout_mode)


def question_start_index(lines):
    patterns = [
        r"\bwhich\b",
        r"\bwhat\b",
        r"\bhow\b",
        r"\bwhy\b",
        r"\bwhere\b",
        r"\bwhen\b",
        r"\bwho\b",
        r"\bselect\b",
        r"\bsolve\b",
        r"\bcalculate\b",
        r"\bidentify\b",
        r"\bplace\b",
        r"\border\b",
        r"\bif\b",
        r"\bbased\b",
    ]
    for index, line in enumerate(lines):
        text = line["text"].lower()
        if any(re.search(pattern, text) for pattern in patterns):
            return index
    return 0 if lines else None


def group_choice_lines(choice_lines):
    groups = []
    current = []
    previous_box = None
    for line in choice_lines:
        box = line
        if not current:
            current = [line]
            previous_box = box
            continue
        gap = box["top"] - previous_box["bottom"]
        text = line["text"]
        starts_like_continuation = bool(re.match(r"^[a-z(]", text))
        short_previous = len(previous_box["text"]) < 36
        indented_near_previous = box["left"] > previous_box["left"] + 8
        if gap <= 18 or starts_like_continuation or (short_previous and indented_near_previous):
            current.append(line)
        else:
            groups.append(current)
            current = [line]
        previous_box = box
    if current:
        groups.append(current)
    return groups


def export_page(file, page, ocr):
    image = cv2.imread(str(file))
    if image is None:
        return {"page": page, "fileName": file.name, "error": "Could not read image."}

    height, width = image.shape[:2]
    result = ocr.ocr(str(file), cls=False)
    rows = flatten_ocr(result)
    lines = region_line_groups_from_rows(rows, width, height)
    for line in lines:
        line["isUiText"] = is_ui_text(line["text"])

    content_lines = [line for line in lines if line["text"] and not line["isUiText"]]
    region_text = {}
    for region in ["header", "left_context", "question_column", "footer"]:
        region_lines = [
            line["text"]
            for line in lines
            if line["region"] == region and line["text"] and not line["isUiText"]
        ]
        region_text[region] = "\n".join(region_lines)
    return {
        "page": page,
        "fileName": file.name,
        "width": width,
        "height": height,
        "subject": subject_from_rows(rows),
        "rowCount": len(rows),
        "lineCount": len(lines),
        "contentText": "\n".join(line["text"] for line in content_lines),
        "regionText": region_text,
        "questionColumn": question_column_summary(lines, image),
        "rows": rows,
        "lines": lines,
    }


def main():
    args = parse_args()
    input_dir = Path(args.input)
    output_dir = Path(args.output_dir)
    if not input_dir.exists():
        raise SystemExit(f"Input folder not found: {input_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)

    files = []
    for file in input_dir.iterdir():
        if file.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        page = page_number(file.name)
        if page and args.start <= page <= args.end:
            files.append((page, file))
    files.sort(key=lambda item: item[0])

    ocr = PaddleOCR(use_angle_cls=False, lang="en", show_log=False)
    pages = []
    for page, file in files:
        page_data = export_page(file, page, ocr)
        pages.append(page_data)
        print(f"{page:04d} structured {page_data.get('rowCount', 0)} rows", flush=True)

    timestamp = int(time.time() * 1000)
    output_path = output_dir / f"teas-ocr-structured-{timestamp}.json"
    output_path.write_text(
        json.dumps(
            {
                "sourceFolder": str(input_dir),
                "generatedAt": timestamp,
                "pageCount": len(pages),
                "pages": pages,
            },
            indent=2,
            ensure_ascii=True,
        ),
        encoding="utf-8",
    )
    print(f"Structured output: {output_path}", flush=True)


if __name__ == "__main__":
    main()
