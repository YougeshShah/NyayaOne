import { useState } from "react";
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
import { useCoursesAdmin, useSubjectsAdmin } from "../../hooks/useCourseAdmin";
import { useLiveClassesAdmin, useLiveClassAdminActions } from "../../hooks/useTestLiveAdmin";
import { CreateLiveClassPayload } from "../../api/testLiveAdmin.api";

const statusColors: Record<string, "default" | "success" | "error" | "warning"> = {
  SCHEDULED: "default",
  LIVE: "success",
  ENDED: "default",
  CANCELLED: "error",
};

export function LiveClassAdminPage() {
  const { data: courses } = useCoursesAdmin();
  const [courseId, setCourseId] = useState<string>("");
  const { data: subjects } = useSubjectsAdmin(courseId || undefined);
  const { data: classes, isLoading } = useLiveClassesAdmin(courseId || undefined);
  const { create, hostJoin, markLive, cancel, uploadRecording } = useLiveClassAdminActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<CreateLiveClassPayload>({
    defaultValues: { durationMinutes: 60, isFreeDemo: false },
  });

  const onCreate = (values: CreateLiveClassPayload) => {
    create.mutate(
      { ...values, courseId, scheduledAt: new Date(values.scheduledAt).toISOString() },
      {
        onSuccess: () => {
          reset({ durationMinutes: 60, isFreeDemo: false });
          setDialogOpen(false);
        },
      }
    );
  };

  const handleJoin = (id: string) => {
    markLive.mutate(id);
    hostJoin.mutate(id, {
      onSuccess: (data) => window.open(data.meetingUrl, "_blank"),
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Live Classes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} disabled={!courseId}>
          Schedule Class
        </Button>
      </Box>

      <TextField select label="Course" size="small" value={courseId} onChange={(e) => setCourseId(e.target.value)} sx={{ minWidth: 260, mb: 3 }}>
        <MenuItem value="">Select a course</MenuItem>
        {courses?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {courseId && (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell align="center">Duration</TableCell>
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
                  <TableCell>{new Date(cls.scheduledAt).toLocaleString()}</TableCell>
                  <TableCell align="center">{cls.durationMinutes} min</TableCell>
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
                    {cls.status === "ENDED" && !cls.recordingUrl && (
                      <Button
                        size="small"
                        onClick={() => {
                          const url = window.prompt("Paste recording URL (YouTube unlisted, Google Drive link, etc.):");
                          if (url) uploadRecording.mutate({ id: cls.id, recordingUrl: url });
                        }}
                      >
                        Add Recording
                      </Button>
                    )}
                    {cls.recordingUrl && <Chip label="Recorded" size="small" color="success" sx={{ ml: 1 }} />}
                  </TableCell>
                </TableRow>
              ))}
              {classes?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No live classes scheduled for this course yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Schedule Live Class</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {create.isError && (
              <Alert severity="error">{(create.error as any)?.response?.data?.message || "Failed to schedule class"}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Uses Jitsi Meet (free) — a meeting room is created automatically when you save.
            </Typography>
            <TextField label="Class Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
            <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />
            <TextField select label="Subject (optional)" fullWidth {...register("subjectId")}>
              <MenuItem value="">No specific subject</MenuItem>
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
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
            <TextField
              label="Duration (minutes)"
              type="number"
              required
              fullWidth
              {...register("durationMinutes", { required: true, valueAsNumber: true, min: 1 })}
            />
            <FormControlLabel
              control={<Checkbox {...register("isFreeDemo")} />}
              label="Free Demo — students without a subscription can join"
            />
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
