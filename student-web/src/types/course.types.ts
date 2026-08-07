export interface Course {
  id: string;
  name: string;
  category: "LAW" | "LANGUAGE" | "OTHER";
  description: string | null;
  iconUrl: string | null;
}

export interface CourseSubscription {
  id: string;
  courseId: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startedAt: string;
  expiresAt: string | null;
  course: Course;
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
}

export interface McqQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  // correctOption/explanation are intentionally absent — backend strips
  // them for STUDENT accounts until an attempt is submitted.
  courseId: string;
  subjectId: string;
  isFreeDemo: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface MockTest {
  id: string;
  title: string;
  courseId: string;
  subjectId: string | null;
  durationMinutes: number;
  isPublished: boolean;
  isFreeDemo: boolean;
  _count?: { questions: number };
}

export interface TestAttemptStart {
  attemptId: string;
  totalQuestions: number;
  durationMinutes: number;
}

export interface TestAttemptResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}
