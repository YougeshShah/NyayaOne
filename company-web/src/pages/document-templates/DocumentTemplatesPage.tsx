import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm } from "react-hook-form";
import { useDocumentTemplates, useTemplatePlaceholders, useDocumentTemplateActions } from "../../hooks/useDocumentTemplates";
import { CreateTemplatePayload } from "../../api/documentTemplate.api";
import { DocumentTemplate } from "../../types/documentTemplate.types";

export function DocumentTemplatesPage() {
  const { data: templates } = useDocumentTemplates();
  const { data: placeholders } = useTemplatePlaceholders();
  const { create, update } = useDocumentTemplateActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<CreateTemplatePayload>();

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", category: "", description: "", bodyTemplate: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: DocumentTemplate) => {
    setEditing(t);
    reset({ title: t.title, category: t.category || "", description: t.description || "", bodyTemplate: t.bodyTemplate });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateTemplatePayload) => {
    if (editing) {
      update.mutate({ id: editing.id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(values, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Document Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lawyers use these to auto-fill common documents with case/client data — no retyping.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Template
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No templates yet
                </TableCell>
              </TableRow>
            )}
            {templates?.items.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.category || "—"}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? "Edit Template" : "New Document Template"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <TextField label="Category" fullWidth {...register("category")} placeholder="e.g. Family Law, Property" />
            <TextField label="Description" fullWidth {...register("description")} />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Available placeholders — click to insert is not automatic, just type these directly into the body:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {placeholders?.map((p) => (
                  <Chip key={p} label={p} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>

            <TextField
              label="Template Body"
              required
              fullWidth
              multiline
              rows={12}
              {...register("bodyTemplate", { required: true })}
              error={!!formState.errors.bodyTemplate}
              placeholder={`To,\nThe Registrar,\n{{courtName}}\n\nI, {{clientName}}, residing at {{clientAddress}}...`}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? "Saving..." : editing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
