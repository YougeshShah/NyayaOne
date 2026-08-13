import { Box, Typography, Paper, Chip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import { useMyNotifications, useMarkNotificationRead } from "../../hooks/useNotifications";

export function NotificationsPage() {
  const { data } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <NotificationsIcon color="action" />
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Box>

      {data?.items.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No notifications yet.
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {data?.items.map((n) => (
          <Paper
            key={n.id}
            elevation={0}
            onClick={() => !n.isRead && markRead.mutate(n.id)}
            sx={{
              p: 2.5,
              border: `1px solid ${n.isRead ? "#E5E7EB" : "#93C5FD"}`,
              bgcolor: n.isRead ? "#fff" : "#EFF6FF",
              borderRadius: 3,
              cursor: n.isRead ? "default" : "pointer",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {n.notification.title}
              </Typography>
              {!n.isRead && <Chip label="New" size="small" color="primary" />}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {n.notification.body}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
              {new Date(n.notification.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
