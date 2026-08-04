import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import { useForm } from "react-hook-form";
import { useCourts, useCourtActions, useCourtProvinces, useCourtTypes } from "../../hooks/useCourts";
import { Court, CreateCourtPayload } from "../../types/court.types";
import { getCourtTypeLabel, getProvinceLabel, getCourtTypeGroup } from "../../i18n/courtLabels";
import { useTranslation } from "../../i18n/LanguageContext";

export function CourtsPage() {
  const { t, language } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [province, setProvince] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCourts({
    page: 1,
    limit: 200,
    province: province === "ALL" ? undefined : province,
    type: type === "ALL" ? undefined : type,
    search: search || undefined,
  });
  const { data: provinces } = useCourtProvinces();
  const { data: types } = useCourtTypes();
  const { create, update, deactivate, activate } = useCourtActions();

  const { register, handleSubmit, reset, formState } = useForm<CreateCourtPayload>();

  const openCreateDialog = () => {
    setEditingCourt(null);
    reset({ name: "", nepaliName: "", type: "", province: "", location: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (court: Court) => {
    setEditingCourt(court);
    reset({ name: court.name, nepaliName: court.nepaliName || "", type: court.type, province: court.province || "", location: court.location || "" });
    setDialogOpen(true);
  };

  const onSubmit = (values: CreateCourtPayload) => {
    if (editingCourt) {
      update.mutate({ id: editingCourt.id, payload: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(values, {
        onSuccess: () => {
          reset();
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
            {t("courtManagement")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} courts registered
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          {t("addCourt")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label={t("province")} size="small" value={province} onChange={(e) => setProvince(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="ALL">{t("allProvinces")}</MenuItem>
          {provinces?.map((p) => (
            <MenuItem key={p} value={p}>
              {getProvinceLabel(p, language)}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          size="small"
          sx={{ minWidth: 220 }}
          options={["ALL", ...(types ?? [])]}
          groupBy={(opt) => (opt === "ALL" ? "" : getCourtTypeGroup(opt, language))}
          getOptionLabel={(opt) => (opt === "ALL" ? t("allTypes") : getCourtTypeLabel(opt, language))}
          value={type}
          onChange={(_, val) => setType(val || "ALL")}
          disableClearable
          renderInput={(params) => <TextField {...params} label={t("courtType")} />}
        />

        <TextField
          label={t("searchByNameOrLocation")}
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("courtName")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell>{t("province")}</TableCell>
              <TableCell>{t("location")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No courts found for this filter
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((court) => (
              <TableRow key={court.id} hover>
                <TableCell>{language === "ne" && court.nepaliName ? court.nepaliName : court.name}</TableCell>
                <TableCell>
                  <Chip label={getCourtTypeLabel(court.type, language)} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{getProvinceLabel(court.province, language) || "—"}</TableCell>
                <TableCell>{court.location || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={court.isActive ? t("active") : t("inactive")}
                    color={court.isActive ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditDialog(court)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  {court.isActive ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => deactivate.mutate(court.id)}>
                      {t("deactivate")}
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => activate.mutate(court.id)}>
                      {t("activate")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingCourt ? t("editCourt") : t("addCourt")}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("courtName")}
              required
              fullWidth
              {...register("name", { required: true })}
              error={!!formState.errors.name}
            />
            <TextField
              label="Court Name (Nepali)"
              fullWidth
              helperText="Shown when Nepali is selected — falls back to the English name if left blank"
              {...register("nepaliName")}
            />
            <TextField
              label={t("courtType")}
              required
              placeholder="e.g. Supreme Court, District Court, Labour Court"
              fullWidth
              {...register("type", { required: true })}
              error={!!formState.errors.type}
            />
            <TextField
              label="Province (optional — leave blank for national-level courts)"
              placeholder="e.g. Bagmati, Koshi"
              fullWidth
              {...register("province")}
            />
            <TextField label={t("locationOptional")} fullWidth {...register("location")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
