import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
  Tabs,
  Tab,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useForm, Controller } from "react-hook-form";
import { apiClient } from "../../api/client";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";
import { institutionLibraryApi } from "../../api/institutionLibrary.api";
import { institutionMcqApi } from "../../api/institutionMcq.api";
import { institutionFlashcardApi, CreateFlashcardPayload } from "../../api/institutionFlashcard.api";
import { useInstitutionFlashcards, useInstitutionFlashcardActions } from "../../hooks/useInstitutionFlashcard";
import { useAuthStore } from "../../store/authStore";
import { useNotifyMyStudents } from "../../hooks/useInstitutionNotification";

interface Subject {
  id: string;
  name: string;
}

interface NoteFormValues {
  title: string;
  courseId: string;
  subjectId: string;
  content?: string;
  isFreeDemo: boolean;
}

interface McqFormValues {
  question: string;
  courseId: string;
  subjectId: string;
  answerType: "MCQ" | "TRUE_FALSE_NOT_GIVEN" | "YES_NO_NOT_GIVEN" | "FILL_BLANK" | "SHORT_ANSWER" | "MULTI_BLANK";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  correctAnswerText?: string;
  explanation?: string;
  isFreeDemo: boolean;
  audioUrl?: string;
  examType?: string;
}

function useInstitutionSubjects(courseId: string) {
  return useQuery({
    queryKey: ["institution-subjects", courseId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Subject[] }>("/subjects", { params: { courseId } });
      return data.data;
    },
    enabled: !!courseId,
  });
}

function NotesTab() {
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const { register, handleSubmit, watch, control, reset, formState } = useForm<NoteFormValues>({ defaultValues: { isFreeDemo: false } });
  const selectedCourseId = watch("courseId");
  const selectedSubjectId = watch("subjectId");
  const { data: subjects } = useInstitutionSubjects(selectedCourseId);
  const isWritingSubject = subjects?.find((s) => s.id === selectedSubjectId)?.name.toLowerCase().includes("writing") ?? false;
  const [successMsg, setSuccessMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const create = useMutation({
    mutationFn: (values: NoteFormValues) => institutionLibraryApi.create({ ...values, file }),
    onSuccess: () => {
      setSuccessMsg("Published — visible to your own students only.");
      reset({ isFreeDemo: false });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const onSubmit = (values: NoteFormValues) => {
    if (!values.content?.trim() && !file) {
      return; // form-level validation below already flags this via the alert
    }
    create.mutate(values);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {create.isError && <Alert severity="error" sx={{ mb: 2 }}>{(create.error as any)?.response?.data?.message || "Failed to publish"}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label={isWritingSubject ? "Writing Task Title (e.g. \"Task 2 — Opinion Essay\")" : "Title"}
          required
          fullWidth
          {...register("title", { required: true })}
          error={!!formState.errors.title}
        />
        <TextField select label="Course" required fullWidth defaultValue="" {...register("courseId", { required: true })}>
          {courses?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select label="Subject" required fullWidth disabled={!selectedCourseId} defaultValue="" {...register("subjectId", { required: true })}>
          {subjects?.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>

        {!isWritingSubject && (
          <Box>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              {file ? file.name : "Upload PDF (optional)"}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            {file && (
              <Button size="small" color="error" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} sx={{ ml: 1 }}>
                Remove
              </Button>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Upload a PDF, write notes below, or both — text is auto-extracted from the PDF if you leave the text
              box empty.
            </Typography>
          </Box>
        )}

        <TextField
          label={isWritingSubject ? "Writing Prompt (the task students must respond to)" : "Content (optional if a PDF is uploaded)"}
          required={isWritingSubject}
          fullWidth
          multiline
          rows={8}
          placeholder={isWritingSubject ? "e.g. \"The graph below shows... Summarize the information...\"" : "Write your notes here..."}
          {...register("content", { required: isWritingSubject })}
        />
        <Controller
          name="isFreeDemo"
          control={control}
          render={({ field }) => (
            <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Free Demo — visible to students without a subscription" />
          )}
        />
        <Button type="submit" variant="contained" disabled={create.isPending}>
          {create.isPending ? "Publishing..." : "Publish to My Students"}
        </Button>
      </Box>
    </Paper>
  );
}

function FlashcardTab() {
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const [courseId, setCourseId] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const { data: subjects } = useInstitutionSubjects(courseId);
  const { data: cards, isLoading } = useInstitutionFlashcards(courseId, subjectFilter || undefined);
  const { create, remove } = useInstitutionFlashcardActions();

  const { register, handleSubmit, reset, formState } = useForm<CreateFlashcardPayload>({
    defaultValues: { difficulty: "MEDIUM" },
  });

  const onCreate = (values: CreateFlashcardPayload) => {
    create.mutate({ ...values, courseId }, { onSuccess: () => reset({ courseId, difficulty: "MEDIUM", term: "", definition: "", example: "" }) });
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Quick memorization cards — vocabulary words, legal terms, formulas, or key facts, depending on your
        course. Visible only to your own students.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <TextField select label="Course" required fullWidth defaultValue="" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses?.map((c: any) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        {courseId && (
          <Box component="form" onSubmit={handleSubmit(onCreate)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && <Alert severity="error">{(create.error as any)?.response?.data?.message}</Alert>}
            <TextField select label="Subject (optional)" fullWidth defaultValue="" {...register("subjectId")}>
              <MenuItem value="">No specific subject</MenuItem>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Term" required fullWidth {...register("term", { required: true })} error={!!formState.errors.term} />
            <TextField label="Definition / Explanation" required fullWidth multiline rows={2} {...register("definition", { required: true })} error={!!formState.errors.definition} />
            <TextField label="Example (optional)" fullWidth {...register("example")} />
            <TextField select label="Difficulty" fullWidth defaultValue="MEDIUM" {...register("difficulty")}>
              <MenuItem value="EASY">Easy</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HARD">Hard</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={create.isPending} sx={{ alignSelf: "flex-start" }}>
              {create.isPending ? "Adding..." : "Add Flashcard"}
            </Button>
          </Box>
        )}
      </Box>

      {courseId && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Your Flashcards
            </Typography>
            <TextField select label="Subject" size="small" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">All Subjects</MenuItem>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {isLoading && <Typography variant="body2">Loading...</Typography>}
            {cards?.map((c) => (
              <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, border: "1px solid #E5E7EB", borderRadius: 1.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {c.term}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.definition}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => remove.mutate(c.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {cards?.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                No flashcards yet.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

function McqTab() {
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const { register, handleSubmit, watch, control, reset, formState } = useForm<McqFormValues & { passageText?: string }>({
    defaultValues: { isFreeDemo: false, correctOption: "A", answerType: "MCQ" },
  });
  const selectedCourseId = watch("courseId");
  const selectedSubjectId = watch("subjectId");
  const selectedAnswerType = watch("answerType");
  const watchedQuestionText = watch("question") ?? "";
  const detectedBlankCount = (watchedQuestionText.match(/\{\{\d+\}\}/g) ?? []).length;
  const { data: subjects } = useInstitutionSubjects(selectedCourseId);
  const [successMsg, setSuccessMsg] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const selectedCourseName = courses?.find((c: any) => c.id === selectedCourseId)?.name ?? "";
  const isLawCourse = selectedCourseName.toLowerCase().includes("law");
  const isLoksewaCourse = selectedCourseName.toLowerCase().includes("loksewa");

  const selectedSubject = subjects?.find((s) => s.id === selectedSubjectId);
  const subjectNameLower = selectedSubject?.name.toLowerCase() ?? "";
  const isWriting = subjectNameLower.includes("writing");
  const isListening = subjectNameLower.includes("listening");
  const isReading = subjectNameLower.includes("reading");
  const isSpeaking = subjectNameLower.includes("speaking");

  const create = useMutation({
    mutationFn: (values: McqFormValues & { passageText?: string; audioFile?: File | null }) => {
      // Reading passages are prepended to the question text using the same
      // convention the student-facing pages already know how to split back
      // out into a dedicated reference panel — see splitPassage() in
      // McqPracticePage.tsx on the student side.
      const question =
        isReading && values.passageText
          ? `Reading Passage: "${values.passageText}"\n\n${values.question}`
          : values.question;
      return institutionMcqApi.create({
        ...values,
        question,
        sectionType: isListening ? "LISTENING" : isReading ? "READING" : undefined,
      });
    },
    onSuccess: () => {
      setSuccessMsg("Question added — visible to your own students only.");
      reset({ isFreeDemo: false, correctOption: "A", answerType: "MCQ", courseId: selectedCourseId });
      setAudioFile(null);
      qc.invalidateQueries({ queryKey: ["institution-mcq-list"] });
    },
  });

  const qc = useQueryClient();
  const [listSubjectFilter, setListSubjectFilter] = useState("");
  const { data: questionList } = useQuery({
    queryKey: ["institution-mcq-list", selectedCourseId],
    queryFn: () => institutionMcqApi.list(selectedCourseId),
    enabled: !!selectedCourseId,
  });
  const filteredQuestionList = questionList?.filter((q: any) => !listSubjectFilter || q.subjectId === listSubjectFilter);
  const groupedQuestionsBySubject = filteredQuestionList?.reduce((acc: Record<string, { name: string; items: any[] }>, q: any) => {
    const key = q.subjectId;
    const name = subjects?.find((s) => s.id === q.subjectId)?.name ?? "No Subject";
    if (!acc[key]) acc[key] = { name, items: [] };
    acc[key].items.push(q);
    return acc;
  }, {});
  const institutionSubjectGroups = groupedQuestionsBySubject
    ? Object.values(groupedQuestionsBySubject).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const removeQuestion = useMutation({
    mutationFn: (id: string) => institutionMcqApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institution-mcq-list"] }),
  });

  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const editForm = useForm<{
    question: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctOption?: string;
    correctAnswerText?: string;
    isFreeDemo: boolean;
  }>();
  const updateQuestion = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => institutionMcqApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["institution-mcq-list"] });
      setEditingQuestion(null);
    },
  });

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    editForm.reset({
      question: q.question,
      optionA: q.optionA ?? "",
      optionB: q.optionB ?? "",
      optionC: q.optionC ?? "",
      optionD: q.optionD ?? "",
      correctOption: q.correctOption ?? "A",
      correctAnswerText: q.correctAnswerText ?? "",
      isFreeDemo: q.isFreeDemo,
    });
  };

  return (
    <>
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {create.isError && <Alert severity="error" sx={{ mb: 2 }}>{(create.error as any)?.response?.data?.message || "Failed to add question"}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField select label="Course" required fullWidth defaultValue="" {...register("courseId", { required: true })}>
          {courses?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select label="Subject" required fullWidth disabled={!selectedCourseId} defaultValue="" {...register("subjectId", { required: true })}>
          {subjects?.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>

        {isLawCourse && (
          <TextField select label="Exam Track (optional)" fullWidth defaultValue="" {...register("examType")}>
            <MenuItem value="">General / Not specific</MenuItem>
            <MenuItem value="LLB">LLB</MenuItem>
            <MenuItem value="BALLB">BALLB</MenuItem>
            <MenuItem value="BAR_COUNCIL">Bar Council</MenuItem>
            <MenuItem value="JUDICIAL_SERVICE">Judicial Service</MenuItem>
            <MenuItem value="PUBLIC_SERVICE_COMMISSION">Public Service Commission (Law)</MenuItem>
          </TextField>
        )}

        {isLoksewaCourse && (
          <TextField select label="Position Level (optional)" fullWidth defaultValue="" {...register("examType")}>
            <MenuItem value="">General / All levels</MenuItem>
            <MenuItem value="KHARIDAR">Kharidar (Non-Gazetted 3rd Class)</MenuItem>
            <MenuItem value="NAYAB_SUBBA">Nayab Subba (Non-Gazetted 1st Class)</MenuItem>
            <MenuItem value="SECTION_OFFICER">Section Officer / Sakha Adhikrit (Gazetted 3rd Class)</MenuItem>
          </TextField>
        )}

        {isWriting ? (
          <Alert severity="info">
            Writing is an essay task, not a multiple-choice question — switch to the <strong>Notes</strong> tab
            above and publish your writing prompt there instead.
          </Alert>
        ) : isSpeaking ? (
          <Alert severity="info">
            Speaking is practiced live, not through multiple-choice questions — schedule a{" "}
            <strong>Live Class</strong> for Speaking practice instead.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit((v) => create.mutate({ ...v, audioFile }))} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Students will hear this exact clip when practicing — record or download the audio first, then
                  upload it here (MP3, M4A, WAV, or OGG, up to 30MB).
                </Typography>
                {!audioFile && (
                  <TextField
                    label="Or paste an Audio URL instead"
                    fullWidth
                    sx={{ mt: 1.5 }}
                    placeholder="https://... (if you'd rather link to an already-hosted file)"
                    {...register("audioUrl")}
                  />
                )}
              </Box>
            )}
            {isReading && (
              <TextField
                label="Reading Passage"
                required
                fullWidth
                multiline
                rows={6}
                placeholder="Paste the passage students will read before answering"
                {...register("passageText", { required: isReading })}
              />
            )}
            <TextField
              label={selectedAnswerType === "MULTI_BLANK" ? "Passage / Form / Table Text (use {{1}}, {{2}}, {{3}}... for each blank)" : "Question"}
              required
              fullWidth
              multiline
              rows={selectedAnswerType === "MULTI_BLANK" ? 5 : 2}
              placeholder={
                selectedAnswerType === "MULTI_BLANK"
                  ? 'e.g. "The library opens at {{1}} on weekdays and closes at {{2}}. Students need a valid {{3}} to borrow books."'
                  : undefined
              }
              {...register("question", { required: true })}
              error={!!formState.errors.question}
            />

            <TextField select label="Answer Type" required fullWidth defaultValue="MCQ" {...register("answerType")}>
              <MenuItem value="MCQ">Multiple Choice (4 options)</MenuItem>
              {isReading && <MenuItem value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</MenuItem>}
              {isReading && <MenuItem value="YES_NO_NOT_GIVEN">Yes / No / Not Given</MenuItem>}
              <MenuItem value="FILL_BLANK">Fill in the Blank</MenuItem>
              <MenuItem value="SHORT_ANSWER">Short Answer</MenuItem>
              <MenuItem value="MULTI_BLANK">Form/Note/Table/Summary Completion (multiple blanks)</MenuItem>
            </TextField>

            {selectedAnswerType === "MULTI_BLANK" && (
              <Alert severity="info" sx={{ fontSize: 13 }}>
                One shared passage/form/table with several numbered blanks — useful for anything from an IELTS
                listening form to a legal definition with key terms missing. Type <strong>{"{{1}}"}</strong>,{" "}
                <strong>{"{{2}}"}</strong>, etc. where each blank goes in the text above — a box for each blank's
                answer will appear below automatically.
              </Alert>
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
                <TextField select label="Correct Option" required fullWidth defaultValue="A" {...register("correctOption", { required: true })}>
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                </TextField>
              </>
            )}

            {(selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" || selectedAnswerType === "YES_NO_NOT_GIVEN") && (
              <TextField select label="Correct Answer" required fullWidth defaultValue="A" {...register("correctOption", { required: true })}>
                <MenuItem value="A">{selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" ? "True" : "Yes"}</MenuItem>
                <MenuItem value="B">{selectedAnswerType === "TRUE_FALSE_NOT_GIVEN" ? "False" : "No"}</MenuItem>
                <MenuItem value="C">Not Given</MenuItem>
              </TextField>
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

            <TextField label="Explanation (optional)" fullWidth multiline rows={2} {...register("explanation")} />
            <Controller
              name="isFreeDemo"
              control={control}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Free Demo — visible to students without a subscription" />
              )}
            />
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Adding..." : "Add Question"}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>

    {selectedCourseId && (
      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2, mt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Your Questions
          </Typography>
          <TextField select label="Subject" size="small" value={listSubjectFilter} onChange={(e) => setListSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Subjects</MenuItem>
            {subjects?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell align="center">Free Demo</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {institutionSubjectGroups.map((group) => (
                <React.Fragment key={group.name}>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ bgcolor: "#F3F4F6", py: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        {group.name} ({group.items.length})
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {group.items.map((q: any) => (
                    <TableRow key={q.id} hover>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <Typography
                          variant="body2"
                          sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", cursor: "pointer" }}
                          onClick={() => openEditQuestion(q)}
                          title="Click to view/edit full question"
                        >
                          {q.question}
                        </Typography>
                      </TableCell>
                      <TableCell>{subjects?.find((s) => s.id === q.subjectId)?.name}</TableCell>
                      <TableCell align="center">{q.isFreeDemo ? "Yes" : "No"}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEditQuestion(q)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeQuestion.mutate(q.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {filteredQuestionList?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No questions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )}

    <Dialog open={!!editingQuestion} onClose={() => setEditingQuestion(null)} fullWidth maxWidth="sm">
      <DialogTitle>Edit Question</DialogTitle>
      <Box
        component="form"
        onSubmit={editForm.handleSubmit((values) => {
          if (!editingQuestion) return;
          updateQuestion.mutate({ id: editingQuestion.id, payload: values });
        })}
      >
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Question" required fullWidth multiline rows={4} {...editForm.register("question", { required: true })} />
          {editingQuestion?.answerType === "MCQ" && (
            <>
              <TextField label="Option A" fullWidth {...editForm.register("optionA")} />
              <TextField label="Option B" fullWidth {...editForm.register("optionB")} />
              <TextField label="Option C" fullWidth {...editForm.register("optionC")} />
              <TextField label="Option D" fullWidth {...editForm.register("optionD")} />
              <TextField select label="Correct Option" fullWidth {...editForm.register("correctOption")}>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
              </TextField>
            </>
          )}
          {(editingQuestion?.answerType === "FILL_BLANK" || editingQuestion?.answerType === "SHORT_ANSWER") && (
            <TextField label="Correct Answer" fullWidth {...editForm.register("correctAnswerText")} />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditingQuestion(null)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={updateQuestion.isPending}>
            {updateQuestion.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
    </>
  );
}

function NotifyStudentsCard() {
  const { user } = useAuthStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);
  const notify = useNotifyMyStudents();

  const handleSend = () => {
    if (!user?.lawFirmId || !title.trim() || !body.trim()) return;
    notify.mutate(
      { title: title.trim(), body: body.trim(), lawFirmId: user.lawFirmId },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setExpanded(false);
        },
      }
    );
  };

  if (!expanded) {
    return (
      <Button variant="outlined" size="small" onClick={() => setExpanded(true)} sx={{ mb: 3 }}>
        Notify My Students
      </Button>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Notify My Students
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        Sends an in-app (and push, if enabled) notification to every student currently enrolled with your
        institution. Use this after adding a batch of questions or notes, rather than for every single item.
      </Typography>
      {notify.isSuccess && (
        <Alert severity="success" sx={{ mb: 1.5 }}>
          Sent!
        </Alert>
      )}
      {notify.isError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {(notify.error as any)?.response?.data?.message || "Failed to send"}
        </Alert>
      )}
      <TextField label="Title" size="small" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 1.5 }} />
      <TextField label="Message" size="small" fullWidth multiline rows={2} value={body} onChange={(e) => setBody(e.target.value)} sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" size="small" onClick={handleSend} disabled={notify.isPending || !title.trim() || !body.trim()}>
          {notify.isPending ? "Sending..." : "Send"}
        </Button>
        <Button size="small" onClick={() => setExpanded(false)}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}

export function ResourcesPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Resources
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Publish your own notes and questions — visible only to your own students, even for the same course.
      </Typography>

      <NotifyStudentsCard />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Notes" />
        <Tab label="Questions" />
        <Tab label="Flashcards" />
      </Tabs>

      {tab === 0 ? <NotesTab /> : tab === 1 ? <McqTab /> : <FlashcardTab />}
    </Box>
  );
}
