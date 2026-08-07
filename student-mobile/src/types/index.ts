export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  accountType: "STUDENT";
}

export interface Course {
  id: string;
  name: string;
  category: "LAW" | "LANGUAGE" | "OTHER";
  description: string | null;
}

export interface CourseSubscription {
  id: string;
  courseId: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
}

export interface McqQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  courseId: string;
  subjectId: string;
  isFreeDemo: boolean;
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
}

export interface MockTest {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  isFreeDemo: boolean;
  _count?: { questions: number };
}

export interface TestQuestion {
  questionId: string;
  question: { id: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string };
}

export interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
  status: string;
  recordingUrl: string | null;
}

export interface LibraryResource {
  id: string;
  title: string;
  type: string;
  content: string | null;
  fileUrl: string | null;
  isDownloadable: boolean;
}

export interface Bookmark {
  id: string;
  resourceType: "LIBRARY" | "MCQ";
  resourceId: string;
  preview: string;
  courseId?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
