import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useForm } from "react-hook-form";
import { useCoursesAdmin, useCourseAdminActions, useSubjectsAdmin, useSubjectAdminActions } from "../../hooks/useCourseAdmin";

export function CoursesAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const { create: createCourse } = useCourseAdminActions();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const courseForm = useForm<{ name: string; category: string; description?: string }>({
    defaultValues: { category: "LAW" },
  });

  const { data: subjects } = useSubjectsAdmin(selectedCourseId ?? undefined);
  const { create: createSubject, remove: removeSubject } = useSubjectAdminActions();
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const subjectForm = useForm<{ name: string; examType?: string }>();

  const onCreateCourse = (values: { name: string; category: string; description?: string }) => {
    createCourse.mutate(values, {
      onSuccess: () => {
        courseForm.reset({ category: "LAW" });
        setCourseDialogOpen(false);
      },
    });
  };

  const onCreateSubject = (values: { name: string; examType?: string }) => {
    if (!selectedCourseId) return;
    createSubject.mutate(
      { ...values, courseId: selectedCourseId },
      {
        onSuccess: () => {
          subjectForm.reset();
          setSubjectDialogOpen(false);
        },
      }
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Courses
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCourseDialogOpen(true)}>
          Add Course
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Course list */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="center">Subjects</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses?.map((course) => (
                <TableRow
                  key={course.id}
                  hover
                  selected={selectedCourseId === course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{course.name}</TableCell>
                  <TableCell>
                    <Chip label={course.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{course._count?.subjects ?? 0}</TableCell>
                </TableRow>
              ))}
              {courses?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No courses yet — click "Add Course" to create one (e.g. Law, IELTS).
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Subjects panel for selected course */}
        <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", flex: 1, p: 2 }}>
          {selectedCourseId ? (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Subjects — {courses?.find((c) => c.id === selectedCourseId)?.name}
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setSubjectDialogOpen(true)}>
                  Add Subject
                </Button>
              </Box>
              {subjects?.map((subject) => (
                <Box
                  key={subject.id}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #F3F4F6" }}
                >
                  <Typography variant="body2">{subject.name}</Typography>
                  <IconButton size="small" onClick={() => removeSubject.mutate(subject.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {subjects?.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No subjects yet — e.g. "Constitutional Law", "Reading".
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a course on the left to manage its subjects.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Create Course dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Course</DialogTitle>
        <Box component="form" onSubmit={courseForm.handleSubmit(onCreateCourse)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {createCourse.isError && (
              <Alert severity="error">{(createCourse.error as any)?.response?.data?.message || "Failed to create course"}</Alert>
            )}
            <TextField label="Course Name" placeholder="e.g. Law Exam Preparation, IELTS Preparation" required fullWidth {...courseForm.register("name", { required: true })} />
            <TextField select label="Category" required fullWidth defaultValue="LAW" {...courseForm.register("category")}>
              <MenuItem value="LAW">Law</MenuItem>
              <MenuItem value="LANGUAGE">Language (IELTS, TOEFL, ...)</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
            <TextField label="Description" fullWidth multiline rows={2} {...courseForm.register("description")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createCourse.isPending}>
              {createCourse.isPending ? "Creating..." : "Create Course"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create Subject dialog */}
      <Dialog open={subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Subject</DialogTitle>
        <Box component="form" onSubmit={subjectForm.handleSubmit(onCreateSubject)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {createSubject.isError && (
              <Alert severity="error">{(createSubject.error as any)?.response?.data?.message || "Failed to create subject"}</Alert>
            )}
            <TextField label="Subject Name" placeholder="e.g. Constitutional Law, Reading" required fullWidth {...subjectForm.register("name", { required: true })} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createSubject.isPending}>
              {createSubject.isPending ? "Creating..." : "Create Subject"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
