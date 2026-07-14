import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
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
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { useHearings, useCreateHearing } from "../../hooks/useHearings";
import { useCases } from "../../hooks/useCases";
import { StatusBadge } from "../../components/common/StatusBadge";
import { CreateHearingPayload } from "../../types/hearing.types";

export function HearingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useHearings({ page: 1, limit: 100 });
  const { data: cases } = useCases({ page: 1, limit: 100 } as any);
  const createHearing = useCreateHearing();

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
            Hearings
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
              <TableCell>Case</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Judge</TableCell>
              <TableCell>Status</TableCell>
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
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Schedule New Hearing</DialogTitle>
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

            <TextField label="Court Name (optional override)" fullWidth {...register("courtName")} />
            <TextField label="Judge" fullWidth {...register("judge")} />
            <TextField label="Remarks" fullWidth multiline rows={2} {...register("remarks")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createHearing.isPending}>
              {createHearing.isPending ? "Scheduling..." : "Schedule Hearing"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
