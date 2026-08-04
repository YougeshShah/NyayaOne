import { useState } from "react";
import {
  Alert,
  Autocomplete,
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
  Switch,
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
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";
import { useForm, Controller } from "react-hook-form";
import { useLibraryResources, useLibraryActions } from "../../hooks/useLibrary";
import { LibraryResourceFormValues } from "../../api/library.api";
import { LibraryResourceType } from "../../types/library.types";
import { useTranslation } from "../../i18n/LanguageContext";
import { getGroupedTypeOptions, getLibraryTypeLabel } from "../../i18n/libraryTaxonomy";

const RESOURCE_TYPES: LibraryResourceType[] = [
  "CONSTITUTION",
  "ACT",
  "ORDINANCE",
  "REGULATION",
  "RULE",
  "FORMATION_ORDER",
  "POLICY",
  "INTERNATIONAL_TREATY",
  "HISTORICAL_DOCUMENT",
  "ANNUAL_REPORT",
  "RTI_DISCLOSURE",
  "CIRCULAR",
  "GOVERNMENT_NOTICE",
  "GAZETTE",
  "SUPREME_COURT_DECISION",
  "HIGH_COURT_DECISION",
  "ARTICLE",
  "RESEARCH_PAPER",
  "JOURNAL",
  "TEMPLATE",
  "LEGAL_FORM",
];

// Common subcategory labels seen on Nepal Law Commission's own site —
// offered as suggestions for the free-text "category" field, not enforced.
const SUGGESTED_CATEGORIES = ["हालसालैका ऐन", "खण्ड अनुसार", "खण्ड बाहेकका ऐन", "वर्णानुक्रम अनुसारको सूची"];

export function LibraryPage() {
  const { t, language } = useTranslation();
  const groupedTypeOptions = getGroupedTypeOptions(language);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<import("../../types/library.types").LibraryResource | null>(null);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLibraryResources({
    type: type === "ALL" ? undefined : type,
    search: search || undefined,
    page: 1,
    limit: 50,
  } as any);
  const { create, update, remove } = useLibraryActions();

  const { register, handleSubmit, reset, control, formState } = useForm<LibraryResourceFormValues>({
    defaultValues: { isDownloadable: true },
  });

  const openCreateDialog = () => {
    setEditingResource(null);
    reset({ title: "", type: "ACT", category: "", actName: "", section: "", chapter: "", keywords: "", content: "", isDownloadable: true, file: null });
    setDialogOpen(true);
  };

  const openEditDialog = (r: import("../../types/library.types").LibraryResource) => {
    setEditingResource(r);
    reset({
      title: r.title,
      type: r.type,
      category: r.category || "",
      isRepealed: r.isRepealed,
      actName: r.actName || "",
      section: r.section || "",
      chapter: r.chapter || "",
      keywords: r.keywords.join(", "),
      content: r.content || "",
      isDownloadable: r.isDownloadable,
      file: null,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: LibraryResourceFormValues) => {
    if (editingResource) {
      update.mutate(
        { id: editingResource.id, values },
        {
          onSuccess: () => {
            reset({ isDownloadable: true });
            setDialogOpen(false);
          },
        }
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          reset({ isDownloadable: true });
          setDialogOpen(false);
        },
      });
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Legal Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} resources published
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          {t("publishResource")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={["ALL", ...groupedTypeOptions.map((o) => o.type)]}
          groupBy={(opt) => (opt === "ALL" ? "" : groupedTypeOptions.find((o) => o.type === opt)?.group || "")}
          getOptionLabel={(opt) => (opt === "ALL" ? t("allTypes") : getLibraryTypeLabel(opt as any, language))}
          value={type}
          onChange={(_, val) => setType(val || "ALL")}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("type")} />}
        />
        <TextField label="Search title, act name, or keyword" size="small" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("title")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell>{t("category")}</TableCell>
              <TableCell align="center">{t("downloadable")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
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
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No resources published yet
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={getLibraryTypeLabel(r.type, language)} variant="outlined" />
                </TableCell>
                <TableCell>{r.category || "—"}</TableCell>
                <TableCell align="center">{r.isDownloadable ? t("yes") : t("no")}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditDialog(r)} sx={{ mr: 1 }}>
                    {t("edit")}
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => remove.mutate(r.id)}>
                    {t("delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingResource ? t("editResource") : t("publishResource")}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label={t("title")} required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <Controller
              name="type"
              control={control}
              defaultValue="ACT"
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={groupedTypeOptions.map((o) => o.type)}
                  groupBy={(opt) => groupedTypeOptions.find((o) => o.type === opt)?.group || ""}
                  getOptionLabel={(opt) => getLibraryTypeLabel(opt as any, language)}
                  value={field.value || "ACT"}
                  onChange={(_, val) => field.onChange(val)}
                  renderInput={(params) => <TextField {...params} label={t("type")} required error={!!formState.errors.type} />}
                />
              )}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={t("category")}
                fullWidth
                {...register("category")}
                helperText={`Suggestions: ${SUGGESTED_CATEGORIES.join(", ")}`}
              />
              <TextField label="Act Name" fullWidth {...register("actName")} />
            </Box>
            <FormControlLabel
              control={<Checkbox {...register("isRepealed")} />}
              label="Repealed (खारेज भएको) — this law/document is no longer in force"
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Section" fullWidth {...register("section")} />
              <TextField label="Chapter" fullWidth {...register("chapter")} />
            </Box>
            <TextField label="Keywords (comma-separated)" fullWidth {...register("keywords")} />
            <TextField label="Content (for articles/text resources)" fullWidth multiline rows={3} {...register("content")} />

            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Box>
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                    {value ? (value as File).name : "Attach File (PDF/DOCX — optional)"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => onChange(e.target.files?.[0] || null)}
                    />
                  </Button>
                </Box>
              )}
            />

            <FormControlLabel control={<Switch defaultChecked {...register("isDownloadable")} />} label="Allow download" />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? t("saving") : editingResource ? t("saveChanges") : t("publishResource")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
