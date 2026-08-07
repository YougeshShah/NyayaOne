import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
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
import VideocamIcon from "@mui/icons-material/Videocam";
import { useForm } from "react-hook-form";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";

const statusColors: Record<string, "default" | "success" | "error"> = {
  SCHEDULED: "default",
  LIVE: "success",
  ENDED: "default",
  CANCELLED: "error",
};

interface FormValues {
  title: string;
  description?: string;
  courseId: string;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
}

export function LiveClassesPage() {
  const qc = useQueryClient();
  const { data: classes, isLoading } = useQuery({ queryKey: ["institution-live-classes"], queryFn: () => liveClassInstitutionApi.list() });
  const { data: courses } = useQuery({ queryKey: ["institution-courses"], queryFn: () => liveClassInstitutionApi.courses() });

  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { durationMinutes: 60, isFreeDemo: false },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["institution-live-classes"] });
  const create = useMutation({
    mutationFn: (values: FormValues) => liveClassInstitutionApi.create({ ...values, scheduledAt: new Date(values.scheduledAt).toISOString() }),
    onSuccess: invalidate,
  });
  const markLive = useMutation({ mutationFn: (id: string) => liveClassInstitutionApi.markLive(id), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: (id: string) => liveClassInstitutionApi.cancel(id), onSuccess: invalidate });
  const hostJoin = useMutation({ mutationFn: (id: string) => liveClassInstitutionApi.hostJoin(id) });

  const onCreate = (values: FormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        reset({ durationMinutes: 60, isFreeDemo: false });
        setDialogOpen(false);
      },
    });
  };

  const handleJoin = (id: string) => {
    markLive.mutate(id);
    hostJoin.mutate(id, { onSuccess: (data) => window.open(data.meetingUrl, "_blank") });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Live Classes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Schedule Class
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Classes you schedule here are visible only to your own students — not to other institutions' students, even
        for the same course.
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell align="center">Status</TableCell>
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
            {classes?.map((cls) => (
              <TableRow key={cls.id} hover>
                <TableCell>
                  {cls.title}
                  {cls.isFreeDemo && <Chip label="Free" size="small" color="success" sx={{ ml: 1, height: 18 }} />}
                </TableCell>
                <TableCell>{cls.course?.name}</TableCell>
                <TableCell>{new Date(cls.scheduledAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Chip label={cls.status} size="small" color={statusColors[cls.status]} />
                </TableCell>
                <TableCell align="right">
                  {(cls.status === "SCHEDULED" || cls.status === "LIVE") && (
                    <Button size="small" startIcon={<VideocamIcon />} onClick={() => handleJoin(cls.id)}>
                      Start / Join
                    </Button>
                  )}
                  {cls.status === "SCHEDULED" && (
                    <Button size="small" color="error" onClick={() => cancel.mutate(cls.id)}>
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {classes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No live classes scheduled yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Schedule Live Class</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && <Alert severity="error">{(create.error as any)?.response?.data?.message || "Failed to schedule class"}</Alert>}
            <Typography variant="caption" color="text.secondary">
              Uses Jitsi Meet (free) — a meeting room is created automatically.
            </Typography>
            <TextField label="Class Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />
            <TextField select label="Course" required fullWidth defaultValue="" {...register("courseId", { required: true })}>
              {courses?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Scheduled Date & Time"
              type="datetime-local"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("scheduledAt", { required: true })}
            />
            <TextField label="Duration (minutes)" type="number" required fullWidth {...register("durationMinutes", { required: true, valueAsNumber: true, min: 1 })} />
            <FormControlLabel control={<Checkbox {...register("isFreeDemo")} />} label="Free Demo — open to students without a subscription" />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              {create.isPending ? "Scheduling..." : "Schedule Class"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
