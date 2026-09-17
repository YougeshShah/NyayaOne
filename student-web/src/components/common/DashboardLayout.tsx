import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box, Container, Button, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Drawer, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import NotesIcon from "@mui/icons-material/NoteAltOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notificationsData } = useMyNotifications();
  const { data: subscriptions } = useMySubscriptions();
  const hasLawSubscription = subscriptions?.some(
    (s) => s.course.category === "LAW" && (s.status === "ACTIVE" || s.status === "TRIAL")
  );
  const [precedentGateOpen, setPrecedentGateOpen] = useState(false);

  const handlePrecedentClick = () => {
    setMobileOpen(false);
    if (hasLawSubscription) {
      navigate("/precedents");
    } else {
      setPrecedentGateOpen(true);
    }
  };

  const navLinks = [
    { label: "My Progress", icon: <TrendingUpIcon fontSize="small" />, onClick: () => navigate("/progress") },
    { label: "Bookmarks", icon: <BookmarkIcon fontSize="small" />, onClick: () => navigate("/bookmarks") },
    { label: "Review Mistakes", icon: <ReplayIcon fontSize="small" />, onClick: () => navigate("/my-mistakes") },
    { label: "My Notes", icon: <NotesIcon fontSize="small" />, onClick: () => navigate("/my-notes") },
    { label: "नजिर खोज", icon: <GavelIcon fontSize="small" />, onClick: handlePrecedentClick },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid #E5E7EB", bgcolor: "#fff" }}>
        <Toolbar>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary"
            sx={{ flexGrow: 1, cursor: "pointer", fontSize: { xs: 16, sm: 20 } }}
            onClick={() => navigate("/")}
          >
            NyayaOne Learn
          </Typography>

          {!isMobile && navLinks.map((link) => (
            <Button key={link.label} startIcon={link.icon} onClick={link.onClick} sx={{ mr: 1 }}>
              {link.label}
            </Button>
          ))}

          <IconButton onClick={() => navigate("/notifications")} sx={{ mr: { xs: 0.5, sm: 1 } }}>
            <Badge badgeContent={notificationsData?.unreadCount ?? 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography variant="body2" sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>
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

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, mb: 1 }}>
            {user?.fullName}
          </Typography>
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.label} onClick={() => { link.onClick(); setMobileOpen(false); }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
      <ChatWidget />

      <Dialog open={precedentGateOpen} onClose={() => setPrecedentGateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Subscribe to Access नजिर खोज</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Precedent (Supreme Court judgment) search is available to students subscribed to a Law course.
            Subscribe to unlock this feature.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrecedentGateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPrecedentGateOpen(false);
              navigate("/");
            }}
          >
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
