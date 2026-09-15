import { apiClient } from "./client";

export interface CourseContentItem {
  id: string;
  term: string;
  title: string;
  fileType: "PDF" | "IMAGE" | "TEXT";
  fileUrl: string | null;
  textBody: string | null;
  createdAt: string;
  subject: { id: string; name: string } | null;
}

export const courseContentApi = {
  async forCourse(courseId: string): Promise<CourseContentItem[]> {
    const { data } = await apiClient.get(`/course-content/course/${courseId}/student`);
    return data.data;
  },
};
