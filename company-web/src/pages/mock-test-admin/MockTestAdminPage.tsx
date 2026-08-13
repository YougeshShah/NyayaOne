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
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import { useForm } from "react-hook-form";
import { useCoursesAdmin, useSubjectsAdmin, useMcqAdminList } from "../../hooks/useCourseAdmin";
import { useMockTestsAdmin, useMockTestAdminActions, useMockTestDetailAdmin } from "../../hooks/useTestLiveAdmin";
import { useSectionsAdmin, useSectionAdminActions } from "../../hooks/useSectionAdmin";
import { CreateMockTestPayload } from "../../api/testLiveAdmin.api";
import { CreateSectionPayload } from "../../api/testSectionAdmin.api";

const sectionTypes = ["MCQ", "READING", "LISTENING", "WRITING", "SPEAKING"];

function ManageQuestionsDialog({ mockTestId, courseId, onClose }: { mockTestId: string; courseId: string; onClose: () => void }) {
  const { data: test } = useMockTestDetailAdmin(mockTestId);
  const { data: bankData } = useMcqAdminList({ courseId });
  const { addQuestion, removeQuestion } = useMockTestAdminActions();
  const [searchTerm, setSearchTerm] = useState("");

  const assignedIds = new Set((test?.questions ?? []).map((q: any) => q.questionId));
  const searchResults = bankData?.items.filter(
    (q) => !assignedIds.has(q.id) && (!searchTerm || q.question.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Questions — {test?.title}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Currently in this test ({test?.questions?.length ?? 0})
        </Typography>
        <Box sx={{ maxHeight: 260, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 1, mb: 3 }}>
          {test?.questions?.map((mtq: any) => (
            <Box key={mtq.questionId} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderBottom: "1px solid #F3F4F6" }}>
              <Typography variant="body2" sx={{ maxWidth: 480, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {mtq.question?.question} <Chip label={`${mtq.marks} mark${mtq.marks !== 1 ? "s" : ""}`} size="small" sx={{ ml: 1 }} />
              </Typography>
              <IconButton
                size="small"
                onClick={() => removeQuestion.mutate({ mockTestId, questionId: mtq.questionId })}
                disabled={removeQuestion.isPending}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          {test?.questions?.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
              No questions yet — add some below.
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Add from Question Bank
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ maxHeight: 260, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 1 }}>
          {searchResults?.map((q) => (
            <Box key={q.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderBottom: "1px solid #F3F4F6" }}>
              <Typography variant="body2" sx={{ maxWidth: 480, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {q.question}
              </Typography>
              <Button
                size="small"
                onClick={() => addQuestion.mutate({ mockTestId, questionId: q.id, marks: 1 })}
                disabled={addQuestion.isPending}
              >
                Add
              </Button>
            </Box>
          ))}
          {searchResults?.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
              No matching questions found.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionsDialog({ mockTestId, onClose }: { mockTestId: string; onClose: () => void }) {
  const { data: sections } = useSectionsAdmin(mockTestId);
  const { create, remove } = useSectionAdminActions();
  const { register, handleSubmit, reset, watch } = useForm<CreateSectionPayload>({
    defaultValues: { mockTestId, type: "READING", order: 0 },
  });
  const selectedType = watch("type");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const onCreate = (values: CreateSectionPayload) => {
    create.mutate(
      { ...values, mockTestId, order: sections?.length ?? 0, audioFile } as any,
      { onSuccess: () => { reset({ mockTestId, type: "READING", order: 0 }); setAudioFile(null); } }
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
            <Box>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                {audioFile ? audioFile.name : "Upload Audio Clip"}
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav,.ogg"
                  hidden
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {audioFile && (
                <Button size="small" color="error" onClick={() => setAudioFile(null)} sx={{ ml: 1 }}>
                  Remove
                </Button>
              )}
              {!audioFile && <TextField label="Or paste an Audio URL instead" fullWidth sx={{ mt: 1.5 }} placeholder="https://..." {...register("audioUrl")} />}
            </Box>
          )}
          {selectedType === "WRITING" && (
            <>
              <TextField label="Writing Prompt" multiline rows={3} fullWidth {...register("writingPrompt")} />
              <TextField label="Minimum Word Count" type="number" fullWidth {...register("minWordCount", { valueAsNumber: true })} />
            </>
          )}
          {selectedType === "SPEAKING" && (
            <TextField
              label="Topic / Cue Card"
              multiline
              rows={3}
              fullWidth
              placeholder='e.g. "Describe a place you would like to visit. You should say: where it is, why you want to go there, what you would do there, and explain why this place appeals to you."'
              {...register("writingPrompt")}
            />
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
  const selectedCourseNameForType = courses?.find((c: any) => c.id === courseId)?.name ?? "";
  const isLawCourseForType = selectedCourseNameForType.toLowerCase().includes("law");
  const isLoksewaCourseForType = selectedCourseNameForType.toLowerCase().includes("loksewa");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: tests, isLoading } = useMockTestsAdmin(courseId || undefined);
  const { create, publish } = useMockTestAdminActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sectionsForTestId, setSectionsForTestId] = useState<string | null>(null);
  const [questionsForTestId, setQuestionsForTestId] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<CreateMockTestPayload>({
    defaultValues: { durationMinutes: 60, questionCount: 25, marksPerQuestion: 1, negativeMarkingPercent: 0 },
  });

  const onCreate = (values: CreateMockTestPayload) => {
    create.mutate(
      { ...values, courseId },
      {
        onSuccess: () => {
          reset({ durationMinutes: 60, questionCount: 25, marksPerQuestion: 1, negativeMarkingPercent: 0 });
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
                    <Button size="small" onClick={() => setQuestionsForTestId(test.id)}>
                      Questions
                    </Button>
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

            {isLawCourseForType && (
              <TextField select label="Exam Track (optional)" fullWidth defaultValue="" {...register("examType")}>
                <MenuItem value="">General / Not specific</MenuItem>
                <MenuItem value="LLB">LLB</MenuItem>
                <MenuItem value="BALLB">BALLB</MenuItem>
                <MenuItem value="BAR_COUNCIL">Bar Council</MenuItem>
                <MenuItem value="JUDICIAL_SERVICE">Judicial Service</MenuItem>
                <MenuItem value="PUBLIC_SERVICE_COMMISSION">Public Service Commission (Law)</MenuItem>
              </TextField>
            )}

            {isLoksewaCourseForType && (
              <TextField select label="Position Level (optional)" fullWidth defaultValue="" {...register("examType")}>
                <MenuItem value="">General / All levels</MenuItem>
                <MenuItem value="KHARIDAR">Kharidar (Non-Gazetted 3rd Class)</MenuItem>
                <MenuItem value="NAYAB_SUBBA">Nayab Subba (Non-Gazetted 1st Class)</MenuItem>
                <MenuItem value="SECTION_OFFICER">Section Officer / Sakha Adhikrit (Gazetted 3rd Class)</MenuItem>
              </TextField>
            )}
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Marks per Question"
                type="number"
                fullWidth
                defaultValue={1}
                helperText="e.g. IOE Part A = 1, Part B = 2 — create separate tests for mixed weighting"
                {...register("marksPerQuestion", { valueAsNumber: true, min: 1 })}
              />
              <TextField
                label="Negative Marking % (0 = none)"
                type="number"
                fullWidth
                defaultValue={0}
                helperText="e.g. IOE ~10, Medical (MECEE-BL) 25 — leave 0 for Law/IELTS practice"
                {...register("negativeMarkingPercent", { valueAsNumber: true, min: 0, max: 100 })}
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
      {questionsForTestId && (
        <ManageQuestionsDialog mockTestId={questionsForTestId} courseId={courseId} onClose={() => setQuestionsForTestId(null)} />
      )}
    </Box>
  );
}
