import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentNoteApi, StudentNote } from "../../api/studentNote.api";

export function MyNotesPage() {
  const queryClient = useQueryClient();
  const { data: notes, isLoading } = useQuery({ queryKey: ["my-notes"], queryFn: () => studentNoteApi.list() });

  const [editing, setEditing] = useState<StudentNote | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleting, setDeleting] = useState<StudentNote | null>(null);

  const openNew = () => {
    setEditing("new");
    setTitle("");
    setContent("");
  };
  const openEdit = (note: StudentNote) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const save = useMutation({
    mutationFn: () =>
      editing === "new"
        ? studentNoteApi.create(title, content)
        : studentNoteApi.update((editing as StudentNote).id, title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: () => studentNoteApi.remove(deleting!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      setDeleting(null);
    },
  });

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          My Notes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          New Note
        </Button>
      </Box>

      {!isLoading && (notes ?? []).length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No notes yet. Create one to start jotting down what you're studying.
        </Typography>
      )}

      {(notes ?? []).map((n) => (
        <Paper key={n.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {n.title}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                {n.content}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Updated {new Date(n.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => openEdit(n)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleting(n)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ))}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing === "new" ? "New Note" : "Edit Note"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => save.mutate()} disabled={!title || !content || save.isPending}>
            {save.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Delete "{deleting?.title}"? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => remove.mutate()} disabled={remove.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
