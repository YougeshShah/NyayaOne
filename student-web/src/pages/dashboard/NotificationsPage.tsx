import { Box, Typography, Paper, Chip, Button, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useMyNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "../../hooks/useNotifications";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function NotificationsPage() {
  const { data } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Badge badgeContent={unreadCount} color="primary" max={99}>
            <NotificationsIcon color="action" />
          </Badge>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon fontSize="small" />}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      {data?.items.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #E5E7EB", borderRadius: 3 }}>
          <NotificationsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
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
              border: `1px solid ${n.isRead ? "#F1F5F9" : "#BFDBFE"}`,
              bgcolor: n.isRead ? "#fff" : "#EFF6FF",
              borderRadius: 3,
              cursor: n.isRead ? "default" : "pointer",
              display: "flex",
              gap: 1.5,
              transition: "border-color 0.15s ease",
              "&:hover": !n.isRead ? { borderColor: "#93C5FD" } : {},
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: n.isRead ? "#F1F5F9" : "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CampaignIcon sx={{ fontSize: 18, color: n.isRead ? "#9CA3AF" : "#2563EB" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {n.notification.title}
                </Typography>
                {!n.isRead && <Chip label="New" size="small" color="primary" sx={{ ml: 1, flexShrink: 0 }} />}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {n.notification.body}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
                {formatRelativeTime(n.notification.createdAt)}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
