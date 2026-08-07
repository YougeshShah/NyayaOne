import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { apiClient } from "../../api/client";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";
import { institutionLibraryApi } from "../../api/institutionLibrary.api";
import { institutionMcqApi } from "../../api/institutionMcq.api";

interface Subject {
  id: string;
  name: string;
}

interface NoteFormValues {
  title: string;
  courseId: string;
  subjectId: string;
  content: string;
  isFreeDemo: boolean;
}

interface McqFormValues {
  question: string;
  courseId: string;
  subjectId: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string;
  isFreeDemo: boolean;
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
  const { data: subjects } = useInstitutionSubjects(selectedCourseId);
  const [successMsg, setSuccessMsg] = useState("");

  const create = useMutation({
    mutationFn: (values: NoteFormValues) => institutionLibraryApi.create(values),
    onSuccess: () => {
      setSuccessMsg("Published — visible to your own students only.");
      reset({ isFreeDemo: false });
    },
  });

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {create.isError && <Alert severity="error" sx={{ mb: 2 }}>{(create.error as any)?.response?.data?.message || "Failed to publish"}</Alert>}

      <Box component="form" onSubmit={handleSubmit((v) => create.mutate(v))} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
        <TextField select label="Course" required fullWidth defaultValue="" {...register("courseId", { required: true })}>
          {courses?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select label="Subject" required fullWidth disabled={!selectedCourseId} defaultValue="" {...register("subjectId", { required: true })}>
          {subjects?.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
        <TextField label="Content" required fullWidth multiline rows={8} placeholder="Write your notes here..." {...register("content", { required: true })} error={!!formState.errors.content} />
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

function McqTab() {
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });
  const { register, handleSubmit, watch, control, reset, formState } = useForm<McqFormValues>({ defaultValues: { isFreeDemo: false, correctOption: "A" } });
  const selectedCourseId = watch("courseId");
  const { data: subjects } = useInstitutionSubjects(selectedCourseId);
  const [successMsg, setSuccessMsg] = useState("");

  const create = useMutation({
    mutationFn: (values: McqFormValues) => institutionMcqApi.create(values),
    onSuccess: () => {
      setSuccessMsg("Question added — visible to your own students only.");
      reset({ isFreeDemo: false, correctOption: "A", courseId: selectedCourseId });
    },
  });

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 2 }}>
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
      {create.isError && <Alert severity="error" sx={{ mb: 2 }}>{(create.error as any)?.response?.data?.message || "Failed to add question"}</Alert>}

      <Box component="form" onSubmit={handleSubmit((v) => create.mutate(v))} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Question" required fullWidth multiline rows={2} {...register("question", { required: true })} error={!!formState.errors.question} />
        <TextField select label="Course" required fullWidth defaultValue="" {...register("courseId", { required: true })}>
          {courses?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select label="Subject" required fullWidth disabled={!selectedCourseId} defaultValue="" {...register("subjectId", { required: true })}>
          {subjects?.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Notes" />
        <Tab label="Questions" />
      </Tabs>

      {tab === 0 ? <NotesTab /> : <McqTab />}
    </Box>
  );
}
