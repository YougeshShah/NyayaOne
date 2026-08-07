import { useState } from "react";
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
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm } from "react-hook-form";
import { useCoursesAdmin, useSubjectsAdmin, useMcqAdminList, useMcqAdminActions } from "../../hooks/useCourseAdmin";
import { CreateMcqPayload, McqQuestionAdmin } from "../../api/mcqAdmin.api";

export function McqAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const [courseId, setCourseId] = useState<string>("");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: mcqData, isLoading } = useMcqAdminList({ courseId: courseId || undefined });
  const { create, update, remove } = useMcqAdminActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<McqQuestionAdmin | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<CreateMcqPayload>({
    defaultValues: { difficulty: "MEDIUM", isFreeDemo: false },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ courseId, difficulty: "MEDIUM", isFreeDemo: false, correctOption: "A" });
    setDialogOpen(true);
  };

  const openEdit = (q: McqQuestionAdmin) => {
    setEditing(q);
    reset({ ...q, explanation: q.explanation ?? undefined, examType: q.examType ?? undefined });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateMcqPayload) => {
    if (editing) {
      update.mutate(
        { id: editing.id, payload: values },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          reset({ courseId, difficulty: "MEDIUM", isFreeDemo: false, correctOption: "A" });
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
              {mcqData?.items.map((q) => (
                <TableRow key={q.id} hover>
                  <TableCell sx={{ maxWidth: 400 }}>{q.question}</TableCell>
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
              {mcqData?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No questions yet for this course.
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
            <TextField label="Question" required fullWidth multiline rows={2} {...register("question", { required: true })} error={!!formState.errors.question} />

            <TextField select label="Subject" required fullWidth {...register("subjectId", { required: true })} error={!!formState.errors.subjectId}>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Option A" required fullWidth {...register("optionA", { required: true })} />
              <TextField label="Option B" required fullWidth {...register("optionB", { required: true })} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Option C" required fullWidth {...register("optionC", { required: true })} />
              <TextField label="Option D" required fullWidth {...register("optionD", { required: true })} />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField select label="Correct Option" required fullWidth defaultValue="A" {...register("correctOption", { required: true })}>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
              </TextField>
              <TextField select label="Difficulty" required fullWidth defaultValue="MEDIUM" {...register("difficulty")}>
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </TextField>
            </Box>

            <TextField label="Explanation (shown after answering)" fullWidth multiline rows={2} {...register("explanation")} />

            <FormControlLabel
              control={<Checkbox {...register("isFreeDemo")} />}
              label="Free Demo — students without a subscription can see this"
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
