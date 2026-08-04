import { useState } from "react";
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
  Alert,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useDocumentTemplates, useAutofillSources, useDocumentTemplateActions } from "../../hooks/useDocumentTemplates";
import { CreateTemplatePayload } from "../../api/documentTemplate.api";
import { DocumentTemplate, TemplateField, FieldType } from "../../types/documentTemplate.types";

const FIELD_TYPES: FieldType[] = ["text", "textarea", "date", "number"];

function emptyField(): TemplateField {
  return { key: "", label: "", type: "text", required: false };
}

export function DocumentTemplatesPage() {
  const { data: templates } = useDocumentTemplates();
  const { data: autofillSources } = useAutofillSources();
  const { create, update, analyzeSample } = useDocumentTemplateActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([]);

  const [sampleText, setSampleText] = useState("");

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setCategory("");
    setDescription("");
    setBodyTemplate("");
    setFields([]);
    setSampleText("");
    setDialogOpen(true);
  };

  const openEdit = (t: DocumentTemplate) => {
    setEditing(t);
    setTitle(t.title);
    setCategory(t.category || "");
    setDescription(t.description || "");
    setBodyTemplate(t.bodyTemplate);
    setFields(t.fields || []);
    setSampleText("");
    setDialogOpen(true);
  };

  const addField = () => setFields((f) => [...f, emptyField()]);
  const removeField = (idx: number) => setFields((f) => f.filter((_, i) => i !== idx));
  const updateField = (idx: number, patch: Partial<TemplateField>) =>
    setFields((f) => f.map((field, i) => (i === idx ? { ...field, ...patch } : field)));

  const handleAnalyze = () => {
    if (!sampleText.trim()) return;
    analyzeSample.mutate(sampleText, {
      onSuccess: (result) => {
        const newFields: TemplateField[] = result.suggestions.map((s, i) => ({
          key: `field${fields.length + i + 1}`,
          label: s.suggestedLabel || `Field ${fields.length + i + 1}`,
          type: "text",
          required: false,
        }));
        setFields((f) => [...f, ...newFields]);
      },
    });
  };

  const onSubmit = () => {
    const payload: CreateTemplatePayload = { title, category, description, bodyTemplate, fields };
    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
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
            Each template defines its own form — lawyers only see the fields that document actually needs.
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
              <TableCell align="center">Fields</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No templates yet
                </TableCell>
              </TableRow>
            )}
            {templates?.items.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.category || "—"}</TableCell>
                <TableCell align="center">{t.fields?.length ?? 0}</TableCell>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editing ? "Edit Template" : "New Document Template"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Title" required fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Category" fullWidth value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. निवेदन (देवानी)" />
            <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Box>

          <TextField
            label="Template Body"
            required
            fullWidth
            multiline
            rows={8}
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
            helperText="Use {{fieldKey}} anywhere you want a field's value inserted — the key must match a field defined below."
          />

          <Divider sx={{ my: 1 }} />

          {/* SAMPLE ANALYZER */}
          <Box sx={{ bgcolor: "#F9FAFB", p: 2, borderRadius: 1, border: "1px solid #e5e7eb" }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Paste a sample document (optional helper)
            </Typography>
            <Alert severity="info" sx={{ mb: 1.5, fontSize: 12 }}>
              Pattern-based only — finds runs of dots/underscores (".....", "____") and suggests them as fields. It does
              not understand the document; review and rename every suggestion before saving.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Paste the raw sample text here..."
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
            />
            <Button size="small" sx={{ mt: 1 }} onClick={handleAnalyze} disabled={analyzeSample.isPending}>
              {analyzeSample.isPending ? "Analyzing..." : "Analyze & Suggest Fields"}
            </Button>
          </Box>

          {/* FIELD BUILDER */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Form Fields ({fields.length})
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addField}>
                Add Field
              </Button>
            </Box>

            {fields.map((field, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  label="Key ({{key}})"
                  value={field.key}
                  onChange={(e) => updateField(idx, { key: e.target.value.replace(/\s+/g, "") })}
                  sx={{ width: 160 }}
                />
                <TextField
                  size="small"
                  label="Label"
                  value={field.label}
                  onChange={(e) => updateField(idx, { label: e.target.value })}
                  sx={{ width: 220 }}
                />
                <TextField
                  size="small"
                  select
                  label="Type"
                  value={field.type}
                  onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                  sx={{ width: 120 }}
                >
                  {FIELD_TYPES.map((ft) => (
                    <MenuItem key={ft} value={ft}>
                      {ft}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  select
                  label="Auto-fill"
                  value={field.autoFillSource || ""}
                  onChange={(e) => updateField(idx, { autoFillSource: e.target.value || undefined })}
                  sx={{ width: 200 }}
                >
                  <MenuItem value="">— Manual entry —</MenuItem>
                  {autofillSources?.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton size="small" color="error" onClick={() => removeField(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onSubmit} disabled={isSaving || !title || !bodyTemplate}>
            {isSaving ? "Saving..." : editing ? "Save Changes" : "Create Template"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
