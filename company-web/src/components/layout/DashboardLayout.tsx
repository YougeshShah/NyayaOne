import { NavLink, Outlet } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import PaymentIcon from "@mui/icons-material/PaymentsOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import styles from "./DashboardLayout.module.css";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
  { to: "/law-firms", label: "Law Firms", icon: <BusinessIcon fontSize="small" /> },
  { to: "/courts", label: "Courts", icon: <GavelIcon fontSize="small" /> },
  { to: "/library", label: "Legal Library", icon: <MenuBookIcon fontSize="small" /> },
  { to: "/document-templates", label: "Document Templates", icon: <DescriptionIcon fontSize="small" /> },
  { to: "/notifications", label: "Notifications", icon: <NotificationsIcon fontSize="small" /> },
  { to: "/audit-logs", label: "Audit Logs", icon: <HistoryIcon fontSize="small" /> },
  { to: "/company-staff", label: "Company Staff", icon: <BadgeIcon fontSize="small" /> },
  { to: "/subscriptions", label: "Subscriptions", icon: <PaymentIcon fontSize="small" /> },
];

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
            NyayaOne
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Company Control Center
          </Typography>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <Toolbar sx={{ bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", justifyContent: "flex-end", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight={600}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "primary.main" }}>{user?.fullName?.charAt(0) ?? "U"}</Avatar>
          <IconButton onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>

        <Box sx={{ p: 4 }}>
          <Outlet />
        </Box>
      </div>
    </div>
  );
}
