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
