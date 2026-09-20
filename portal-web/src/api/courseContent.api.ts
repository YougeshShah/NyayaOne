import { apiClient } from "./client";

export interface CourseContentItem {
  id: string;
  courseId: string;
  subjectId: string | null;
  term: string;
  title: string;
  fileType: "PDF" | "IMAGE" | "TEXT";
  fileUrl: string | null;
  textBody: string | null;
  createdAt: string;
  subject: { id: string; name: string } | null;
}

export const courseContentApi = {
  async listForAdmin(courseId: string): Promise<CourseContentItem[]> {
    const { data } = await apiClient.get(`/course-content/course/${courseId}/admin`);
    return data.data;
  },
  async create(
    courseId: string,
    term: string,
    title: string,
    fileType: "PDF" | "IMAGE" | "TEXT",
    opts: { subjectId?: string; textBody?: string; file?: File }
  ): Promise<CourseContentItem> {
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("term", term);
    formData.append("title", title);
    formData.append("fileType", fileType);
    if (opts.subjectId) formData.append("subjectId", opts.subjectId);
    if (opts.textBody) formData.append("textBody", opts.textBody);
    if (opts.file) formData.append("file", opts.file);
    const { data } = await apiClient.post("/course-content", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/course-content/${id}`);
  },
};
