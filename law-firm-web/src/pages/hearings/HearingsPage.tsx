import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
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
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { useHearings, useCreateHearing, useUpdateHearing } from "../../hooks/useHearings";
import { useCases } from "../../hooks/useCases";
import { useCourtsList } from "../../hooks/useCourtsList";
import { useTranslation } from "../../i18n/LanguageContext";
import { getCourtDisplayName } from "../../i18n/courtLabels";
import { StatusBadge } from "../../components/common/StatusBadge";
import { CreateHearingPayload, Hearing } from "../../types/hearing.types";

export function HearingsPage() {
  const { t, language } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useHearings({ page: 1, limit: 100 });
  const { data: cases } = useCases({ page: 1, limit: 100 } as any);
  const { data: courts } = useCourtsList();
  const createHearing = useCreateHearing();
  const updateHearing = useUpdateHearing();

  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null);
  const editForm = useForm<{ hearingDate: string; judge?: string; notes?: string; status: string }>();

  const openEdit = (h: Hearing) => {
    setEditingHearing(h);
    editForm.reset({
      hearingDate: new Date(h.hearingDate).toISOString().slice(0, 16),
      judge: h.judge ?? "",
      notes: (h as any).notes ?? "",
      status: h.status,
    });
  };

  const onEditSubmit = (values: { hearingDate: string; judge?: string; notes?: string; status: string }) => {
    if (!editingHearing) return;
    updateHearing.mutate(
      { id: editingHearing.id, payload: { ...values, hearingDate: new Date(values.hearingDate).toISOString() } },
      { onSuccess: () => setEditingHearing(null) }
    );
  };

  const { register, handleSubmit, reset, control, formState } = useForm<CreateHearingPayload>();

  const onCreate = (values: CreateHearingPayload) => {
    createHearing.mutate(values, {
      onSuccess: () => {
        reset();
        setDialogOpen(false);
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t("hearings")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.pagination.total ?? 0} hearings — reminders are scheduled automatically (48h, 24h, hearing day, 2h before)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Schedule Hearing
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("caseSingular")}</TableCell>
              <TableCell>{t("dateAndTime")}</TableCell>
              <TableCell>{t("judge")}</TableCell>
              <TableCell>{t("status")}</TableCell>
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
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hearings scheduled yet
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((h) => (
              <TableRow key={h.id} hover>
                <TableCell>
                  {h.case.caseTitle}
                  <Typography variant="caption" color="text.secondary" display="block">
                    {h.case.caseNumber}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(h.hearingDate).toLocaleString()}</TableCell>
                <TableCell>{h.judge || "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={h.status} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => openEdit(h)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("scheduleNewHearing")}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="info">Reminders (48h, 24h, hearing day, 2h before) will be created automatically.</Alert>

            <Controller
              name="caseId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={cases?.items ?? []}
                  getOptionLabel={(o) => `${o.caseNumber} — ${o.caseTitle}`}
                  onChange={(_, val) => field.onChange(val?.id ?? "")}
                  renderInput={(params) => <TextField {...params} label="Case" required error={!!formState.errors.caseId} />}
                />
              )}
            />

            <TextField
              label="Hearing Date & Time" required
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("hearingDate", { required: true })}
              error={!!formState.errors.hearingDate}
            />

            <Controller
              name="courtName"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={[...(courts?.items ?? [])].sort((a, b) => {
                    const provA = a.province || "ZZZ National Level";
                    const provB = b.province || "ZZZ National Level";
                    if (provA !== provB) return provA.localeCompare(provB);
                    return a.name.localeCompare(b.name);
                  })}
                  groupBy={(o) => o.province || "National Level"}
                  getOptionLabel={(o) => (typeof o === "string" ? o : `${getCourtDisplayName(o, language)} (${o.type})`)}
                  freeSolo
                  onChange={(_, val) => field.onChange(typeof val === "string" ? val : val?.name ?? "")}
                  onInputChange={(_, val) => field.onChange(val)}
                  renderInput={(params) => <TextField {...params} label="Court (optional override — defaults to the case's court)" />}
                />
              )}
            />
            <TextField label="Remarks" fullWidth multiline rows={2} {...register("remarks")} />
            <Typography variant="caption" color="text.secondary">
              Judge isn't known when scheduling — assignment happens the morning of the hearing (gola).
              Once the hearing has taken place, use "Edit" on it to record which judge presided and any outcome.
            </Typography>
            <FormControlLabel
              control={<Checkbox {...register("sendTestReminder")} />}
              label="Also send a test push reminder in ~2 minutes (for verifying notifications work)"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createHearing.isPending}>
              {createHearing.isPending ? "Scheduling..." : "Schedule Hearing"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!editingHearing} onClose={() => setEditingHearing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Hearing</DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Date & Time"
              type="datetime-local"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...editForm.register("hearingDate", { required: true })}
            />
            <TextField
              label="Judge (once known / after the gola)"
              fullWidth
              placeholder="Fill in once assigned — usually the morning of the hearing"
              {...editForm.register("judge")}
            />
            <TextField
              label="Hearing Outcome / What Happened"
              fullWidth
              multiline
              rows={2}
              placeholder="Brief record for the case file — e.g. adjourned to next date, arguments heard, order passed..."
              {...editForm.register("notes")}
            />
            <TextField select label="Status" required fullWidth {...editForm.register("status", { required: true })}>
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="POSTPONED">Postponed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditingHearing(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateHearing.isPending}>
              {updateHearing.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
