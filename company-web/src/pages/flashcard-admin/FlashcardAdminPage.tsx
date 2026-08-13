import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useForm } from "react-hook-form";
import { useCoursesAdmin, useSubjectsAdmin } from "../../hooks/useCourseAdmin";
import { useFlashcardsAdmin, useFlashcardAdminActions } from "../../hooks/useFlashcardAdmin";
import { CreateFlashcardPayload, FlashcardAdmin } from "../../api/flashcardAdmin.api";

export function FlashcardAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const [courseId, setCourseId] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: cards, isLoading } = useFlashcardsAdmin(courseId, subjectFilter || undefined);
  const { create, update, remove } = useFlashcardAdminActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardAdmin | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<CreateFlashcardPayload>({
    defaultValues: { difficulty: "MEDIUM" },
  });

  const openCreate = () => {
    setEditingCard(null);
    reset({ courseId, subjectId: subjectFilter || undefined, difficulty: "MEDIUM", term: "", definition: "", example: "" });
    setDialogOpen(true);
  };

  const openEdit = (card: FlashcardAdmin) => {
    setEditingCard(card);
    reset({
      term: card.term,
      definition: card.definition,
      example: card.example ?? "",
      courseId: card.courseId,
      subjectId: card.subjectId ?? undefined,
      difficulty: card.difficulty,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateFlashcardPayload) => {
    if (editingCard) {
      update.mutate({ id: editingCard.id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const groupedBySubject = cards?.reduce((acc: Record<string, { name: string; items: FlashcardAdmin[] }>, c) => {
    const key = c.subjectId ?? "none";
    const name = subjects?.find((s) => s.id === c.subjectId)?.name ?? "No Subject";
    if (!acc[key]) acc[key] = { name, items: [] };
    acc[key].items.push(c);
    return acc;
  }, {});
  const subjectGroups = groupedBySubject ? Object.values(groupedBySubject).sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Flashcards
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!courseId}>
          Add Flashcard
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        A generic term/definition reference card — vocabulary for IELTS, legal terms for Law, formulas or key facts
        for IOE/Medical/Loksewa. The label shown to students adapts to the course automatically.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Course" size="small" value={courseId} onChange={(e) => { setCourseId(e.target.value); setSubjectFilter(""); }} sx={{ minWidth: 220 }}>
          <MenuItem value="">Select a course</MenuItem>
          {courses?.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        {courseId && (
          <TextField select label="Subject" size="small" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Subjects</MenuItem>
            {subjects?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      {courseId && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Term</TableCell>
                <TableCell>Definition</TableCell>
                <TableCell align="center">Difficulty</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {subjectGroups.map((group) => (
                <React.Fragment key={group.name}>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ bgcolor: "#F3F4F6", py: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        {group.name} ({group.items.length})
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {group.items.map((card) => (
                    <TableRow key={card.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{card.term}</TableCell>
                      <TableCell sx={{ maxWidth: 380 }}>
                        <Typography variant="body2" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {card.definition}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={card.difficulty} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(card)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => remove.mutate(card.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              {cards?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No flashcards yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCard ? "Edit Flashcard" : "Add Flashcard"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && <Typography color="error" variant="body2">{(create.error as any)?.response?.data?.message}</Typography>}
            <TextField select label="Course" required fullWidth defaultValue={courseId} {...register("courseId", { required: true })}>
              {courses?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Subject (optional)" fullWidth defaultValue="" {...register("subjectId")}>
              <MenuItem value="">No specific subject</MenuItem>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Term"
              required
              fullWidth
              placeholder='e.g. Ubiquitous / Habeas Corpus / Newtons Second Law'
              {...register("term", { required: true })}
              error={!!formState.errors.term}
            />
            <TextField
              label="Definition / Explanation"
              required
              fullWidth
              multiline
              rows={3}
              {...register("definition", { required: true })}
              error={!!formState.errors.definition}
            />
            <TextField label="Example (optional)" fullWidth multiline rows={2} {...register("example")} />
            <TextField select label="Difficulty" fullWidth defaultValue="MEDIUM" {...register("difficulty")}>
              <MenuItem value="EASY">Easy</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HARD">Hard</MenuItem>
            </TextField>
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
