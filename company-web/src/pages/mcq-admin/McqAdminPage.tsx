import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm, Controller } from "react-hook-form";
import { useCoursesAdmin, useSubjectsAdmin, useMcqAdminList, useMcqAdminActions } from "../../hooks/useCourseAdmin";
import { CreateMcqPayload, McqQuestionAdmin } from "../../api/mcqAdmin.api";

export function McqAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const [courseId, setCourseId] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: mcqData, isLoading } = useMcqAdminList({ courseId: courseId || undefined });
  const { create, update, remove } = useMcqAdminActions();

  const filteredItems = mcqData?.items.filter((q) => !subjectFilter || q.subjectId === subjectFilter);
  const groupedBySubject = filteredItems?.reduce((acc: Record<string, { name: string; items: typeof filteredItems }>, q) => {
    const key = q.subjectId;
    const name = q.subject?.name ?? "No Subject";
    if (!acc[key]) acc[key] = { name, items: [] };
    acc[key].items!.push(q);
    return acc;
  }, {});
  const subjectGroups = groupedBySubject ? Object.values(groupedBySubject).sort((a, b) => a.name.localeCompare(b.name)) : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<McqQuestionAdmin | null>(null);
  const { register, handleSubmit, reset, control, watch, formState } = useForm<CreateMcqPayload>({
    defaultValues: { difficulty: "MEDIUM", isFreeDemo: false, answerType: "MCQ" },
  });
  const selectedAnswerType = watch("answerType");
  const watchedQuestionText = watch("question") ?? "";
  const detectedBlankCount = (watchedQuestionText.match(/\{\{\d+\}\}/g) ?? []).length;
  const selectedSubjectId = watch("subjectId");
  const isListening = subjects?.find((s: any) => s.id === selectedSubjectId)?.name.toLowerCase().includes("listening") ?? false;
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const openCreate = () => {
    setEditing(null);
    reset({ courseId, difficulty: "MEDIUM", isFreeDemo: false, correctOption: "A" });
    setDialogOpen(true);
  };

  const openEdit = (q: McqQuestionAdmin) => {
    setEditing(q);
    reset({
      ...q,
      explanation: q.explanation ?? undefined,
      examType: q.examType ?? undefined,
      optionA: q.optionA ?? undefined,
      optionB: q.optionB ?? undefined,
      optionC: q.optionC ?? undefined,
      optionD: q.optionD ?? undefined,
      correctOption: q.correctOption ?? undefined,
      correctAnswerText: q.correctAnswerText ?? undefined,
      answerType: q.answerType ?? "MCQ",
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateMcqPayload) => {
    if (editing) {
      update.mutate(
        { id: editing.id, payload: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      create.mutate({ ...values, audioFile } as any, {
        onSuccess: () => {
          reset({ courseId, difficulty: "MEDIUM", isFreeDemo: false, correctOption: "A", answerType: "MCQ" });
          setAudioFile(null);
          setDialogOpen(false);
        },
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Question Bank
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!courseId}>
          Add Question
        </Button>
      </Box>

      <TextField
        select
        label="Course"
        size="small"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        sx={{ minWidth: 260, mb: 3 }}
      >
        <MenuItem value="">Select a course to view/add questions</MenuItem>
        {courses?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {courseId && (
        <TextField
          select
          label="Subject"
          size="small"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          sx={{ minWidth: 220, mb: 3, ml: 2 }}
        >
          <MenuItem value="">All Subjects</MenuItem>
          {subjects?.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {courseId && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Difficulty</TableCell>
                <TableCell align="center">Free Demo</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {subjectGroups.map((group) => (
                <React.Fragment key={group.name}>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ bgcolor: "#F3F4F6", py: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        {group.name} ({group.items!.length})
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {group.items!.map((q) => (
                    <TableRow key={q.id} hover>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={() => openEdit(q)}
                          title="Click to view/edit full question"
                        >
                          {q.question}
                        </Typography>
                      </TableCell>
                      <TableCell>{q.subject?.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={q.difficulty} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{q.isFreeDemo ? "Yes" : "No"}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(q)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => remove.mutate(q.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {filteredItems?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No questions yet {subjectFilter ? "for this subject." : "for this course."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(create.isError || update.isError) && (
              <Alert severity="error">
                {((create.error || update.error) as any)?.response?.data?.message || "Failed to save question"}
              </Alert>
            )}
            <TextField
              label={selectedAnswerType === "MULTI_BLANK" ? "Passage / Form / Table Text (use {{1}}, {{2}}, {{3}}... for each blank)" : "Question"}
              required
              fullWidth
              multiline
              rows={selectedAnswerType === "MULTI_BLANK" ? 5 : 2}
              placeholder={
                selectedAnswerType === "MULTI_BLANK"
                  ? 'e.g. "The library opens at {{1}} on weekdays and closes at {{2}}."'
                  : undefined
              }
              {...register("question", { required: true })}
              error={!!formState.errors.question}
            />

            {selectedAnswerType === "MULTI_BLANK" && (
              <Alert severity="info" sx={{ fontSize: 13 }}>
                One shared passage/form/table with several numbered blanks. Type <strong>{"{{1}}"}</strong>,{" "}
                <strong>{"{{2}}"}</strong>, etc. where each blank goes in the text above — a box for each blank's
                answer will appear below automatically.
              </Alert>
            )}


            <TextField select label="Subject" required fullWidth {...register("subjectId", { required: true })} error={!!formState.errors.subjectId}>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <Controller
              name="answerType"
              control={control}
              render={({ field }) => (
                <TextField select label="Answer Type" required fullWidth {...field} value={field.value ?? "MCQ"}>
                  <MenuItem value="MCQ">Multiple Choice (4 options)</MenuItem>
                  <MenuItem value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</MenuItem>
                  <MenuItem value="YES_NO_NOT_GIVEN">Yes / No / Not Given</MenuItem>
                  <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
                  <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
                  <MenuItem value="MULTI_BLANK">Form/Note/Table/Summary Completion (multiple blanks)</MenuItem>
                </TextField>
              )}
            />

            {isListening && (
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
                {!audioFile && (
                  <TextField
                    label="Or paste an Audio URL instead"
                    fullWidth
                    sx={{ mt: 1.5 }}
                    placeholder="https://..."
                    {...register("audioUrl")}
                  />
                )}
              </Box>
            )}

            {selectedAnswerType === "MCQ" && (
              <>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField label="Option A" required fullWidth {...register("optionA", { required: true })} />
                  <TextField label="Option B" required fullWidth {...register("optionB", { required: true })} />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField label="Option C" required fullWidth {...register("optionC", { required: true })} />
                  <TextField label="Option D" required fullWidth {...register("optionD", { required: true })} />
                </Box>
              </>
            )}

            {(selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" || selectedAnswerType === "YES_NO_NOT_GIVEN") && (
              <Alert severity="info" sx={{ fontSize: 13 }}>
                Option labels are set automatically ({selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" ? "True / False / Not Given" : "Yes / No / Not Given"}) — just pick the correct one below.
              </Alert>
            )}

            {(selectedAnswerType === "FILL_BLANK" || selectedAnswerType === "SHORT_ANSWER") && (
              <TextField
                label="Correct Answer"
                required
                fullWidth
                placeholder="The exact word(s) or short phrase expected"
                {...register("correctAnswerText", { required: true })}
              />
            )}

            {selectedAnswerType === "MULTI_BLANK" && (
              <Controller
                name="correctAnswerText"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  const currentAnswers = (field.value ?? "").split("|");
                  const setBlankAnswer = (i: number, value: string) => {
                    const next = [...currentAnswers];
                    while (next.length < detectedBlankCount) next.push("");
                    next[i] = value;
                    field.onChange(next.slice(0, detectedBlankCount).join("|"));
                  };
                  if (detectedBlankCount === 0) {
                    return (
                      <Alert severity="warning" sx={{ fontSize: 13 }}>
                        No blanks detected yet — add {"{{1}}"}, {"{{2}}"}, etc. to the text above first.
                      </Alert>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, bgcolor: "#F8FAFC", p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        CORRECT ANSWER FOR EACH BLANK
                      </Typography>
                      {Array.from({ length: detectedBlankCount }).map((_, i) => (
                        <TextField
                          key={i}
                          size="small"
                          label={`Blank {{${i + 1}}}`}
                          fullWidth
                          value={currentAnswers[i] ?? ""}
                          onChange={(e) => setBlankAnswer(i, e.target.value)}
                        />
                      ))}
                    </Box>
                  );
                }}
              />
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              {selectedAnswerType !== "FILL_BLANK" && selectedAnswerType !== "SHORT_ANSWER" && selectedAnswerType !== "MULTI_BLANK" && (
                <Controller
                  name="correctOption"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField select label="Correct Option" required fullWidth {...field} value={field.value ?? "A"}>
                      {selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" ? (
                        <MenuItem value="A">True</MenuItem>
                      ) : selectedAnswerType === "YES_NO_NOT_GIVEN" ? (
                        <MenuItem value="A">Yes</MenuItem>
                      ) : (
                        <MenuItem value="A">A</MenuItem>
                      )}
                      {selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" ? (
                        <MenuItem value="B">False</MenuItem>
                      ) : selectedAnswerType === "YES_NO_NOT_GIVEN" ? (
                        <MenuItem value="B">No</MenuItem>
                      ) : (
                        <MenuItem value="B">B</MenuItem>
                      )}
                      {(selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" || selectedAnswerType === "YES_NO_NOT_GIVEN") ? (
                        <MenuItem value="C">Not Given</MenuItem>
                      ) : (
                        <MenuItem value="C">C</MenuItem>
                      )}
                      {selectedAnswerType === "MCQ" && <MenuItem value="D">D</MenuItem>}
                    </TextField>
                  )}
                />
              )}
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <TextField select label="Difficulty" required fullWidth {...field} value={field.value ?? "MEDIUM"}>
                    <MenuItem value="EASY">Easy</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HARD">Hard</MenuItem>
                  </TextField>
                )}
              />
            </Box>

            <TextField label="Explanation (shown after answering)" fullWidth multiline rows={2} {...register("explanation")} />

            <Controller
              name="isFreeDemo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Free Demo — students without a subscription can see this"
                />
              )}
            />

            <input type="hidden" {...register("courseId")} value={courseId} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving..." : "Save Question"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
