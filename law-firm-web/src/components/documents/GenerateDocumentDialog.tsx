import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useDocumentTemplates, useDocumentTemplateDetail, useGenerateDocument } from "../../hooks/useDocumentTemplates";

interface GenerateDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  clientId?: string;
}

const OTHER_CATEGORY = "अन्य";

export function GenerateDocumentDialog({ open, onClose, caseId, clientId }: GenerateDocumentDialogProps) {
  const { data: templates } = useDocumentTemplates();
  const [category, setCategory] = useState("");
  const [templateId, setTemplateId] = useState("");
  const { data: template, isLoading: loadingTemplate } = useDocumentTemplateDetail(templateId || undefined);
  const generateDoc = useGenerateDocument();

  const [values, setValues] = useState<Record<string, string>>({});

  // Step 1 options: distinct categories (court/tribunal), sorted, "अन्य" last for uncategorized
  const categories = useMemo(() => {
    const set = new Set<string>();
    templates?.items.forEach((t) => set.add(t.category || OTHER_CATEGORY));
    return Array.from(set).sort((a, b) => (a === OTHER_CATEGORY ? 1 : b === OTHER_CATEGORY ? -1 : a.localeCompare(b)));
  }, [templates]);

  // Step 2 options: documents within the chosen category only
  const documentsInCategory = useMemo(() => {
    if (!category) return [];
    return (templates?.items ?? [])
      .filter((t) => (t.category || OTHER_CATEGORY) === category)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [templates, category]);

  useEffect(() => {
    setTemplateId("");
    setValues({});
  }, [category]);

  useEffect(() => {
    setValues({});
  }, [templateId]);

  useEffect(() => {
    if (!open) {
      setCategory("");
      setTemplateId("");
      setValues({});
    }
  }, [open]);

  const manualFields = template?.fields?.filter((f) => !f.autoFillSource) ?? [];
  const autoFields = template?.fields?.filter((f) => f.autoFillSource) ?? [];

  const handleGenerate = () => {
    if (!templateId) return;
    generateDoc.mutate({ templateId, caseId, values, clientId }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate Document</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField select label="Step 1 — Court / Tribunal / Category" fullWidth value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        {category && (
          <TextField
            select
            label="Step 2 — Document"
            fullWidth
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={documentsInCategory.length === 0}
          >
            {documentsInCategory.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.title}
              </MenuItem>
            ))}
          </TextField>
        )}

        {loadingTemplate && <CircularProgress size={24} />}

        {template && !loadingTemplate && (
          <>
            {autoFields.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Filled automatically from this case:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {autoFields.map((f) => (
                    <Chip key={f.key} label={f.label} size="small" color="success" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {manualFields.length === 0 && autoFields.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Every field on this document fills automatically — nothing else to type.
              </Typography>
            )}

            {manualFields.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                required={field.required}
                fullWidth
                multiline={field.type === "textarea"}
                rows={field.type === "textarea" ? 3 : undefined}
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                value={values[field.key] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              />
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<DescriptionOutlinedIcon />}
          disabled={!templateId || generateDoc.isPending}
          onClick={handleGenerate}
        >
          {generateDoc.isPending ? "Generating..." : "Generate PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
