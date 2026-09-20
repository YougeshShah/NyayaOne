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
  CircularProgress,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useDocumentTemplates, useDocumentTemplateDetail, useGenerateDocument } from "../../hooks/useDocumentTemplates";
import { InlineDocumentFillForm } from "./InlineDocumentFillForm";

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    templates?.items.forEach((t) => set.add(t.category || OTHER_CATEGORY));
    return Array.from(set).sort((a, b) => (a === OTHER_CATEGORY ? 1 : b === OTHER_CATEGORY ? -1 : a.localeCompare(b)));
  }, [templates]);

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

  const handleGenerate = () => {
    if (!templateId) return;
    generateDoc.mutate({ templateId, caseId, values, clientId }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
            {manualFields.length === 0 && (template.fields?.length ?? 0) > 0 && (
              <Typography variant="body2" color="text.secondary">
                Every field on this document fills automatically — nothing else to type.
              </Typography>
            )}

            {/* The document itself, with fillable inputs sitting exactly
                where each blank was in the original form -- instead of a
                separate list of fields disconnected from their context,
                a lawyer sees the actual sentence around each blank while
                typing, the same way they'd fill a paper form. */}
            <InlineDocumentFillForm
              bodyTemplate={template.bodyTemplate}
              fields={template.fields ?? []}
              values={values}
              onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
            />
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
