import { useState } from "react";
import {
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
import {
  getGroupedTypeOptions,
  getLibraryTypeLabel,
  LIBRARY_HEADINGS,
  LibraryHeadingKey,
  getTypesForHeading,
  getCategoryOptionsForType,
  getCategoryDisplayLabel,
} from "../../i18n/libraryTaxonomy";

export function LibraryPage() {
  const { t, language } = useTranslation();
  const groupedTypeOptions = getGroupedTypeOptions(language);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<import("../../types/library.types").LibraryResource | null>(null);

  // Nested filter: Heading (Level 1) -> Type (Level 2) -> Category (Level 3),
  // mirroring Nepal Law Commission's own site structure end-to-end.
  const [heading, setHeading] = useState<LibraryHeadingKey | "ALL">("ALL");
  const [type, setType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const typesForHeading = heading === "ALL" ? null : getTypesForHeading(heading as LibraryHeadingKey);
  const typeOptions = typesForHeading ?? groupedTypeOptions.map((o) => o.type);
  const categoryOptions = type !== "ALL" ? getCategoryOptionsForType(type as LibraryResourceType, language) : [];
  const isRepealedFilter = heading === "repealed" ? true : undefined;

  const { data, isLoading } = useLibraryResources({
    type: type === "ALL" ? undefined : type,
    category: category === "ALL" ? undefined : category,
    isRepealed: isRepealedFilter,
    search: search || undefined,
    page: 1,
    limit: 50,
  });
  const { create, update, remove } = useLibraryActions();

  const { register, handleSubmit, reset, control, watch, formState } = useForm<LibraryResourceFormValues>({
    defaultValues: { isDownloadable: true },
  });
  const watchedType = watch("type") as LibraryResourceType | undefined;
  const dialogCategorySuggestions = getCategoryOptionsForType(watchedType, language);

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
            {t("legalLibrary")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} {t("resourcesPublishedSuffix")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          {t("publishResource")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {/* Level 1: Heading (मौजुदा कानून / खारेज भएका कानून / विविध / अन्य) */}
        <Autocomplete
          size="small"
          sx={{ minWidth: 220 }}
          options={["ALL", ...LIBRARY_HEADINGS.map((h) => h.key)]}
          getOptionLabel={(opt) =>
            opt === "ALL" ? t("allHeadings") : LIBRARY_HEADINGS.find((h) => h.key === opt)?.label[language] || opt
          }
          value={heading}
          onChange={(_, val) => {
            setHeading((val as LibraryHeadingKey) || "ALL");
            setType("ALL");
            setCategory("ALL");
          }}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("heading")} />}
        />

        {/* Level 2: Type, scoped to the chosen heading */}
        <Autocomplete
          size="small"
          sx={{ minWidth: 220 }}
          options={["ALL", ...typeOptions]}
          groupBy={
            heading === "ALL"
              ? (opt) => (opt === "ALL" ? "" : groupedTypeOptions.find((o) => o.type === opt)?.group || "")
              : undefined
          }
          getOptionLabel={(opt) => (opt === "ALL" ? t("allTypes") : getLibraryTypeLabel(opt as LibraryResourceType, language))}
          value={type}
          onChange={(_, val) => {
            setType((val as string) || "ALL");
            setCategory("ALL");
          }}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("type")} />}
        />

        {/* Level 3: Category (sub-subheading), only meaningful once a type with subcategories is chosen */}
        <Autocomplete
          size="small"
          sx={{ minWidth: 220 }}
          disabled={categoryOptions.length === 0}
          options={["ALL", ...categoryOptions.map((o) => o.value)]}
          getOptionLabel={(opt) => (opt === "ALL" ? t("allCategories") : getCategoryDisplayLabel(opt, language))}
          value={category}
          onChange={(_, val) => setCategory((val as string) || "ALL")}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("category")} />}
        />

        <TextField
          label={t("searchLibraryPlaceholder")}
          size="small"
          fullWidth
          sx={{ minWidth: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                  {t("loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t("noResourcesFound")}
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    <Chip size="small" label={getLibraryTypeLabel(r.type, language)} variant="outlined" />
                    {r.isRepealed && <Chip size="small" color="warning" label={t("repealed")} variant="outlined" />}
                  </Box>
                </TableCell>
                <TableCell>{r.category ? getCategoryDisplayLabel(r.category, language) : "—"}</TableCell>
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
                  getOptionLabel={(opt) => getLibraryTypeLabel(opt as LibraryResourceType, language)}
                  value={field.value || "ACT"}
                  onChange={(_, val) => field.onChange(val)}
                  renderInput={(params) => <TextField {...params} label={t("type")} required error={!!formState.errors.type} />}
                />
              )}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={dialogCategorySuggestions.map((o) => o.value)}
                    getOptionLabel={(opt) => getCategoryDisplayLabel(opt as string, language) || (opt as string)}
                    inputValue={field.value || ""}
                    onInputChange={(_, val) => field.onChange(val)}
                    onChange={(_, val) => field.onChange(val || "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("category")}
                        helperText={dialogCategorySuggestions.length > 0 ? t("categorySuggestionsHelp") : undefined}
                      />
                    )}
                  />
                )}
              />
              <TextField label={t("actName")} fullWidth {...register("actName")} />
            </Box>
            <FormControlLabel control={<Checkbox {...register("isRepealed")} />} label={t("repealedCheckboxLabel")} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label={t("section")} fullWidth {...register("section")} />
              <TextField label={t("chapter")} fullWidth {...register("chapter")} />
            </Box>
            <TextField label={t("keywordsCommaSeparated")} fullWidth {...register("keywords")} />
            <TextField label={t("contentForArticles")} fullWidth multiline rows={3} {...register("content")} />

            <Controller
              name="file"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Box>
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                    {value ? (value as File).name : t("attachFileOptional")}
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

            <FormControlLabel control={<Switch defaultChecked {...register("isDownloadable")} />} label={t("allowDownload")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? t("saving") : editingResource ? t("saveChanges") : t("publishResource")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
