export const TEAS_EXAM_SUBJECTS = [
  "Reading",
  "Mathematics",
  "Science",
  "English and Language Usage",
] as const;

export const TEAS_EXAM_SETS = Array.from({ length: 16 }, (_, index) => index + 1);

export type TeasExamSubject = (typeof TEAS_EXAM_SUBJECTS)[number];

export type PublicTeasExamQuestion = {
  id: string;
  subject: TeasExamSubject;
  setNumber: number;
  questionNumber: string;
  passageText: string;
  questionText: string;
  choices: string[];
  correctAnswerLabels: string[];
  correctAnswerText: string;
  sourceCloseness: number | null;
};
