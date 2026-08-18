import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box, Container, Button, Badge } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { getAvatarUrl } from "../../api/profile.api";
import { ChatWidget } from "./ChatWidget";
import { useMyNotifications } from "../../hooks/useNotifications";
import { useMySubscriptions } from "../../hooks/useCourse";

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: notificationsData } = useMyNotifications();
  const { data: subscriptions } = useMySubscriptions();
  const hasLawSubscription = subscriptions?.some(
    (s) => s.course.category === "LAW" && (s.status === "ACTIVE" || s.status === "TRIAL")
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
        <Toolbar>
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            NyayaOne Learn
          </Typography>
          <Button startIcon={<TrendingUpIcon />} onClick={() => navigate("/progress")} sx={{ mr: 1 }}>
            My Progress
          </Button>
          <Button startIcon={<BookmarkIcon />} onClick={() => navigate("/bookmarks")} sx={{ mr: 1 }}>
            Bookmarks
          </Button>
          <Button startIcon={<ReplayIcon />} onClick={() => navigate("/my-mistakes")} sx={{ mr: 1 }}>
            Review Mistakes
          </Button>
          {hasLawSubscription && (
            <Button startIcon={<GavelIcon />} onClick={() => navigate("/precedents")} sx={{ mr: 1 }}>
              नजिर खोज
            </Button>
          )}
          <IconButton onClick={() => navigate("/notifications")} sx={{ mr: 1 }}>
            <Badge badgeContent={notificationsData?.unreadCount ?? 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.fullName}
          </Typography>
          <Avatar
            src={getAvatarUrl(user?.avatarUrl)}
            sx={{ width: 32, height: 32, mr: 1, bgcolor: "primary.main", cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            {user?.fullName?.charAt(0) ?? "S"}
          </Avatar>
          <IconButton onClick={logout} size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <ChatWidget />
    </Box>
  );
}
