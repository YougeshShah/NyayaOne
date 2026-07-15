import { useState } from "react";
import {
  Box,
  Button,
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
  Chip,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useForm, Controller } from "react-hook-form";
import { useSentNotifications, useSendNotification } from "../../hooks/useNotifications";
import { useLawFirms } from "../../hooks/useLawFirms";
import { SendNotificationPayload, NotificationAudience } from "../../types/notification.types";

const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  ALL_LAWYERS: "All Lawyers",
  SPECIFIC_LAW_FIRM: "Specific Law Firm",
  ALL_STUDENTS: "All Students (Phase 2)",
  ALL_CLIENTS: "All Clients",
  INDIVIDUAL_USER: "Individual User",
};

export function NotificationsPage() {
  const { data: sent, isLoading } = useSentNotifications();
  const { data: lawFirms } = useLawFirms({ page: 1, status: "ACTIVE" });
  const sendNotification = useSendNotification();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState } = useForm<SendNotificationPayload>({
    defaultValues: { audience: "ALL_LAWYERS" },
  });
  const audience = watch("audience");

  const onSubmit = (values: SendNotificationPayload) => {
    setSuccessMsg(null);
    sendNotification.mutate(values, {
      onSuccess: (result) => {
        setSuccessMsg(`Sent successfully: "${result.title}"`);
        reset({ title: "", body: "", audience: values.audience, targetId: undefined });
      },
    });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Notification Center
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 4, maxWidth: 600 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Send Announcement
        </Typography>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}
        {sendNotification.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(sendNotification.error as any)?.response?.data?.message || "Failed to send notification"}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField select label="Audience" required {...register("audience", { required: true })} defaultValue="ALL_LAWYERS">
            {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value} disabled={value === "ALL_STUDENTS"}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          {audience === "SPECIFIC_LAW_FIRM" && (
            <TextField select label="Law Firm" required {...register("targetId", { required: true })}>
              {lawFirms?.items.map((firm) => (
                <MenuItem key={firm.id} value={firm.id}>
                  {firm.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {audience === "INDIVIDUAL_USER" && (
            <TextField
              label="User ID"
              required
              helperText="Paste the exact user ID (UUID) of the recipient"
              {...register("targetId", { required: true })}
            />
          )}

          <TextField label="Title" required fullWidth {...register("title", { required: true })} error={!!formState.errors.title} />
          <TextField
            label="Message"
            required
            fullWidth
            multiline
            rows={4}
            {...register("body", { required: true })}
            error={!!formState.errors.body}
          />

          <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={sendNotification.isPending} sx={{ alignSelf: "flex-start" }}>
            {sendNotification.isPending ? "Sending..." : "Send Notification"}
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Sent History
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell align="center">Recipients</TableCell>
              <TableCell>Sent At</TableCell>
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
            {!isLoading && sent?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No notifications sent yet
                </TableCell>
              </TableRow>
            )}
            {sent?.items.map((n) => (
              <TableRow key={n.id} hover>
                <TableCell>{n.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={AUDIENCE_LABELS[n.audience]} variant="outlined" />
                </TableCell>
                <TableCell align="center">{n._count.recipients}</TableCell>
                <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
