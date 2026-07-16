export type ExamAccessState = "full" | "preview" | "locked";

export type ExamProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "retake_available"
  | "preview"
  | "locked";

export type ExamMode = "study" | "practice" | "exam";

export interface MyExamItem {
  id: string;
  slug: string;
  title: string;
  familyId: string;
  familyName: "Nursing Entrance Exams" | "Nursing Test Bank" | "Nursing Exit Exams";
  packageId: string;
  subjectId?: string;
  subjectName?: string;
  setNumber?: number;
  questionCount: number;
  estimatedMinutes?: number;
  supportedModes: ExamMode[];
  accessState: ExamAccessState;
  progressStatus: ExamProgressStatus;
  completedQuestions?: number;
  latestScore?: number;
  bestScore?: number;
  correctAnswers?: number;
  lastAttemptedAt?: string;
  completedAt?: string;
  latestAttemptId?: string;
  href: string;
  previewQuestionCount?: number;
}

export interface MyExamLockedPackage {
  id: string;
  name: string;
  description: string;
  packageIds: string[];
  href: string;
  includedExamCount: number;
}

export interface MyExamsViewModel {
  accessLabels: string[];
  exams: MyExamItem[];
  continueAttempts: MyExamItem[];
  lockedPackages: MyExamLockedPackage[];
  hasPaidAccess: boolean;
}
