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
  IconButton,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useForm } from "react-hook-form";
import { useCoursesAdmin, useSubjectsAdmin } from "../../hooks/useCourseAdmin";
import { useMockTestsAdmin, useMockTestAdminActions } from "../../hooks/useTestLiveAdmin";
import { useSectionsAdmin, useSectionAdminActions } from "../../hooks/useSectionAdmin";
import { CreateMockTestPayload } from "../../api/testLiveAdmin.api";
import { CreateSectionPayload } from "../../api/testSectionAdmin.api";

const sectionTypes = ["MCQ", "READING", "LISTENING", "WRITING", "SPEAKING"];

function SectionsDialog({ mockTestId, onClose }: { mockTestId: string; onClose: () => void }) {
  const { data: sections } = useSectionsAdmin(mockTestId);
  const { create, remove } = useSectionAdminActions();
  const { register, handleSubmit, reset, watch } = useForm<CreateSectionPayload>({
    defaultValues: { mockTestId, type: "READING", order: 0 },
  });
  const selectedType = watch("type");

  const onCreate = (values: CreateSectionPayload) => {
    create.mutate(
      { ...values, mockTestId, order: sections?.length ?? 0 },
      { onSuccess: () => reset({ mockTestId, type: "READING", order: 0 }) }
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Sections (IELTS-style)</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Add Reading/Listening/Writing/Speaking sections. A test with no sections is treated as a flat MCQ test.
        </Typography>

        {sections?.map((s) => (
          <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #F3F4F6" }}>
            <Box>
              <Chip label={s.type} size="small" sx={{ mr: 1 }} />
              <Typography variant="body2" component="span">
                {s.title}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => remove.mutate(s.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Box component="form" onSubmit={handleSubmit(onCreate)} sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {create.isError && <Alert severity="error">{(create.error as any)?.response?.data?.message}</Alert>}
          <Typography variant="subtitle2" fontWeight={700}>
            Add Section
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField select label="Type" fullWidth defaultValue="READING" {...register("type")}>
              {sectionTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Title" required fullWidth placeholder="e.g. Reading Passage 1" {...register("title", { required: true })} />
          </Box>

          {selectedType === "READING" && (
            <TextField label="Passage Text" multiline rows={4} fullWidth {...register("passageText")} />
          )}
          {selectedType === "LISTENING" && (
            <TextField label="Audio URL" fullWidth placeholder="https://..." {...register("audioUrl")} />
          )}
          {selectedType === "WRITING" && (
            <>
              <TextField label="Writing Prompt" multiline rows={3} fullWidth {...register("writingPrompt")} />
              <TextField label="Minimum Word Count" type="number" fullWidth {...register("minWordCount", { valueAsNumber: true })} />
            </>
          )}
          <TextField label="Time Limit (minutes, optional)" type="number" fullWidth {...register("timeLimitMinutes", { valueAsNumber: true })} />

          <Button type="submit" variant="contained" disabled={create.isPending} sx={{ alignSelf: "flex-start" }}>
            {create.isPending ? "Adding..." : "Add Section"}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function MockTestAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const [courseId, setCourseId] = useState<string>("");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: tests, isLoading } = useMockTestsAdmin(courseId || undefined);
  const { create, publish } = useMockTestAdminActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sectionsForTestId, setSectionsForTestId] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<CreateMockTestPayload>({
    defaultValues: { durationMinutes: 60, questionCount: 25 },
  });

  const onCreate = (values: CreateMockTestPayload) => {
    create.mutate(
      { ...values, courseId },
      {
        onSuccess: () => {
          reset({ durationMinutes: 60, questionCount: 25 });
          setDialogOpen(false);
        },
      }
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Mock Tests
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} disabled={!courseId}>
          Create Mock Test
        </Button>
      </Box>

      <TextField select label="Course" size="small" value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ minWidth: 260, mb: 3 }}>
        <MenuItem value="">Select a course</MenuItem>
        {courses?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {courseId && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell align="center">Questions</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {tests?.map((test) => (
                <TableRow key={test.id} hover>
                  <TableCell>{test.title}</TableCell>
                  <TableCell>{test.subject?.name ?? "—"}</TableCell>
                  <TableCell align="center">{test.durationMinutes} min</TableCell>
                  <TableCell align="center">{test._count?.questions ?? 0}</TableCell>
                  <TableCell align="center">
                    {test.isPublished ? <Chip label="Published" color="success" size="small" /> : <Chip label="Draft" size="small" />}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSectionsForTestId(test.id)}>
                      Sections
                    </Button>
                    {!test.isPublished && (
                      <Button size="small" onClick={() => publish.mutate(test.id)} disabled={publish.isPending}>
                        Publish
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {tests?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No mock tests yet for this course.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Mock Test</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && (
              <Alert severity="error">{(create.error as any)?.response?.data?.message || "Failed to create mock test"}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Questions are pulled at random from the question bank for this course/subject — add enough questions
              first so there's something to draw from.
            </Typography>
            <TextField label="Test Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <TextField select label="Subject (optional — leave blank to pull from all subjects)" fullWidth {...register("subjectId")}>
              <MenuItem value="">All Subjects</MenuItem>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Duration (minutes)"
                type="number"
                required
                fullWidth
                {...register("durationMinutes", { required: true, valueAsNumber: true, min: 1 })}
              />
              <TextField
                label="Number of Questions"
                type="number"
                required
                fullWidth
                {...register("questionCount", { required: true, valueAsNumber: true, min: 1 })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Test"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {sectionsForTestId && <SectionsDialog mockTestId={sectionsForTestId} onClose={() => setSectionsForTestId(null)} />}
    </Box>
  );
}
