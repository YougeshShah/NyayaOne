import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
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
  Chip,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm } from "react-hook-form";
import { speakingPromptApi, SpeakingPromptAdmin, SpeakingPromptPayload } from "../../api/speakingPrompt.api";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";

export function SpeakingPromptAdminPage() {
  const [courseId, setCourseId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SpeakingPromptAdmin | null>(null);
  const qc = useQueryClient();

  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["speaking-prompts", courseId],
    queryFn: () => speakingPromptApi.list(courseId),
    enabled: !!courseId,
  });

  const { register, handleSubmit, reset, formState } = useForm<SpeakingPromptPayload>();

  const create = useMutation({
    mutationFn: (payload: SpeakingPromptPayload) => speakingPromptApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["speaking-prompts", courseId] });
      setDialogOpen(false);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SpeakingPromptPayload> }) => speakingPromptApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["speaking-prompts", courseId] });
      setDialogOpen(false);
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => speakingPromptApi.update(id, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["speaking-prompts", courseId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => speakingPromptApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["speaking-prompts", courseId] }),
  });

  const openCreate = () => {
    setEditingPrompt(null);
    reset({ courseId, part: 1, title: "", promptText: "", prepTimeSeconds: undefined, speakTimeSeconds: 60 });
    setDialogOpen(true);
  };

  const openEdit = (p: SpeakingPromptAdmin) => {
    setEditingPrompt(p);
    reset({
      courseId: p.courseId,
      part: p.part,
      title: p.title,
      promptText: p.promptText,
      prepTimeSeconds: p.prepTimeSeconds ?? undefined,
      speakTimeSeconds: p.speakTimeSeconds,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: SpeakingPromptPayload) => {
    if (editingPrompt) {
      update.mutate({ id: editingPrompt.id, payload: values });
    } else {
      create.mutate(values);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Speaking Prompts
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!courseId}>
          Add Prompt
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
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Part</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Prep / Speak Time</TableCell>
                <TableCell>Published</TableCell>
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
              {!isLoading && prompts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No prompts yet for this course.
                  </TableCell>
                </TableRow>
              )}
              {prompts?.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Chip label={`Part ${p.part}`} size="small" />
                  </TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    {p.prepTimeSeconds ? `${p.prepTimeSeconds}s prep + ` : ""}
                    {p.speakTimeSeconds}s speak
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.isPublished}
                      onChange={(e) => togglePublish.mutate({ id: p.id, isPublished: e.target.checked })}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove.mutate(p.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingPrompt ? "Edit Prompt" : "Add Prompt"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Part" required fullWidth defaultValue={1} {...register("part", { required: true, valueAsNumber: true })}>
              <MenuItem value={1}>Part 1 — Introduction</MenuItem>
              <MenuItem value={2}>Part 2 — Cue Card</MenuItem>
              <MenuItem value={3}>Part 3 — Discussion</MenuItem>
            </TextField>
            <TextField label="Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <TextField
              label="Prompt Text"
              required
              fullWidth
              multiline
              rows={4}
              {...register("promptText", { required: true })}
              error={!!formState.errors.promptText}
            />
            <TextField
              label="Prep Time (seconds, optional — for Part 2 cue cards)"
              type="number"
              fullWidth
              {...register("prepTimeSeconds", { valueAsNumber: true })}
            />
            <TextField
              label="Speak Time (seconds)"
              type="number"
              required
              fullWidth
              {...register("speakTimeSeconds", { required: true, valueAsNumber: true })}
              error={!!formState.errors.speakTimeSeconds}
            />
            <input type="hidden" value={courseId} {...register("courseId")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
