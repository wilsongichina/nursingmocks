"use client";

import type { DragEvent, MouseEvent } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminCard,
  AdminInlineLoading,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTable,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import ContentRenderer from "@/components/ui/ContentRenderer";
import { useAuth } from "@/contexts/AuthContext";
import type {
  NaxlexQuestionTypeRenderSample,
  NaxlexQuestionTypeScanResult,
  NaxlexQuestionTypeSummary,
} from "@/lib/admin/naxlex-question-type-scan";

const RENDER_PREVIEW_TYPE_IDS = ["1", "2", "3", "5", "6", "7", "9", "10", "11", "12", "13", "14"];
const PAGED_RENDER_PREVIEW_TYPE_IDS = ["1", "2", "3", "5", "6", "7", "9", "10", "11", "12", "13", "14"];

function pagedPreviewKind(typeId: string) {
  if (typeId === "1") return "Single Choice";
  if (typeId === "2") return "Select All That Apply";
  if (typeId === "3") return "True Or False";
  if (typeId === "5" || typeId === "9") return "Hot Spot";
  if (typeId === "6") return "Ordered Response";
  if (typeId === "7") return "Numeric";
  if (typeId === "10") return "Bow Tie";
  if (typeId === "12") return "Drag And Drop";
  if (typeId === "13") return "Dropdown / Cloze";
  if (typeId === "14") return "Matrix";
  return "Highlight";
}

function formatRecord(record: Record<string, number>) {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return "None";
  return entries.map(([key, count]) => `${key}: ${count}`).join(", ");
}

function formatList(values: string[], fallback = "None") {
  if (values.length === 0) return fallback;
  return values.join(", ");
}

function questionTypeName(questionTypeId: string) {
  const names: Record<string, string> = {
    "1": "Single Choice",
    "2": "Multiple Response",
    "3": "True Or False",
    "5": "Hot Spot",
    "6": "Ordered Response",
    "7": "Numeric",
    "9": "Hot Spot",
    "10": "Bow Tie",
    "11": "Highlight",
    "12": "Drag And Drop",
    "13": "Dropdown / Cloze",
    "14": "Case Study",
  };
  return names[questionTypeId] || `Type ${questionTypeId}`;
}

function TypeSupportBadge({ type }: { type: NaxlexQuestionTypeSummary }) {
  return (
    <AdminStatusBadge
      label={type.publicSupport === "supported" ? "Public Supported" : "Needs Renderer"}
      tone={type.publicSupport === "supported" ? "green" : "amber"}
    />
  );
}

function textFromHtml(html: string) {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&deg;/gi, " degrees")
    .replace(/&bull;/gi, "-")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitClozeStem(stemHtml: string) {
  const htmlWithBlanks = stemHtml
    .replace(/<div[^>]*id=["']dropdown-group-\d+["'][^>]*>[\s\S]*?<\/div>/gi, " dropdown ")
    .replace(/\bExhibits\b/gi, " ");
  const text = textFromHtml(htmlWithBlanks).replace(/\s+/g, " ").trim();
  const instructionMatch = text.match(
    /(Complete the following sentences? by using the lists? of options\.?|Complete the following sentence\.?|Drag from word choices to complete the sentence\.?|Drag words? from the choices below to fill in each blank in the following sentence\.?|Select(?: \d+)?[^.]*?to fill in each blank in the following sentence\.?)/i
  );

  if (!instructionMatch || instructionMatch.index === undefined) {
    return {
      introText: "",
      instructionText: "Complete the following sentence by using the lists of options.",
      sentenceText: text,
    };
  }

  const introText = text.slice(0, instructionMatch.index).trim();
  const sentenceText = text
    .slice(instructionMatch.index + instructionMatch[0].length)
    .trim();

  return {
    introText,
    instructionText: instructionMatch[0],
    sentenceText: sentenceText || text,
  };
}

function imageFileLabel(value: string) {
  if (!value) return "No image";
  try {
    return decodeURIComponent(value.split(/[\\/]/).pop() || value);
  } catch {
    return value.split(/[\\/]/).pop() || value;
  }
}

function formatType11PlainText(value: string) {
  return value
    .replace(/\bExhibits\b/gi, "")
    .replace(/\s+(Click to highlight)/gi, "\n\n$1")
    .replace(/\s+(Select\s+\d+\s+findings?)/gi, "\n\n$1")
    .replace(
      /\s+(Assessment|Vital Signs|Nurses['’] Notes|Diagnostic Results|History and Physical|Provider Orders)(?=\s|$)/gi,
      "\n\n$1\n"
    )
    .replace(/\s+(\d{3,4}:)/g, "\n\n$1")
    .replace(/\.\s+(?=(Client|Denies|Heart|Respirations|Lungs|Abdomen|Urine|Skin|Capillary|Temperature|Heart rate|Respiratory rate|BP|Oxygen)\b)/g, ".\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitType11StemSections(stemText: string) {
  const defaultInstruction =
    "All possible selections are highlighted in yellow by default. Click to highlight each finding that is a risk factor. To deselect a finding, click on the finding again.";
  const instructionMatch = stemText.match(
    /((?:All possible selections are highlighted in yellow by default\.\s*)?Click to highlight[\s\S]*?(?:click on the finding again\.))/i
  );

  if (!instructionMatch?.index) {
    return {
      promptText: /^((all possible selections are highlighted in yellow by default\.\s*)?click to highlight)/i.test(stemText)
        ? ""
        : formatType11PlainText(stemText),
      instructionText: instructionMatch?.[0] || defaultInstruction,
      exhibitText: "",
    };
  }

  const beforeInstruction = stemText.slice(0, instructionMatch.index);
  const afterInstruction = stemText.slice(instructionMatch.index + instructionMatch[0].length);
  return {
    promptText: formatType11PlainText(beforeInstruction),
    instructionText: instructionMatch[0],
    exhibitText: formatType11PlainText(afterInstruction),
  };
}

type HotSpotSelection = {
  xPercent: number;
  yPercent: number;
  xPixel: number;
  yPixel: number;
};

type HotSpotAnswerRanges = {
  xRanges: [number, number];
  yRanges: [number, number];
};

function parseHotSpotAnswerRanges(value: string): HotSpotAnswerRanges | null {
  let current: unknown = value;
  for (let index = 0; index < 4; index += 1) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (!trimmed) return null;
      try {
        current = JSON.parse(trimmed);
        continue;
      } catch {
        return null;
      }
    }
    break;
  }

  if (!current || typeof current !== "object" || Array.isArray(current)) return null;
  const answer = current as { xRanges?: unknown; yRanges?: unknown };
  if (!Array.isArray(answer.xRanges) || !Array.isArray(answer.yRanges)) return null;

  const xRanges = answer.xRanges.map(Number);
  const yRanges = answer.yRanges.map(Number);
  if (
    xRanges.length < 2 ||
    yRanges.length < 2 ||
    xRanges.some((item) => !Number.isFinite(item)) ||
    yRanges.some((item) => !Number.isFinite(item))
  ) {
    return null;
  }

  return {
    xRanges: [Math.min(xRanges[0], xRanges[1]), Math.max(xRanges[0], xRanges[1])],
    yRanges: [Math.min(yRanges[0], yRanges[1]), Math.max(yRanges[0], yRanges[1])],
  };
}

function hotSpotAnswerUsesPercent(answer: HotSpotAnswerRanges | null) {
  if (!answer) return false;
  return (
    answer.xRanges.every((item) => item >= 0 && item <= 100) &&
    answer.yRanges.every((item) => item >= 0 && item <= 100)
  );
}

function hotSpotSelectionIsCorrect(
  selection: HotSpotSelection | null,
  answer: HotSpotAnswerRanges | null
) {
  if (!selection || !answer) return false;
  const usesPercent = hotSpotAnswerUsesPercent(answer);
  const x = usesPercent ? selection.xPercent : selection.xPixel;
  const y = usesPercent ? selection.yPercent : selection.yPixel;
  return (
    x >= answer.xRanges[0] &&
    x <= answer.xRanges[1] &&
    y >= answer.yRanges[0] &&
    y <= answer.yRanges[1]
  );
}

function hotSpotAnswerRectStyle(
  answer: HotSpotAnswerRanges | null,
  naturalSize: { width: number; height: number }
) {
  if (!answer || !naturalSize.width || !naturalSize.height) return null;
  const usesPercent = hotSpotAnswerUsesPercent(answer);
  const left = usesPercent ? answer.xRanges[0] : (answer.xRanges[0] / naturalSize.width) * 100;
  const right = usesPercent ? answer.xRanges[1] : (answer.xRanges[1] / naturalSize.width) * 100;
  const top = usesPercent ? answer.yRanges[0] : (answer.yRanges[0] / naturalSize.height) * 100;
  const bottom = usesPercent ? answer.yRanges[1] : (answer.yRanges[1] / naturalSize.height) * 100;
  return {
    left: `${Math.max(0, Math.min(left, 100))}%`,
    top: `${Math.max(0, Math.min(top, 100))}%`,
    width: `${Math.max(0, Math.min(right - left, 100))}%`,
    height: `${Math.max(0, Math.min(bottom - top, 100))}%`,
  };
}

function QuestionTypeRenderPreview({
  sample,
  showMetadata = true,
}: {
  sample: NaxlexQuestionTypeRenderSample;
  showMetadata?: boolean;
}) {
  const isHotSpot = sample.questionTypeId === "5" || sample.questionTypeId === "9";
  const isBowTie = sample.questionTypeId === "10";
  const isMatrixClassification = sample.questionTypeId === "14";
  const isSingleMatrix = false;
  const isMultipleResponse = sample.questionTypeId === "2";
  const isTrueFalse = sample.questionTypeId === "3";
  const isOrderedResponse = sample.questionTypeId === "6";
  const isNumeric = sample.questionTypeId === "7";
  const isHighlight = sample.questionTypeId === "11";
  const isDragAndDrop = sample.questionTypeId === "12";
  const isDropdownCloze = sample.questionTypeId === "13";
  const [activeTab, setActiveTab] = useState(sample.tabs[0]?.label || "");
  const [matrixSelections, setMatrixSelections] = useState<Record<string, string[]>>({});
  const [matrixTouched, setMatrixTouched] = useState(false);
  const [matrixChecked, setMatrixChecked] = useState(false);
  const [dropdownSelections, setDropdownSelections] = useState<Record<string, string>>({});
  const [dropdownChecked, setDropdownChecked] = useState(false);
  const [openDropdownLabel, setOpenDropdownLabel] = useState("");
  const [dragDropSelections, setDragDropSelections] = useState<Record<string, string[]>>({});
  const [dragDropChecked, setDragDropChecked] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [orderedLabels, setOrderedLabels] = useState<string[]>([]);
  const [numericAnswer, setNumericAnswer] = useState("");
  const [simpleChecked, setSimpleChecked] = useState(false);
  const [orderedChecked, setOrderedChecked] = useState(false);
  const [hotSpotSelection, setHotSpotSelection] = useState<HotSpotSelection | null>(null);
  const [hotSpotChecked, setHotSpotChecked] = useState(false);
  const [hotSpotNaturalSize, setHotSpotNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setActiveTab(sample.tabs[0]?.label || "");
    setMatrixSelections({});
    setMatrixTouched(false);
    setMatrixChecked(false);
    setDropdownSelections({});
    setDropdownChecked(false);
    setOpenDropdownLabel("");
    setDragDropSelections({});
    setDragDropChecked(false);
    setSelectedOptions([]);
    setOrderedLabels([]);
    setNumericAnswer("");
    setSimpleChecked(false);
    setOrderedChecked(false);
    setHotSpotSelection(null);
    setHotSpotChecked(false);
    setHotSpotNaturalSize({ width: 0, height: 0 });
  }, [sample.questionId, sample.relativePath, sample.tabs]);

  const toggleMatrixSelection = (rowLabel: string, columnLabel: string) => {
    setMatrixTouched(true);
    setMatrixChecked(false);
    setMatrixSelections((current) => {
      const currentRow = current[rowLabel] || [];
      const nextRow = currentRow.includes(columnLabel)
        ? currentRow.filter((item) => item !== columnLabel)
        : [...currentRow, columnLabel];
      return {
        ...current,
        [rowLabel]: nextRow,
      };
    });
  };

  const normalizeAnswers = (answers: string[]) => [...answers].sort().join("|");
  const matrixAllCorrect =
    (isBowTie || isMatrixClassification || isSingleMatrix) &&
    sample.options.every(
      (option) =>
        normalizeAnswers(matrixSelections[option.label] || []) ===
        normalizeAnswers(sample.correctAnswerMap[option.label] || [])
    );
  const selectedCellCount = Object.values(matrixSelections).reduce(
    (total, row) => total + row.length,
    0
  );
  const selectedDropdownCount = Object.values(dropdownSelections).filter(Boolean).length;
  const dropdownAllCorrect =
    isDropdownCloze &&
    sample.dropdownGroups.every(
      (group) => dropdownSelections[group.label] === (sample.correctAnswerMap[group.label] || [])[0]
    );
  const selectedDragDropCount = Object.values(dragDropSelections).reduce(
    (total, labels) => total + labels.filter(Boolean).length,
    0
  );
  const dragDropAllCorrect =
    isDragAndDrop &&
    sample.dragDropGroups.every(
      (group) =>
        normalizeAnswers((dragDropSelections[group.label] || []).filter(Boolean)) ===
        normalizeAnswers(group.correctLabels)
    );
  const parseCorrectAnswers = () => {
    try {
      const parsed = JSON.parse(sample.correctAnswer || "[]");
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Single-answer types may store a plain value instead of JSON.
    }
    return sample.correctAnswer ? [sample.correctAnswer] : [];
  };
  const correctAnswers = parseCorrectAnswers();
  const normalizedCorrectAnswers = correctAnswers.map((answer) => answer.trim().toLowerCase());
  const optionMatchesCorrectAnswer = (option: NaxlexQuestionTypeRenderSample["options"][number]) => {
    const candidates = [option.label, option.html, textFromHtml(option.html)].map((value) =>
      value.trim().toLowerCase()
    );
    return candidates.some((candidate) => normalizedCorrectAnswers.includes(candidate));
  };
  const correctOptionLabels = sample.options
    .filter((option) => optionMatchesCorrectAnswer(option))
    .map((option) => option.label);
  const selectedOptionsCorrect =
    normalizeAnswers(selectedOptions) ===
    normalizeAnswers(correctOptionLabels.length > 0 ? correctOptionLabels : correctAnswers);
  const numericAnswerCorrect =
    numericAnswer.trim().toLowerCase() === String(correctAnswers[0] || "").trim().toLowerCase();
  const orderedResponseCorrect = orderedLabels.join("|") === correctAnswers.join("|");
  const orderedOptionBank = sample.options.filter((option) => !orderedLabels.includes(option.label));
  const orderedOptionText = (label: string) =>
    textFromHtml(sample.options.find((option) => option.label === label)?.html || label);
  const activeTabHtml =
    sample.tabs.find((tab) => tab.label === activeTab)?.html ||
    sample.tabs[0]?.html ||
    sample.questionHtml ||
    "";
  const hotSpotArtworkUrl = isHotSpot ? sample.imagePath : "";
  const hotSpotAnswerRanges = useMemo(
    () => parseHotSpotAnswerRanges(sample.correctAnswer),
    [sample.correctAnswer]
  );
  const hotSpotCorrect = hotSpotSelectionIsCorrect(hotSpotSelection, hotSpotAnswerRanges);
  const hotSpotAnswerRect = hotSpotChecked
    ? hotSpotAnswerRectStyle(hotSpotAnswerRanges, hotSpotNaturalSize)
    : null;
  const type11StemText = useMemo(() => textFromHtml(sample.questionHtml), [sample.questionHtml]);
  const type11Sections = useMemo(() => splitType11StemSections(type11StemText), [type11StemText]);
  const type11InstructionText = useMemo(() => {
    const baseInstruction = type11Sections.instructionText;
    return /^all possible selections are highlighted in yellow by default\./i.test(baseInstruction)
      ? baseInstruction
      : `All possible selections are highlighted in yellow by default. ${baseInstruction}`;
  }, [type11Sections.instructionText]);
  const type11PromptText = type11Sections.promptText;
  const type11HasExhibits = sample.tabs.length > 0;
  const clozeStem = useMemo(() => splitClozeStem(sample.questionHtml), [sample.questionHtml]);
  const bowTieRowHeader = useMemo(() => {
    const questionText = textFromHtml(sample.questionHtml).toLowerCase();
    if (questionText.includes("client data")) return "Client Data";
    if (questionText.includes("adverse reaction")) return "Adverse Reaction";
    if (questionText.includes("statement")) return "Client Statement";
    if (questionText.includes("nursing action") || questionText.includes("action")) {
      return "Potential Nursing Action";
    }
    if (questionText.includes("prescription")) return "Potential Prescription";
    return "Finding";
  }, [sample.questionHtml]);
  const bowTieQuestionParts = useMemo(() => {
    const parts = sample.questionHtml.split(/<div[^>]*id=["']exhibits["'][^>]*>[\s\S]*?<\/div>/i);
    return {
      introHtml: parts[0]?.trim() || "",
      promptHtml: parts.slice(1).join("").trim() || sample.questionHtml,
    };
  }, [sample.questionHtml]);
  const dropdownSentenceSegments = useMemo(
    () => {
      const segments = clozeStem.sentenceText
        .split(/\bdropdown\b|_{2,}\d*_{0,}|-{3,}|\.{3,}/i)
        .map((segment) => segment.replace(/\s+/g, " "));
      while (segments.length <= sample.dropdownGroups.length) {
        segments.push("");
      }
      return segments;
    },
    [clozeStem.sentenceText, sample.dropdownGroups.length]
  );
  const dropdownOptionText = useCallback(
    (groupLabel: string, optionLabel: string) =>
      textFromHtml(
        sample.dropdownGroups
          .find((group) => group.label === groupLabel)
          ?.options.find((option) => option.label === optionLabel)?.html || ""
      ),
    [sample.dropdownGroups]
  );

  const selectDropdownOption = (groupLabel: string, value: string) => {
    setDropdownChecked(false);
    setOpenDropdownLabel("");
    setDropdownSelections((current) => ({
      ...current,
      [groupLabel]: value,
    }));
  };

  const selectDragDropOption = (groupLabel: string, optionLabel: string) => {
    setDragDropChecked(false);
    setDragDropSelections((current) => {
      const group = sample.dragDropGroups.find((candidate) => candidate.label === groupLabel);
      const maxSelections = Math.max(group?.correctLabels.length || 1, 1);
      const currentGroup = Array.from(
        { length: maxSelections },
        (_, index) => current[groupLabel]?.[index] || ""
      );
      if (currentGroup.includes(optionLabel)) {
        return {
          ...current,
          [groupLabel]: currentGroup.map((label) => (label === optionLabel ? "" : label)),
        };
      }
      const emptyIndex = currentGroup.findIndex((label) => !label);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : maxSelections - 1;
      const nextGroup = [...currentGroup];
      nextGroup[targetIndex] = optionLabel;
      return {
        ...current,
        [groupLabel]: nextGroup,
      };
    });
  };

  const placeDragDropOption = (groupLabel: string, optionLabel: string, slotIndex: number) => {
    setDragDropChecked(false);
    setDragDropSelections((current) => {
      const group = sample.dragDropGroups.find((candidate) => candidate.label === groupLabel);
      const maxSelections = Math.max(group?.correctLabels.length || 1, 1);
      const nextGroup = Array.from({ length: maxSelections }, (_, index) => current[groupLabel]?.[index] || "");
      const existingIndex = nextGroup.indexOf(optionLabel);
      if (existingIndex >= 0) nextGroup[existingIndex] = "";
      nextGroup[Math.min(slotIndex, maxSelections - 1)] = optionLabel;
      return {
        ...current,
        [groupLabel]: nextGroup,
      };
    });
  };

  const removeDragDropOption = (groupLabel: string, slotIndex: number) => {
    setDragDropChecked(false);
    setDragDropSelections((current) => {
      const group = sample.dragDropGroups.find((candidate) => candidate.label === groupLabel);
      const maxSelections = Math.max(group?.correctLabels.length || 1, 1);
      const nextGroup = Array.from(
        { length: maxSelections },
        (_, index) => current[groupLabel]?.[index] || ""
      );
      nextGroup[slotIndex] = "";
      return {
        ...current,
        [groupLabel]: nextGroup,
      };
    });
  };

  const dragDropOptionPayload = (
    event: DragEvent<HTMLElement>,
    groupLabel: string,
    optionLabel: string
  ) => {
    const payload = `${groupLabel}|${optionLabel}`;
    event.dataTransfer.setData("application/x-naxlex-drag-drop", payload);
    event.dataTransfer.setData("text/plain", payload);
    event.dataTransfer.effectAllowed = "move";
  };

  const readDragDropPayload = (event: DragEvent<HTMLElement>) => {
    const payload =
      event.dataTransfer.getData("application/x-naxlex-drag-drop") ||
      event.dataTransfer.getData("text/plain");
    const [groupLabel, optionLabel] = payload.split("|");
    return { groupLabel, optionLabel };
  };

  const dropDragDropOptionIntoSlot = (
    event: DragEvent<HTMLElement>,
    groupLabel: string,
    slotIndex: number
  ) => {
    event.preventDefault();
    const { groupLabel: sourceGroupLabel, optionLabel } = readDragDropPayload(event);
    if (!optionLabel || sourceGroupLabel !== groupLabel) return;
    placeDragDropOption(groupLabel, optionLabel, slotIndex);
  };

  const dropDragDropOptionToBank = (event: DragEvent<HTMLElement>, groupLabel: string) => {
    event.preventDefault();
    const { groupLabel: sourceGroupLabel, optionLabel } = readDragDropPayload(event);
    if (!optionLabel || sourceGroupLabel !== groupLabel) return;
    setDragDropChecked(false);
    setDragDropSelections((current) => ({
      ...current,
      [groupLabel]: (current[groupLabel] || []).map((label) =>
        label === optionLabel ? "" : label
      ),
    }));
  };

  const dragDropExpectedText = (
    group: NaxlexQuestionTypeRenderSample["dragDropGroups"][number],
    index?: number
  ) => {
    const labels = typeof index === "number" ? [group.correctLabels[index]] : group.correctLabels;
    return labels
      .map((label) => group.options.find((option) => option.label === label)?.html || "")
      .filter(Boolean)
      .map(textFromHtml)
      .join("; ");
  };

  const toggleOption = (label: string) => {
    setSimpleChecked(false);
    setSelectedOptions((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : isMultipleResponse || isHighlight
        ? [...current, label]
        : [label]
    );
  };

  const selectSingleMatrixCell = (rowLabel: string, columnLabel: string) => {
    setMatrixTouched(true);
    setMatrixChecked(false);
    setMatrixSelections((current) => ({
      ...current,
      [rowLabel]: current[rowLabel]?.includes(columnLabel) ? [] : [columnLabel],
    }));
  };

  const insertOrderedOption = (label: string, index: number) => {
    setOrderedChecked(false);
    setOrderedLabels((current) => {
      const withoutLabel = current.filter((item) => item !== label);
      const nextIndex = Math.min(Math.max(index, 0), withoutLabel.length);
      return [
        ...withoutLabel.slice(0, nextIndex),
        label,
        ...withoutLabel.slice(nextIndex),
      ];
    });
  };

  const addOrderedOption = (label: string) => {
    setOrderedChecked(false);
    setOrderedLabels((current) => (current.includes(label) ? current : [...current, label]));
  };

  const removeOrderedOption = (label: string) => {
    setOrderedChecked(false);
    setOrderedLabels((current) => current.filter((item) => item !== label));
  };

  const dragOptionPayload = (event: DragEvent<HTMLElement>, label: string) => {
    event.dataTransfer.setData("text/plain", label);
    event.dataTransfer.effectAllowed = "move";
  };

  const dropOrderedOption = (event: DragEvent<HTMLElement>, index = orderedLabels.length) => {
    event.preventDefault();
    const label = event.dataTransfer.getData("text/plain");
    if (!label || !sample.options.some((option) => option.label === label)) return;
    insertOrderedOption(label, index);
  };

  const dropOrderedOptionToBank = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const label = event.dataTransfer.getData("text/plain");
    if (!label || !sample.options.some((option) => option.label === label)) return;
    removeOrderedOption(label);
  };

  const dropOrderedOptionNearItem = (
    event: DragEvent<HTMLElement>,
    targetLabel: string,
    targetIndex: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const label = event.dataTransfer.getData("text/plain");
    if (!label || !sample.options.some((option) => option.label === label)) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const dropAfterTarget = event.clientY > rect.top + rect.height / 2;
    const currentIndex = orderedLabels.indexOf(label);
    let insertIndex = targetIndex + (dropAfterTarget ? 1 : 0);

    // When moving an existing response downward, removing it first shifts later indexes up by one.
    if (currentIndex >= 0 && currentIndex < insertIndex) {
      insertIndex -= 1;
    }

    if (label === targetLabel && currentIndex === targetIndex) return;
    insertOrderedOption(label, insertIndex);
  };

  const selectHotSpot = (event: MouseEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const rect = image.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    setHotSpotSelection({
      xPercent,
      yPercent,
      xPixel: (xPercent / 100) * image.naturalWidth,
      yPixel: (yPercent / 100) * image.naturalHeight,
    });
    setHotSpotNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
    setHotSpotChecked(false);
  };

  const renderType11DottedSeparator = () => (
    <div className="my-5 flex w-full items-center justify-between gap-2" aria-hidden="true">
      {Array.from({ length: 44 }).map((_, index) => (
        <span
          key={`type11-dot-${index}`}
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
            index % 7 === 0
              ? "bg-cyan-300"
              : index % 4 === 0
              ? "border border-gray-500 bg-white"
              : "bg-gray-500"
          }`}
        />
      ))}
    </div>
  );

  const renderType11Findings = () => (
    <div className="admin-body text-sm leading-7 text-gray-900">
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-2">
        {sample.options.map((option) => {
          const isSelected = selectedOptions.includes(option.label);
          const isCorrectOption = optionMatchesCorrectAnswer(option);
          const isCorrectSelection = simpleChecked && isSelected && isCorrectOption;
          const isWrongSelection = simpleChecked && isSelected && !isCorrectOption;
          const isMissedCorrect = simpleChecked && !isSelected && isCorrectOption;
          const feedbackLabel = isCorrectSelection
            ? "Correct"
            : isWrongSelection
            ? "Wrong"
            : isMissedCorrect
            ? "Missed"
            : "";
          return (
            <span key={option.label} className="inline-flex items-baseline gap-1">
              <button
                type="button"
                onClick={() => toggleOption(option.label)}
                aria-pressed={isSelected}
                className={`box-decoration-clone px-1 py-0 text-left leading-relaxed [font:inherit] transition ${
                  isCorrectSelection
                    ? "bg-emerald-200 ring-2 ring-emerald-600"
                    : isWrongSelection
                    ? "bg-red-200 ring-2 ring-red-600"
                    : isMissedCorrect
                    ? "bg-amber-200 ring-2 ring-amber-600"
                    : isSelected
                    ? "bg-[#f2ae65] ring-1 ring-[#c47b25]"
                    : "bg-[#f4e892] hover:bg-[#edd875]"
                }`}
                style={{ borderRadius: 0 }}
              >
                {textFromHtml(option.html)}
              </button>
              {feedbackLabel && (
                <span
                  className={`border px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none ${
                    isCorrectSelection
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isWrongSelection
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-amber-300 bg-amber-50 text-amber-700"
                  }`}
                >
                  {feedbackLabel}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );

  const renderType11Controls = () => (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
      <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
        {selectedOptions.length} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {simpleChecked && (
          <span
            className={`border px-2.5 py-1 text-xs font-semibold ${
              selectedOptionsCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {selectedOptionsCorrect ? "Correct" : "Needs Review"}
          </span>
        )}
        {simpleChecked && !selectedOptionsCorrect && (
          <span className="border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
            Green = correct, Red = wrong, Amber = missed
          </span>
        )}
        <button
          type="button"
          onClick={() => setSimpleChecked(true)}
          disabled={selectedOptions.length === 0}
          className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
        >
          Check Answer
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedOptions([]);
            setSimpleChecked(false);
          }}
          className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {showMetadata && (
        <div className="admin-info-tile p-3">
          <p className="admin-info-tile-label">JSON Source</p>
          <p className="admin-helper mt-1 font-mono">{sample.relativePath}</p>
          <p className="admin-helper mt-2">
            {isHotSpot
              ? `Type ${sample.questionTypeId} should render as a hot spot question: one prompt, the referenced artwork, a clickable target area, saved coordinate ranges, and an explanation panel.`
              : isBowTie
              ? "Type 10 should render as a Bow Tie decision table: source exhibits, ordered row findings, match columns, one selectable decision per row, and explicit answer checking."
              : isDragAndDrop
              ? "Type 12 should render as grouped drag and drop: source exhibits, grouped choice banks, target zones, and explicit answer checking."
              : isDropdownCloze
              ? "Type 13 should render as a Dropdown / Cloze question: source exhibits, inline dropdown blanks, grouped options, and explicit answer checking."
              : isMatrixClassification
              ? "Type 14 should render as a case-study matrix question: exhibits first, finding rows down the side, condition/category columns across the top, and one or more selected cells per finding."
              : isSingleMatrix
              ? "Type 5 should render as a one-selection-per-row matching matrix, with row prompts, column choices, and explicit answer checking."
              : isMultipleResponse
              ? "Type 2 should render as a select-all-that-apply question with multiple selectable options and explicit answer checking."
              : isTrueFalse
              ? "Type 3 should render as a true/false question with one selectable answer and explicit answer checking."
              : isOrderedResponse
              ? "Type 6 should render as an ordered-response question: move choices into the correct sequence, then check the answer."
              : isNumeric
              ? "Type 7 should render as a numeric-entry calculation question with explicit answer checking."
              : isHighlight
              ? "Type 11 should render as a highlight question: clickable text findings, explicit answer checking, and feedback for correct, wrong, or missed highlights."
              : "Type 1 should render as a single-choice question: one prompt, lettered answer choices, one correct letter, and an explanation panel."}
          </p>
        </div>
      )}

      <article className="admin-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-card-title text-sm">Question {sample.questionId}</span>
          <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
            {isHotSpot
              ? "Hot Spot"
              : isBowTie
              ? "Bow Tie"
              : isDragAndDrop
              ? "Drag And Drop"
              : isDropdownCloze
              ? "Dropdown / Cloze"
              : isMatrixClassification
              ? "Case Study Matrix"
              : isSingleMatrix
              ? "Matching Matrix"
              : isMultipleResponse
              ? "Select All That Apply"
              : isTrueFalse
              ? "True Or False"
              : isOrderedResponse
              ? "Ordered Response"
              : isNumeric
              ? "Numeric"
              : isHighlight
              ? "Highlight"
              : "Single Choice"}
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">{sample.program}</span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">{sample.vendor}</span>
        </div>

        {sample.subject !== "Root" && (
          <p className="admin-helper mt-2">Subject: {sample.subject}</p>
        )}

        {!isHighlight && !isMatrixClassification && !isBowTie && !isDragAndDrop && !isDropdownCloze && (
          <div className="admin-body mt-4 font-semibold">
            <ContentRenderer content={sample.questionHtml || "No question text available."} />
          </div>
        )}

        {isHotSpot ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="admin-card-title text-sm">Artwork / Click Target</p>
                  <p className="admin-helper mt-1">
                    Click the artwork to select the hot spot, then check it against the saved coordinate range.
                  </p>
                </div>
                {hotSpotChecked && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                      hotSpotCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {hotSpotCorrect ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>
              <div className="mt-4 flex min-h-64 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white text-center">
                {hotSpotArtworkUrl ? (
                  <div className="relative inline-block max-w-full">
                    {/* Admin hot spot previews use local/generated image URLs that Next Image cannot size upfront. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hotSpotArtworkUrl}
                      alt="Hot spot artwork"
                      className="max-h-[520px] w-auto max-w-full cursor-crosshair object-contain"
                      onClick={selectHotSpot}
                      onLoad={(event) =>
                        setHotSpotNaturalSize({
                          width: event.currentTarget.naturalWidth,
                          height: event.currentTarget.naturalHeight,
                        })
                      }
                    />
                    {hotSpotAnswerRect && (
                      <span
                        className="pointer-events-none absolute rounded border-2 border-amber-500 bg-amber-200/30"
                        style={hotSpotAnswerRect}
                        aria-hidden="true"
                      />
                    )}
                    {hotSpotSelection && (
                      <span
                        className={`pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow ${
                          hotSpotChecked
                            ? hotSpotCorrect
                              ? "border-emerald-700 bg-emerald-500"
                              : "border-red-700 bg-red-500"
                            : "border-purple-700 bg-purple-500"
                        }`}
                        style={{
                          left: `${hotSpotSelection.xPercent}%`,
                          top: `${hotSpotSelection.yPercent}%`,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="admin-card-title text-sm">No Artwork Path Found</p>
                    <p className="admin-helper mt-2 max-w-sm">
                      This Type {sample.questionTypeId} sample did not include an `image_path` value.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <p className="admin-info-tile-label">Question Image</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {imageFileLabel(sample.imagePath || sample.imageSourceUrl)}
                </p>
                {sample.imagePath && (
                  <p className="admin-helper mt-2 break-all font-mono">{sample.imagePath}</p>
                )}
                {sample.imageSourceUrl && (
                  <a
                    href={sample.imageSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-button-secondary mt-3 inline-flex px-3 py-1.5 text-xs"
                  >
                    Open Source Artwork
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-700">
                  {hotSpotSelection
                    ? `${hotSpotSelection.xPercent.toFixed(1)}%, ${hotSpotSelection.yPercent.toFixed(1)}%`
                    : "No point selected"}
                </span>
                <button
                  type="button"
                  onClick={() => setHotSpotChecked(true)}
                  disabled={!hotSpotSelection || !hotSpotAnswerRanges}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHotSpotSelection(null);
                    setHotSpotChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="admin-info-tile p-3">
              <p className="admin-info-tile-label">Correct Target Coordinates</p>
              {hotSpotAnswerRanges && (
                <p className="admin-helper mt-2">
                  Interpreting coordinates as {hotSpotAnswerUsesPercent(hotSpotAnswerRanges) ? "percent ranges" : "image pixel ranges"}.
                </p>
              )}
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100">
                {sample.correctAnswer || "No coordinate data available."}
              </pre>
            </div>
          </div>
        ) : isBowTie ? (
          <div className="mt-4 border border-gray-200 bg-white">
            <div className="grid gap-0 xl:grid-cols-[minmax(300px,0.42fr)_minmax(0,0.58fr)]">
              <section className="border-b border-gray-200 bg-white p-4 xl:border-b-0 xl:border-r">
                <div className="admin-body mb-5 text-sm font-medium leading-6 text-gray-900">
                  <ContentRenderer content={bowTieQuestionParts.introHtml || sample.questionHtml} />
                </div>
                {sample.tabs.length > 0 ? (
                  <>
                    <div className="flex flex-wrap border-b border-gray-200">
                      {sample.tabs.map((tab) => {
                        const active = tab.label === activeTab;
                        return (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveTab(tab.label)}
                            className={`border-b-2 px-3 pb-2 text-left text-xs font-semibold transition ${
                              active
                                ? "border-[#0b88a8] text-gray-950"
                                : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                            }`}
                            style={{ borderRadius: 0 }}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="admin-body max-h-[520px] overflow-auto py-4 pr-4 text-sm leading-7 text-gray-900">
                      <ContentRenderer content={activeTabHtml || "No exhibit content available."} />
                    </div>
                  </>
                ) : (
                  <div className="admin-body text-sm leading-7 text-gray-900">
                    <ContentRenderer content={sample.questionHtml || "No client record available."} />
                  </div>
                )}
              </section>

              <section className="bg-white p-4">
                <div className="admin-body mb-5 text-sm font-semibold leading-6 text-gray-900">
                  <ContentRenderer content={bowTieQuestionParts.promptHtml || "For each row, select the best response."} />
                </div>

                <div className="mb-5 flex w-full items-center justify-between gap-2">
                  {Array.from({ length: 44 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        index % 7 === 0
                          ? "bg-cyan-300"
                          : index % 4 === 0
                          ? "border border-gray-500 bg-white"
                          : "bg-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <div className="overflow-x-auto border border-gray-300">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#d9edf5]">
                        <th className="min-w-[230px] border-b border-r border-gray-300 px-3 py-3 text-left text-sm font-bold text-gray-900">
                          {bowTieRowHeader}
                        </th>
                        {sample.matchOptions.map((matchOption) => (
                          <th
                            key={matchOption.label}
                            className="min-w-[110px] border-b border-r border-gray-300 px-3 py-3 text-center text-sm font-bold text-gray-900 last:border-r-0"
                          >
                            <ContentRenderer content={matchOption.html} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sample.options.map((option) => {
                        const selectedColumns = matrixSelections[option.label] || [];
                        const correctColumns = sample.correctAnswerMap[option.label] || [];
                        const rowCorrect =
                          normalizeAnswers(selectedColumns) === normalizeAnswers(correctColumns);
                        return (
                          <tr key={option.label} className="bg-white">
                            <td className="border-r border-t border-gray-200 px-3 py-3 align-middle text-sm text-gray-900">
                              <ContentRenderer content={option.html} />
                              {matrixChecked && !rowCorrect && (
                                <p className="mt-2 text-xs font-semibold text-amber-700">Review row</p>
                              )}
                            </td>
                            {sample.matchOptions.map((matchOption) => {
                              const isSelected = selectedColumns.includes(matchOption.label);
                              const isCorrectCell = correctColumns.includes(matchOption.label);
                              const isWrongSelection = matrixChecked && isSelected && !isCorrectCell;
                              const isCorrectSelection = matrixChecked && isSelected && isCorrectCell;
                              const isMissedCorrect = matrixChecked && !isSelected && isCorrectCell;
                              return (
                                <td
                                  key={`${option.label}-${matchOption.label}`}
                                  className="border-r border-t border-gray-200 px-3 py-3 text-center align-middle last:border-r-0"
                                >
                                  <button
                                    type="button"
                                    onClick={() => selectSingleMatrixCell(option.label, matchOption.label)}
                                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition ${
                                      isCorrectSelection
                                        ? "border-[#0b88a8]"
                                        : isWrongSelection
                                        ? "border-red-600"
                                        : isMissedCorrect
                                        ? "border-amber-500"
                                        : isSelected
                                        ? "border-[#0b88a8]"
                                        : "border-gray-500 hover:border-[#0b88a8]"
                                    }`}
                                    aria-label={`${textFromHtml(option.html)} ${textFromHtml(matchOption.html)} ${
                                      isSelected ? "selected" : "not selected"
                                    }`}
                                  >
                                    {(isSelected || isCorrectSelection || isMissedCorrect) && (
                                      <span
                                        className={`h-4 w-4 rounded-full ${
                                          isWrongSelection
                                            ? "bg-red-600"
                                            : isMissedCorrect
                                            ? "bg-amber-500"
                                            : "bg-[#0b88a8]"
                                        }`}
                                      />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {selectedCellCount} selected
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {matrixChecked && (
                      <span
                        className={`border px-2.5 py-1 text-xs font-semibold ${
                          matrixAllCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {matrixAllCorrect ? "All Correct" : "Needs Review"}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setMatrixChecked(true)}
                      disabled={!matrixTouched}
                      className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixSelections({});
                        setMatrixTouched(false);
                        setMatrixChecked(false);
                      }}
                      className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : isDragAndDrop ? (
          <div className="mt-4 overflow-hidden border border-gray-200 bg-white">
            <div className="grid gap-0 xl:grid-cols-[minmax(300px,0.38fr)_minmax(0,0.62fr)]">
              <section className="border-b border-gray-200 bg-gray-50 p-4 xl:border-b-0 xl:border-r">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-950">Client Record</p>
                  <span className="border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                    Type 12
                  </span>
                </div>
                {sample.tabs.length > 0 ? (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-200">
                      {sample.tabs.map((tab) => {
                        const active = tab.label === activeTab;
                        return (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveTab(tab.label)}
                            className={`border-b-2 px-2 pb-2 text-sm font-semibold transition ${
                              active
                                ? "border-purple-600 text-purple-700"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="admin-body mt-4 max-h-[520px] overflow-auto pr-2 text-sm leading-7 text-gray-900">
                      <ContentRenderer content={activeTabHtml || "No exhibit content available."} />
                    </div>
                  </>
                ) : (
                  <div className="admin-body mt-4 text-sm leading-7 text-gray-900">
                    <ContentRenderer content={sample.questionHtml || "No client record available."} />
                  </div>
                )}
              </section>

              <section className="bg-white p-4">
                {(() => {
                  const roleForGroup = (label: string) => {
                    const lower = label.toLowerCase();
                    if (lower.includes("condition")) return "condition";
                    if (lower.includes("parameter")) return "parameter";
                    return "action";
                  };
                  const groupsByRole = {
                    action:
                      sample.dragDropGroups.find((group) => roleForGroup(group.displayLabel) === "action") ||
                      sample.dragDropGroups[0],
                    condition:
                      sample.dragDropGroups.find((group) => roleForGroup(group.displayLabel) === "condition") ||
                      sample.dragDropGroups[1],
                    parameter:
                      sample.dragDropGroups.find((group) => roleForGroup(group.displayLabel) === "parameter") ||
                      sample.dragDropGroups[2],
                  };
                  const orderedGroups = [
                    groupsByRole.action,
                    groupsByRole.condition,
                    groupsByRole.parameter,
                  ].filter(Boolean);
                  const toneForRole = (role: string) =>
                    role === "condition"
                      ? {
                          slot: "border-[#b88b1f] bg-[#c49a2c] text-gray-950",
                          chip: "border-[#b88b1f] bg-[#d6ad3a] text-gray-950 hover:border-[#8b6a18] hover:bg-[#c99d26]",
                          header: "bg-[#f6f0dc] text-gray-900",
                        }
                      : role === "parameter"
                      ? {
                          slot: "border-gray-300 bg-gray-100 text-gray-950",
                          chip: "border-gray-300 bg-gray-50 text-gray-950 hover:border-gray-400 hover:bg-white",
                          header: "bg-gray-100 text-gray-900",
                        }
                      : {
                          slot: "border-[#6bbab0] bg-[#8fd7ce] text-gray-950",
                          chip: "border-[#6bbab0] bg-[#8fd7ce] text-gray-950 hover:border-[#4aa49a] hover:bg-[#7bd0c5]",
                          header: "bg-[#e5f7f4] text-gray-900",
                        };
                  const slotTitle = (group: NonNullable<typeof groupsByRole.action>, index: number) => {
                    const role = roleForGroup(group.displayLabel);
                    if (role === "condition") return "Potential Condition";
                    if (role === "parameter") return `Parameter to Monitor ${index + 1}`;
                    return `Action to Take ${index + 1}`;
                  };
                  const renderDiagramSlot = (
                    group: NonNullable<typeof groupsByRole.action>,
                    index: number
                  ) => {
                    const role = roleForGroup(group.displayLabel);
                    const tone = toneForRole(role);
                    const selectedLabel = (dragDropSelections[group.label] || [])[index] || "";
                    const selectedOption = group.options.find((option) => option.label === selectedLabel);
                    const expectedText = dragDropExpectedText(group, index);
                    const isCorrectSelection = Boolean(
                      dragDropChecked && selectedLabel && group.correctLabels.includes(selectedLabel)
                    );
                    const isWrongSelection = Boolean(
                      dragDropChecked && selectedLabel && !group.correctLabels.includes(selectedLabel)
                    );
                    return (
                      <div
                        key={`${group.label}-${index}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => dropDragDropOptionIntoSlot(event, group.label, index)}
                        className={`relative z-10 flex min-h-[72px] flex-col justify-center border px-3 py-2 text-center text-sm shadow-sm transition ${tone.slot} ${
                          isCorrectSelection
                            ? "ring-2 ring-emerald-500"
                            : isWrongSelection
                            ? "ring-2 ring-red-500"
                            : ""
                        }`}
                      >
                        <p className="text-xs font-semibold text-gray-700">
                          {slotTitle(group, index)}
                        </p>
                        {selectedOption ? (
                          <button
                            type="button"
                            draggable
                            onDragStart={(event) =>
                              dragDropOptionPayload(event, group.label, selectedOption.label)
                            }
                            onClick={() => removeDragDropOption(group.label, index)}
                            className={`mt-2 flex min-h-12 w-full items-center gap-2 border px-2 py-2 text-left text-xs shadow-sm ${tone.chip}`}
                            style={{ borderRadius: 0 }}
                          >
                            <span className="min-w-0 flex-1">
                              <ContentRenderer content={selectedOption.html} />
                            </span>
                            <span
                              className="grid h-8 w-8 flex-shrink-0 place-items-center border border-gray-400 bg-gray-100 text-gray-700"
                              aria-hidden="true"
                            >
                              <span className="grid grid-cols-2 gap-0.5">
                                <span className="h-1 w-1 rounded-full bg-gray-500" />
                                <span className="h-1 w-1 rounded-full bg-gray-500" />
                                <span className="h-1 w-1 rounded-full bg-gray-500" />
                                <span className="h-1 w-1 rounded-full bg-gray-500" />
                              </span>
                            </span>
                          </button>
                        ) : (
                          <p className="mt-1 text-xs text-gray-600">Drop answer here</p>
                        )}
                        {dragDropChecked && !isCorrectSelection && expectedText && (
                          <p className="mt-2 text-left text-xs font-semibold text-amber-800">
                            Expected: {expectedText}
                          </p>
                        )}
                      </div>
                    );
                  };

                  return (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-950">Drag And Drop</p>
                          <div className="admin-body mt-2 text-sm leading-6 text-gray-700">
                            <ContentRenderer content={sample.questionHtml || "Place each choice in its matching target."} />
                          </div>
                        </div>
                        {dragDropChecked && (
                          <span
                            className={`border px-2.5 py-1 text-xs font-semibold ${
                              dragDropAllCorrect
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {dragDropAllCorrect ? "All Correct" : "Needs Review"}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 border border-gray-200 bg-white p-4">
                        <div className="mb-4 flex w-full items-center justify-between gap-2">
                          {Array.from({ length: 34 }).map((_, index) => (
                            <span
                              key={index}
                              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                index % 5 === 0
                                  ? "bg-cyan-300"
                                  : index % 3 === 0
                                  ? "border border-gray-500 bg-white"
                                  : "bg-gray-500"
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <div className="relative grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.72fr)_minmax(0,1fr)]">
                          <svg
                            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <path d="M 31 30 L 43 50" stroke="#6b7280" strokeWidth="0.7" fill="none" />
                            <path d="M 31 70 L 43 50" stroke="#6b7280" strokeWidth="0.7" fill="none" />
                            <path d="M 57 50 L 69 30" stroke="#6b7280" strokeWidth="0.7" fill="none" />
                            <path d="M 57 50 L 69 70" stroke="#6b7280" strokeWidth="0.7" fill="none" />
                          </svg>
                          <div className="space-y-3">
                            {groupsByRole.action &&
                              Array.from({
                                length: Math.max(groupsByRole.action.correctLabels.length, 1),
                              }).map((_, index) => renderDiagramSlot(groupsByRole.action, index))}
                          </div>
                          <div className="relative">
                            {groupsByRole.condition && renderDiagramSlot(groupsByRole.condition, 0)}
                          </div>
                          <div className="space-y-3">
                            {groupsByRole.parameter &&
                              Array.from({
                                length: Math.max(groupsByRole.parameter.correctLabels.length, 1),
                              }).map((_, index) => renderDiagramSlot(groupsByRole.parameter, index))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        {orderedGroups.map((group) => {
                          const role = roleForGroup(group.displayLabel);
                          const tone = toneForRole(role);
                          const selectedLabels = (dragDropSelections[group.label] || []).filter(Boolean);
                          const availableOptions = group.options.filter(
                            (option) => !selectedLabels.includes(option.label)
                          );
                          const groupCorrect =
                            normalizeAnswers(selectedLabels) === normalizeAnswers(group.correctLabels);
                          return (
                            <section
                              key={group.label}
                              className="border border-gray-200 bg-white"
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => dropDragDropOptionToBank(event, group.label)}
                            >
                              <div className={`border-b border-gray-200 px-3 py-2 ${tone.header}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-center text-sm font-semibold">{group.displayLabel}</p>
                                  {dragDropChecked && (
                                    <span
                                      className={`border px-2 py-0.5 text-xs font-semibold ${
                                        groupCorrect
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : "border-amber-200 bg-amber-50 text-amber-700"
                                      }`}
                                    >
                                      {groupCorrect ? "Correct" : "Review"}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2 bg-gray-50 p-3">
                                {availableOptions.map((option) => (
                                  <button
                                    key={option.label}
                                    type="button"
                                    draggable
                                    onDragStart={(event) =>
                                      dragDropOptionPayload(event, group.label, option.label)
                                    }
                                    onClick={() => selectDragDropOption(group.label, option.label)}
                                    className={`flex min-h-14 w-full items-center gap-2 border px-2 py-2 text-left text-xs shadow-sm ${tone.chip}`}
                                    style={{ borderRadius: 0 }}
                                  >
                                    <span className="min-w-0 flex-1">
                                      <ContentRenderer content={option.html} />
                                    </span>
                                    <span
                                      className="grid h-8 w-8 flex-shrink-0 place-items-center border border-gray-400 bg-gray-100 text-gray-700"
                                      aria-hidden="true"
                                    >
                                      <span className="grid grid-cols-2 gap-0.5">
                                        <span className="h-1 w-1 rounded-full bg-gray-500" />
                                        <span className="h-1 w-1 rounded-full bg-gray-500" />
                                        <span className="h-1 w-1 rounded-full bg-gray-500" />
                                        <span className="h-1 w-1 rounded-full bg-gray-500" />
                                      </span>
                                    </span>
                                  </button>
                                ))}
                                {availableOptions.length === 0 && (
                                  <p className="border border-dashed border-gray-300 bg-gray-50 px-3 py-5 text-center text-sm text-gray-500">
                                    All choices are placed.
                                  </p>
                                )}
                                {dragDropChecked && !groupCorrect && (
                                  <p className="text-xs font-semibold text-amber-700">
                                    Expected answers: {dragDropExpectedText(group) || "-"}
                                  </p>
                                )}
                              </div>
                            </section>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {selectedDragDropCount} selected
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDragDropSelections({});
                              setDragDropChecked(false);
                            }}
                            className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setDragDropChecked(true)}
                            disabled={sample.dragDropGroups.some(
                              (group) =>
                                (dragDropSelections[group.label] || []).filter(Boolean).length !==
                                Math.max(group.correctLabels.length, 1)
                            )}
                            className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                          >
                            Check Answer
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </section>
            </div>
          </div>
        ) : isDropdownCloze ? (
          <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid min-h-[560px] gap-0 xl:grid-cols-[minmax(300px,0.44fr)_minmax(0,0.56fr)]">
              <section className="border-b border-gray-200 bg-white p-6 xl:border-b-0 xl:border-r">
                <p className="text-sm text-gray-700">
                  {clozeStem.introText || "A nurse is assisting with the care of a client."}
                </p>
                {sample.tabs.length > 0 ? (
                  <>
                    <div className="mt-6 flex flex-wrap gap-5 border-b border-gray-200">
                      {sample.tabs.map((tab) => {
                        const active = tab.label === activeTab;
                        return (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveTab(tab.label)}
                            className={`border-b-2 px-1 pb-3 text-xs font-medium transition ${
                              active
                                ? "border-cyan-500 text-gray-950"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="admin-body mt-5 max-h-[420px] overflow-auto pr-2 text-sm leading-7 text-gray-900">
                      <ContentRenderer content={activeTabHtml || "No exhibit content available."} />
                    </div>
                  </>
                ) : (
                  <div className="admin-body mt-5 text-sm leading-7 text-gray-900">
                    <ContentRenderer content={sample.questionHtml || "No client record available."} />
                  </div>
                )}
              </section>

              <section className="relative bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-950">
                    {clozeStem.instructionText}
                  </p>
                  {dropdownChecked && (
                    <span
                      className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                        dropdownAllCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {dropdownAllCorrect ? "All Correct" : "Needs Review"}
                    </span>
                  )}
                </div>

                <div className="my-6 flex w-full items-center justify-between gap-2">
                  {Array.from({ length: 30 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 flex-shrink-0 rounded-full ${
                        index % 4 === 0 ? "bg-cyan-300" : index % 3 === 0 ? "border-2 border-gray-600 bg-white" : "bg-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <div className="relative min-h-[300px] pr-2 text-sm leading-7 text-gray-800">
                  {dropdownSentenceSegments.length > 0 ? (
                    dropdownSentenceSegments.map((segment, index) => {
                      const group = sample.dropdownGroups[index];
                      const selected = group ? dropdownSelections[group.label] || "" : "";
                      const selectedText = group && selected ? dropdownOptionText(group.label, selected) : "";
                      const correct = group ? (sample.correctAnswerMap[group.label] || [])[0] || "" : "";
                      const isCorrect = group ? selected === correct : false;
                      const isReview = Boolean(group && dropdownChecked && selected && !isCorrect);
                      return (
                        <span key={`${segment}-${index}`}>
                          {segment}
                          {group && (
                            <span className="relative mx-1 inline-block align-baseline">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDropdownLabel((current) =>
                                    current === group.label ? "" : group.label
                                  )
                                }
                                className={`inline-flex min-w-[180px] items-center justify-between gap-3 border-b-2 border-dashed bg-transparent px-1 pb-0.5 text-left text-sm font-semibold leading-7 outline-none transition ${
                                  dropdownChecked
                                    ? isCorrect
                                      ? "border-emerald-500 text-emerald-700"
                                      : isReview
                                      ? "border-amber-500 text-amber-700"
                                      : "border-gray-400 text-gray-700"
                                    : "border-purple-300 text-gray-900 hover:border-purple-500"
                                }`}
                                aria-expanded={openDropdownLabel === group.label}
                                aria-label={group.displayLabel}
                              >
                                <span className={selectedText ? "truncate" : "text-purple-700"}>
                                  {selectedText || "Select..."}
                                </span>
                                <span className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-500" />
                              </button>
                              {openDropdownLabel === group.label && (
                                <div className="absolute left-0 top-full z-40 mt-1 w-[320px] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm leading-6 shadow-xl">
                                  <div className="border-b border-gray-200 bg-purple-50 px-4 py-3 font-semibold text-purple-700">
                                    Select...
                                  </div>
                                  <div className="max-h-[340px] overflow-auto bg-white">
                                    {group.options.map((option) => (
                                      <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => selectDropdownOption(group.label, option.label)}
                                        className="block w-full px-4 py-3 text-left text-gray-800 hover:bg-purple-50"
                                      >
                                        {textFromHtml(option.html)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </span>
                          )}
                        </span>
                      );
                    })
                  ) : (
                    <div className="space-y-5">
                      <p>{clozeStem.sentenceText}</p>
                      {sample.dropdownGroups.map((group) => (
                        <div key={group.label} className="max-w-sm">
                          <p className="mb-1 text-sm font-semibold text-gray-700">{group.displayLabel}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdownLabel((current) =>
                                current === group.label ? "" : group.label
                              )
                            }
                            className="inline-flex w-full items-center justify-between border-b-2 border-dashed border-purple-300 pb-1 text-left text-sm font-semibold text-purple-700"
                          >
                            {dropdownOptionText(group.label, dropdownSelections[group.label] || "") || "Select..."}
                            <span className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-500" />
                          </button>
                          {openDropdownLabel === group.label && (
                            <div className="relative z-40 mt-1 w-[320px] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm leading-6 shadow-xl">
                              <div className="border-b border-gray-200 bg-purple-50 px-4 py-3 font-semibold text-purple-700">Select...</div>
                              {group.options.map((option) => (
                                <button
                                  key={option.label}
                                  type="button"
                                  onClick={() => selectDropdownOption(group.label, option.label)}
                                  className="block w-full px-4 py-3 text-left text-gray-800 hover:bg-purple-50"
                                >
                                  {textFromHtml(option.html)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownSelections({});
                      setDropdownChecked(false);
                      setOpenDropdownLabel("");
                    }}
                    className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                  >
                    Reset
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {selectedDropdownCount} / {sample.dropdownGroups.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDropdownChecked(true)}
                      disabled={selectedDropdownCount !== sample.dropdownGroups.length}
                      className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : isSingleMatrix ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-[#c8ccd8] bg-white shadow-sm">
            <div className="border-b border-[#d8dce7] bg-[#f1f3f7] px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    Select one answer in each row.
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    This matches the Naxlex Type 5 answer format: one column choice per listed row.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-[#c8ccd8] bg-white px-2 py-1 text-xs font-semibold text-[#4b5563]">
                    {selectedCellCount} selected
                  </span>
                  {matrixChecked && (
                    <span
                      className={`rounded border px-2 py-1 text-xs font-semibold ${
                        matrixAllCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {matrixAllCorrect ? "All Correct" : "Needs Review"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setMatrixChecked(true)}
                    disabled={!matrixTouched}
                    className="admin-button-primary min-h-0 px-3 py-1 text-xs disabled:opacity-50"
                  >
                    Check Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixSelections({});
                      setMatrixTouched(false);
                      setMatrixChecked(false);
                    }}
                    className="admin-button-secondary min-h-0 px-3 py-1 text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#eef1f6]">
                    <th className="border border-[#c8ccd8] px-3 py-3 text-left text-xs font-bold uppercase text-[#374151]">
                      Row
                    </th>
                    {sample.matchOptions.map((matchOption) => (
                      <th
                        key={matchOption.label}
                        className="border border-[#c8ccd8] px-3 py-3 text-center text-xs font-bold uppercase text-[#374151]"
                      >
                        {matchOption.html}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sample.options.map((option, rowIndex) => {
                    const selectedColumns = matrixSelections[option.label] || [];
                    const correctColumns = sample.correctAnswerMap[option.label] || [];
                    const rowCorrect =
                      normalizeAnswers(selectedColumns) === normalizeAnswers(correctColumns);
                    return (
                      <tr
                        key={option.label}
                        className={
                          matrixChecked && rowCorrect
                            ? "bg-emerald-50/50"
                            : rowIndex % 2 === 0
                            ? "bg-white"
                            : "bg-[#fbfcfe]"
                        }
                      >
                        <td className="min-w-[220px] border border-[#d8dce7] px-3 py-3 align-middle text-[#111827]">
                          <span className="mr-1 font-bold">{option.label}.</span>
                          <ContentRenderer content={option.html} />
                          {matrixChecked && (
                            <span
                              className={`mt-2 inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${
                                rowCorrect
                                  ? "border-emerald-200 bg-white text-emerald-700"
                                  : "border-amber-200 bg-white text-amber-700"
                              }`}
                            >
                              {rowCorrect ? "Correct" : "Review Row"}
                            </span>
                          )}
                        </td>
                        {sample.matchOptions.map((matchOption) => {
                          const isSelected = selectedColumns.includes(matchOption.label);
                          const isCorrectCell = correctColumns.includes(matchOption.label);
                          const isWrongSelection = matrixChecked && isSelected && !isCorrectCell;
                          const isCorrectSelection = matrixChecked && isSelected && isCorrectCell;
                          const isMissedCorrect = matrixChecked && !isSelected && isCorrectCell;
                          return (
                            <td key={`${option.label}-${matchOption.label}`} className="border border-[#d8dce7] px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => selectSingleMatrixCell(option.label, matchOption.label)}
                                className={`mx-auto flex min-h-8 min-w-[56px] items-center justify-center rounded-sm border-2 px-2 text-xs font-bold transition ${
                                  isCorrectSelection
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : isWrongSelection
                                    ? "border-red-600 bg-red-600 text-white"
                                    : isMissedCorrect
                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                    : isSelected
                                    ? "border-[#2563eb] bg-[#2563eb] text-white"
                                    : "border-[#8d94a6] bg-white text-[#111827] hover:border-[#2563eb] hover:bg-[#eff6ff]"
                                }`}
                              >
                                {isCorrectSelection
                                  ? "OK"
                                  : isWrongSelection
                                  ? "Wrong"
                                  : isMissedCorrect
                                  ? "Missed"
                                  : isSelected
                                  ? "Selected"
                                  : ""}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : isMatrixClassification ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="grid gap-0 lg:grid-cols-[minmax(280px,0.48fr)_minmax(0,0.52fr)]">
              <section className="border-b border-gray-200 bg-white p-4 lg:border-b-0 lg:border-r">
                <p className="mb-5 text-sm text-gray-900">
                  A nurse is caring for a client.
                </p>
                <div className="flex gap-5 border-b border-gray-300">
                  {sample.tabs.map((tab) => {
                    const active = tab.label === activeTab;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => setActiveTab(tab.label)}
                        className={`border-b-2 px-1 pb-3 text-sm transition ${
                          active
                            ? "border-gray-700 font-semibold text-gray-950"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="admin-body mt-4 max-h-[520px] overflow-auto pr-2 text-sm leading-7 text-gray-900">
                  <ContentRenderer
                    content={
                      sample.tabs.find((tab) => tab.label === activeTab)?.html ||
                      sample.tabs[0]?.html ||
                      "No exhibit content available."
                    }
                  />
                </div>
              </section>

              <section className="bg-white p-4">
                <div className="mb-3 text-sm font-medium leading-6 text-gray-900">
                  <ContentRenderer
                    content={
                      sample.questionHtml ||
                      "For each client finding, click to specify if the finding is consistent with each condition. Each finding can support more than one disease process."
                    }
                  />
                </div>

                <div className="mb-3 flex flex-wrap gap-3">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full ${
                        index % 5 === 0 ? "bg-cyan-400" : "bg-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <div className="overflow-x-auto border border-gray-200">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#d9edf5]">
                        <th className="border-b border-r border-gray-300 px-3 py-3 text-left text-xs font-bold text-gray-800">
                          Assessment Findings
                        </th>
                        {sample.matchOptions.map((matchOption) => (
                          <th
                            key={matchOption.label}
                            className="min-w-[96px] border-b border-r border-gray-300 px-3 py-3 text-center text-xs font-bold text-gray-800 last:border-r-0"
                          >
                            <span className="block leading-4">{matchOption.html}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sample.options.map((option) => {
                        const selectedColumns = matrixSelections[option.label] || [];
                        const correctColumns = sample.correctAnswerMap[option.label] || [];
                        return (
                          <tr key={option.label} className="bg-white">
                            <td className="min-w-[190px] border-r border-t border-gray-200 px-3 py-3 align-middle text-sm text-gray-800">
                              <ContentRenderer content={option.html} />
                            </td>
                            {sample.matchOptions.map((matchOption) => {
                              const isSelected = selectedColumns.includes(matchOption.label);
                              const isCorrectCell = correctColumns.includes(matchOption.label);
                              const isWrongSelection = matrixChecked && isSelected && !isCorrectCell;
                              const isCorrectSelection = matrixChecked && isSelected && isCorrectCell;
                              const isMissedCorrect = matrixChecked && !isSelected && isCorrectCell;
                              return (
                                <td
                                  key={`${option.label}-${matchOption.label}`}
                                  className="border-r border-t border-gray-200 px-3 py-3 text-center align-middle last:border-r-0"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleMatrixSelection(option.label, matchOption.label)}
                                    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-[2px] border-2 text-sm font-bold transition ${
                                      isCorrectSelection
                                        ? "border-[#047f9f] bg-[#0b88a8] text-white"
                                        : isWrongSelection
                                        ? "border-red-600 bg-red-50 text-red-700"
                                        : isMissedCorrect
                                        ? "border-amber-500 bg-amber-50 text-amber-700"
                                        : isSelected
                                        ? "border-[#047f9f] bg-[#0b88a8] text-white"
                                        : "border-gray-500 bg-white text-transparent hover:border-[#047f9f]"
                                    }`}
                                    aria-label={`${option.html} ${matchOption.html} ${
                                      isSelected ? "selected" : "not selected"
                                    }`}
                                  >
                                    {isSelected || isCorrectSelection ? "✓" : isMissedCorrect ? "!" : ""}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  Note: Each column must have at least 1 response option selected.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {selectedCellCount} selected
                  </span>
                  {matrixChecked && (
                    <span
                      className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                        matrixAllCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {matrixAllCorrect ? "All Correct" : "Needs Review"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setMatrixChecked(true)}
                    disabled={!matrixTouched}
                    className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Check Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatrixSelections({});
                      setMatrixTouched(false);
                      setMatrixChecked(false);
                    }}
                    className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                  >
                    Reset
                  </button>
                </div>
              </section>
            </div>
          </div>
        ) : isOrderedResponse ? (
          <div className="mt-4 border border-gray-200 bg-white p-4">
            <div className="mb-5 flex w-full items-center justify-between gap-2">
              {Array.from({ length: 54 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    index % 7 === 0
                      ? "bg-cyan-300"
                      : index % 4 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section
                className="min-h-[300px] border border-gray-300 bg-gray-50 p-5"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropOrderedOptionToBank(event)}
              >
                <div className="space-y-2">
                  {orderedOptionBank.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      draggable
                      onDragStart={(event) => dragOptionPayload(event, option.label)}
                      onClick={() => addOrderedOption(option.label)}
                      className="flex min-h-12 w-full items-center border border-gray-400 bg-white px-4 py-2.5 text-left text-sm text-gray-900 transition hover:border-gray-700 hover:bg-gray-50"
                      style={{ borderRadius: 0 }}
                    >
                      <ContentRenderer content={option.html} />
                    </button>
                  ))}
                  {orderedOptionBank.length === 0 && (
                    <div className="min-h-[220px]" aria-label="Available steps empty" />
                  )}
                </div>
              </section>

              <section
                className="min-h-[300px] border-4 border-dashed border-gray-400 bg-white p-5"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropOrderedOption(event)}
                style={{ borderRadius: 0 }}
              >
                <ol className="space-y-2">
                  {orderedLabels.map((label, index) => {
                    const option = sample.options.find((candidate) => candidate.label === label);
                    const expectedLabel = correctAnswers[index];
                    const isCorrectPosition = orderedChecked && label === expectedLabel;
                    const isWrongPosition = orderedChecked && label !== expectedLabel;
                    return (
                      <li
                        key={`${label}-${index}`}
                        draggable
                        onDragStart={(event) => dragOptionPayload(event, label)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => dropOrderedOptionNearItem(event, label, index)}
                        className={`flex min-h-12 items-center border px-4 py-2.5 text-left text-sm ${
                          isCorrectPosition
                            ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                            : isWrongPosition
                            ? "border-amber-500 bg-amber-50 text-amber-950"
                            : "border-gray-400 bg-gray-50 text-gray-900"
                        }`}
                        style={{ borderRadius: 0 }}
                      >
                        <div className="min-w-0 flex-1 text-sm text-gray-900">
                          <ContentRenderer content={option?.html || ""} />
                        </div>
                        {orderedChecked && (
                          <span
                            className={`ml-3 flex-shrink-0 text-xs font-semibold ${
                              isCorrectPosition ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {isCorrectPosition
                              ? "Correct"
                              : `Expected: ${orderedOptionText(expectedLabel || "")}`}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>

            {orderedChecked && !orderedResponseCorrect && (
              <div className="mt-4 border border-amber-200 bg-amber-50 p-4" style={{ borderRadius: 0 }}>
                <p className="text-xs font-semibold uppercase text-amber-700">Correct order</p>
                <ol className="mt-3 space-y-2">
                  {correctAnswers.map((label, index) => (
                    <li
                      key={`${label}-${index}`}
                      className="border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900"
                      style={{ borderRadius: 0 }}
                    >
                      {orderedOptionText(label)}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                {orderedLabels.length} of {sample.options.length} placed
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {orderedChecked && (
                  <span
                    className={`border px-2.5 py-1 text-xs font-semibold ${
                      orderedResponseCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {orderedResponseCorrect ? "Correct" : "Needs Review"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOrderedChecked(true)}
                  disabled={orderedLabels.length !== sample.options.length}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderedLabels([]);
                    setOrderedChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : isMultipleResponse ? (
          <div className="mt-4 border border-gray-200 bg-white p-4">
            <div className="mb-5 flex w-full items-center justify-between gap-2">
              {Array.from({ length: 40 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    index % 5 === 0
                      ? "bg-cyan-300"
                      : index % 3 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="mb-3 text-sm font-semibold text-gray-900">(Select All that Apply.)</p>
            <div className="space-y-3">
              {sample.options.map((option) => {
                const isSelected = selectedOptions.includes(option.label);
                const isCorrectOption = optionMatchesCorrectAnswer(option);
                const showCorrect = simpleChecked && isCorrectOption;
                const showWrong = simpleChecked && isSelected && !isCorrectOption;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className="flex w-full items-center gap-3 bg-transparent px-1 py-1.5 text-left text-sm text-gray-800 transition hover:bg-gray-50"
                    style={{ borderRadius: 0 }}
                  >
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border ${
                        showCorrect
                          ? "border-emerald-600 bg-emerald-600"
                          : showWrong
                          ? "border-red-600 bg-red-600"
                          : isSelected
                          ? "border-gray-700 bg-gray-500"
                          : "border-gray-500 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    >
                      {(isSelected || showCorrect) && (
                        <span className="h-2 w-2 bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <ContentRenderer content={option.html} />
                    </span>
                    {simpleChecked && (showCorrect || showWrong) && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold ${
                          showCorrect
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {showCorrect ? "Correct" : "Review"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                {selectedOptions.length} selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {simpleChecked && (
                  <span
                    className={`border px-2.5 py-1 text-xs font-semibold ${
                      selectedOptionsCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedOptionsCorrect ? "Correct" : "Needs Review"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSimpleChecked(true)}
                  disabled={selectedOptions.length === 0}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOptions([]);
                    setSimpleChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : isTrueFalse ? (
          <div className="mt-4 border border-gray-200 bg-white p-4">
            <div className="mb-5 flex w-full items-center justify-between gap-2">
              {Array.from({ length: 40 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    index % 5 === 0
                      ? "bg-cyan-300"
                      : index % 3 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="mb-3 text-sm font-semibold text-gray-900">Select one answer.</p>
            <div className="space-y-4">
              {sample.options.map((option) => {
                const isSelected = selectedOptions.includes(option.label);
                const isCorrectOption = optionMatchesCorrectAnswer(option);
                const showCorrect = simpleChecked && isCorrectOption;
                const showWrong = simpleChecked && isSelected && !isCorrectOption;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className="flex w-full items-center gap-4 bg-transparent px-4 py-3 text-left text-sm transition hover:bg-gray-50"
                    style={{ borderRadius: 0 }}
                  >
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        showCorrect
                          ? "border-emerald-600 bg-emerald-600"
                          : showWrong
                          ? "border-red-600 bg-red-600"
                          : isSelected
                          ? "border-gray-700 bg-gray-500"
                          : "border-gray-400 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    >
                      {(isSelected || showCorrect) && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-gray-800">
                      <ContentRenderer content={option.html} />
                    </span>
                    {simpleChecked && (showCorrect || showWrong) && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold ${
                          showCorrect ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {showCorrect ? "Correct" : "Review"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                {selectedOptions.length} selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {simpleChecked && (
                  <span
                    className={`border px-2.5 py-1 text-xs font-semibold ${
                      selectedOptionsCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedOptionsCorrect ? "Correct" : "Needs Review"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSimpleChecked(true)}
                  disabled={selectedOptions.length === 0}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOptions([]);
                    setSimpleChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : isNumeric ? (
          <div className="mt-4 border border-gray-200 bg-white p-4">
            <div className="mb-5 flex w-full items-center justify-between gap-2">
              {Array.from({ length: 54 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    index % 7 === 0
                      ? "bg-cyan-300"
                      : index % 4 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`numeric-answer-${sample.questionId}`}>
                Numeric Answer
              </label>
              <input
                id={`numeric-answer-${sample.questionId}`}
                value={numericAnswer}
                onChange={(event) => {
                  setNumericAnswer(event.target.value);
                  setSimpleChecked(false);
                }}
                className={`h-11 w-[180px] border bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-700 ${
                  simpleChecked
                    ? numericAnswerCorrect
                      ? "border-emerald-500"
                      : "border-amber-500"
                    : "border-gray-400"
                }`}
                style={{ borderRadius: 0 }}
                inputMode="decimal"
                autoComplete="off"
              />
              {sample.units && (
                <span className="text-sm font-medium text-gray-700">{sample.units}</span>
              )}
              {simpleChecked && (
                <span
                  className={`ml-2 border px-2.5 py-1 text-xs font-semibold ${
                    numericAnswerCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {numericAnswerCorrect ? "Correct" : "Needs Review"}
                </span>
              )}
            </div>

            {simpleChecked && !numericAnswerCorrect && (
              <p className="mt-3 text-sm font-medium text-amber-700">
                Correct answer: {correctAnswers[0] || "Not available"}
                {sample.units ? ` ${sample.units}` : ""}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                {numericAnswer.trim() ? "Answer entered" : "No answer entered"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimpleChecked(true)}
                  disabled={!numericAnswer.trim()}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNumericAnswer("");
                    setSimpleChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        ) : isHighlight ? (
          <div className="mt-4 border border-gray-200 bg-white">
            {type11HasExhibits ? (
              <div className="grid gap-0 lg:grid-cols-[minmax(300px,0.45fr)_minmax(0,0.55fr)]">
                <section className="border-b border-gray-200 bg-white p-4 lg:border-b-0 lg:border-r">
                  {type11PromptText && (
                    <div className="admin-body mb-5 text-sm font-medium leading-6 text-gray-900">
                      {type11PromptText}
                    </div>
                  )}
                  <div className="flex flex-wrap border-b border-gray-200">
                    {sample.tabs.map((tab) => {
                      const active = tab.label === activeTab;
                      return (
                        <button
                          key={tab.label}
                          type="button"
                          onClick={() => setActiveTab(tab.label)}
                          className={`border-b-2 px-3 pb-2 text-left text-xs font-semibold transition ${
                            active
                              ? "border-[#0b88a8] text-gray-950"
                              : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="admin-body max-h-[560px] overflow-auto py-4 pr-4 text-sm leading-7 text-gray-900">
                    <ContentRenderer content={activeTabHtml || "No exhibit content available."} />
                  </div>
                </section>

                <section className="bg-white p-4">
                  <p className="admin-card-title max-w-[760px] text-sm leading-6">
                    {type11InstructionText}
                  </p>
                  {renderType11DottedSeparator()}
                  {renderType11Findings()}
                  {renderType11Controls()}
                </section>
              </div>
            ) : (
              <section className="bg-white p-4">
                {type11PromptText && (
                  <div className="admin-body mb-4 max-w-[920px] whitespace-pre-line text-sm leading-7 text-gray-900">
                    {type11PromptText}
                  </div>
                )}
                <p className="admin-card-title max-w-[920px] text-sm leading-6">
                  {type11InstructionText}
                </p>
                {renderType11DottedSeparator()}
                {renderType11Findings()}
                {renderType11Controls()}
              </section>
            )}
          </div>
        ) : (
          <div className="mt-4 border border-gray-200 bg-white p-4">
            <div className="mb-5 flex w-full items-center justify-between gap-2">
              {Array.from({ length: 40 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    index % 5 === 0
                      ? "bg-cyan-300"
                      : index % 3 === 0
                      ? "border border-gray-500 bg-white"
                      : "bg-gray-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="space-y-4">
              {sample.options.map((option) => {
                const isSelected = selectedOptions.includes(option.label);
                const isCorrectOption = optionMatchesCorrectAnswer(option);
                const showCorrect = simpleChecked && isCorrectOption;
                const showWrong = simpleChecked && isSelected && !isCorrectOption;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className="flex w-full items-center gap-4 bg-transparent px-4 py-3 text-left text-sm transition hover:bg-gray-50"
                    style={{ borderRadius: 0 }}
                  >
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        showCorrect
                          ? "border-emerald-600 bg-emerald-600"
                          : showWrong
                          ? "border-red-600 bg-red-600"
                          : isSelected
                          ? "border-gray-700 bg-gray-500"
                          : "border-gray-400 bg-gray-100"
                      }`}
                      aria-hidden="true"
                    >
                      {(isSelected || showCorrect) && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-gray-800">
                      <ContentRenderer content={option.html} />
                    </span>
                    {simpleChecked && (showCorrect || showWrong) && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold ${
                          showCorrect
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {showCorrect ? "Correct" : "Review"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <span className="border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                {selectedOptions.length} selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {simpleChecked && (
                  <span
                    className={`border px-2.5 py-1 text-xs font-semibold ${
                      selectedOptionsCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {selectedOptionsCorrect ? "Correct" : "Needs Review"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSimpleChecked(true)}
                  disabled={selectedOptions.length === 0}
                  className="admin-button-primary min-h-0 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOptions([]);
                    setSimpleChecked(false);
                  }}
                  className="admin-button-secondary min-h-0 px-3 py-1.5 text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="user-detail-surface mt-4 px-3 py-3 text-sm leading-6">
          <p className="user-card-title mb-2 text-sm">Explanation</p>
          <ContentRenderer content={sample.explanationHtml || "No explanation available."} />
        </div>
      </article>
    </div>
  );
}

function QuestionTypeScanContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [result, setResult] = useState<NaxlexQuestionTypeScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderTypeId, setRenderTypeId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("render");
  });
  const [renderSampleIndex, setRenderSampleIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const sampleParam = Number(new URLSearchParams(window.location.search).get("sample"));
    return Number.isFinite(sampleParam) && sampleParam > 0 ? sampleParam - 1 : 0;
  });

  const loadScan = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/question-type-scan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Could not scan question types");
      }
      setResult(data as NaxlexQuestionTypeScanResult);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not scan question types");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadScan();
  }, [loadScan]);

  useEffect(() => {
    const syncRenderType = () => {
      const params = new URLSearchParams(window.location.search);
      const sampleParam = Number(params.get("sample"));
      setRenderTypeId(params.get("render"));
      setRenderSampleIndex(Number.isFinite(sampleParam) && sampleParam > 0 ? sampleParam - 1 : 0);
    };
    window.addEventListener("popstate", syncRenderType);
    return () => window.removeEventListener("popstate", syncRenderType);
  }, []);

  const renderTypeSummary = result?.questionTypes.find(
    (type) => type.questionTypeId === renderTypeId
  );
  const hasPagedRenderSamples =
    Boolean(renderTypeSummary?.questionTypeId) &&
    PAGED_RENDER_PREVIEW_TYPE_IDS.includes(renderTypeSummary?.questionTypeId || "");
  const renderSamples =
    hasPagedRenderSamples && renderTypeSummary?.renderSamples?.length
      ? renderTypeSummary.renderSamples
      : renderTypeSummary?.renderSample
      ? [renderTypeSummary.renderSample]
      : [];
  const normalizedRenderSampleIndex =
    renderSamples.length > 0
      ? Math.min(Math.max(renderSampleIndex, 0), renderSamples.length - 1)
      : 0;
  const renderSample = renderSamples[normalizedRenderSampleIndex];
  const isRenderPage = Boolean(renderTypeId);
  const updateRenderSampleIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), Math.max(renderSamples.length - 1, 0));
    setRenderSampleIndex(clampedIndex);
    if (typeof window !== "undefined" && renderTypeId) {
      const nextUrl = `/admin/question-type-scan?render=${encodeURIComponent(renderTypeId)}${
        PAGED_RENDER_PREVIEW_TYPE_IDS.includes(renderTypeId) ? `&sample=${clampedIndex + 1}` : ""
      }`;
      window.history.pushState(null, "", nextUrl);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Question Type Scan" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <AdminPageHeader
              eyebrow={isRenderPage ? "Quiz Preview" : "Admin Content Audit"}
              title={isRenderPage && renderTypeId ? `Question Type ${renderTypeId}` : "Question Type Scan"}
              description={
                isRenderPage ? (
                  <>
                    Answer the sample question using the same interaction expected in the quiz renderer.
                  </>
                ) : (
                  <>
                    Scan the local Naxlex Nursing Exit Exams JSON export and identify every question type,
                    option shape, answer shape, and renderer gap before building import support.
                  </>
                )
              }
              actions={
                <div className="flex flex-wrap gap-2">
                  {isRenderPage && (
                    <Link href="/admin/question-type-scan" className="admin-button-secondary">
                      Back to Scan
                    </Link>
                  )}
                  {!isRenderPage && (
                    <Link href="/admin/image-sources" className="admin-button-secondary">
                      Image Sources
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void loadScan()}
                    disabled={loading || !currentUser}
                    className="admin-button-primary"
                  >
                    {loading ? "Scanning..." : "Run Scan"}
                  </button>
                </div>
              }
            />

            <AdminNotificationRegion error={error} errorTitle="Question Type Scan Failed" />

            {!currentUser && (
              <AdminAlert tone="warning" title="Admin Session Required">
                Sign in as an admin before scanning the local export folder.
              </AdminAlert>
            )}

            {loading && !result && (
              <AdminCard>
                <AdminInlineLoading label="Scanning local JSON files..." />
              </AdminCard>
            )}

            {result && isRenderPage && (
              <div className="space-y-6">
                {renderSample ? (
                  <>
                    {renderTypeId && PAGED_RENDER_PREVIEW_TYPE_IDS.includes(renderTypeId) && renderSamples.length > 1 && (
                      <AdminCard>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-950">
                              Type {renderTypeId} {pagedPreviewKind(renderTypeId)} Sample {normalizedRenderSampleIndex + 1} Of {renderSamples.length}
                            </p>
                            <p className="admin-helper mt-1">
                              Use the same question shell to review every Type {renderTypeId} {pagedPreviewKind(renderTypeId).toLowerCase()} question found in the scan.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateRenderSampleIndex(normalizedRenderSampleIndex - 1)}
                              disabled={normalizedRenderSampleIndex === 0}
                              className="admin-button-secondary disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRenderSampleIndex(normalizedRenderSampleIndex + 1)}
                              disabled={normalizedRenderSampleIndex >= renderSamples.length - 1}
                              className="admin-button-primary disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </AdminCard>
                    )}
                    <QuestionTypeRenderPreview sample={renderSample} showMetadata={false} />
                  </>
                ) : (
                  <AdminAlert tone="warning" title="Render Not Available">
                    Type {renderTypeId} does not have a captured render sample in the current scan.
                  </AdminAlert>
                )}
              </div>
            )}

            {result && !isRenderPage && (
              <div className="space-y-6">
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <AdminStatCard label="JSON Files" value={result.totals.filesScanned} helper={`${result.totals.filesFound} found across all sources.`} />
                  <AdminStatCard label="Folders" value={result.totals.foldersScanned} helper="Folders visited recursively." />
                  <AdminStatCard label="Questions" value={result.totals.questionsScanned} helper="Questions scanned from JSON arrays." />
                  <AdminStatCard label="Question Types" value={result.totals.questionTypesFound} helper="Unique question_type_id values." />
                  <AdminStatCard label="Parse Errors" value={result.totals.parseErrors} helper="Files that could not be parsed." />
                </section>

                <AdminCard title="Scan Source" description="This local folder is read by the server route during the scan.">
                  <p className="admin-body-sm font-mono">{result.rootPath}</p>
                  <div className="mt-3 grid gap-2 lg:grid-cols-2">
                    {result.sourceRoots.map((source) => (
                      <div key={source.rootPath} className="admin-info-tile p-3">
                        <p className="admin-info-tile-label">{source.sourceName}</p>
                        <p className="admin-helper mt-1 font-mono">{source.rootPath}</p>
                      </div>
                    ))}
                  </div>
                </AdminCard>

                <AdminCard
                  title="Detected Question Types"
                  description="Supported types already have public quiz rendering. Other types need renderer and import mapping work."
                >
                  <AdminTable>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Sources</th>
                        <th>Questions</th>
                        <th>Files</th>
                        <th>Programs</th>
                        <th>Vendors</th>
                        <th>Subjects</th>
                        <th>Shapes</th>
                        <th>Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.questionTypes.map((type) => (
                        <tr key={type.questionTypeId}>
                          <AdminTableCell>
                            <span className="font-semibold">Type {type.questionTypeId}</span>
                            <span className="admin-helper block">{questionTypeName(type.questionTypeId)}</span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <TypeSupportBadge type={type} />
                          </AdminTableCell>
                          <AdminTableCell nowrap={false}>{formatList(type.sources)}</AdminTableCell>
                          <AdminTableCell>{type.questionCount}</AdminTableCell>
                          <AdminTableCell>{type.fileCount}</AdminTableCell>
                          <AdminTableCell nowrap={false}>{formatList(type.programs)}</AdminTableCell>
                          <AdminTableCell nowrap={false}>{formatList(type.vendors)}</AdminTableCell>
                          <AdminTableCell nowrap={false}>{formatList(type.subjects.slice(0, 6))}</AdminTableCell>
                          <AdminTableCell nowrap={false}>
                            <span className="admin-helper block">Options: {formatRecord(type.optionShapes)}</span>
                            <span className="admin-helper block">Answers: {formatRecord(type.correctAnswerShapes)}</span>
                          </AdminTableCell>
                          <AdminTableCell>
                            {RENDER_PREVIEW_TYPE_IDS.includes(type.questionTypeId) && type.renderSample ? (
                              <a
                                href={`/admin/question-type-scan?render=${encodeURIComponent(type.questionTypeId)}${
                                  PAGED_RENDER_PREVIEW_TYPE_IDS.includes(type.questionTypeId) ? "&sample=1" : ""
                                }`}
                                className="admin-button-secondary inline-flex px-3 py-1.5 text-xs"
                              >
                                View Render
                              </a>
                            ) : (
                              <span className="admin-helper">Not Available</span>
                            )}
                          </AdminTableCell>
                        </tr>
                      ))}
                    </tbody>
                  </AdminTable>
                </AdminCard>

                {result.errors.length > 0 && (
                  <AdminCard title="Parse Errors" description="Files listed here were skipped.">
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((scanError) => (
                          <tr key={scanError.relativePath}>
                            <AdminTableCell mono nowrap={false}>{scanError.relativePath}</AdminTableCell>
                            <AdminTableCell nowrap={false}>{scanError.message}</AdminTableCell>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminCard>
                )}

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function QuestionTypeScanPage() {
  return (
    <SidebarProvider>
      <QuestionTypeScanContent />
    </SidebarProvider>
  );
}
