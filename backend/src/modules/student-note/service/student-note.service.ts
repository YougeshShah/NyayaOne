import { AppError } from "../../../common/errors/AppError";
import { studentNoteRepository } from "../repository/student-note.repository";

export const studentNoteService = {
  async create(studentId: string, courseId: string | undefined, title: string, content: string) {
    return studentNoteRepository.create({ studentId, courseId, title, content });
  },

  async myNotes(studentId: string, courseId?: string) {
    return studentNoteRepository.listForStudent(studentId, courseId);
  },

  // Every write is scoped to the requesting student's own notes only --
  // notes are personal, so nobody (not even the institution admin) can
  // read, edit, or delete another student's note.
  async update(id: string, studentId: string, title?: string, content?: string) {
    const note = await studentNoteRepository.findById(id);
    if (!note) throw AppError.notFound("Note not found");
    if (note.studentId !== studentId) throw AppError.forbidden("This note does not belong to you");
    return studentNoteRepository.update(id, { title, content });
  },

  async remove(id: string, studentId: string) {
    const note = await studentNoteRepository.findById(id);
    if (!note) throw AppError.notFound("Note not found");
    if (note.studentId !== studentId) throw AppError.forbidden("This note does not belong to you");
    return studentNoteRepository.delete(id);
  },
};
