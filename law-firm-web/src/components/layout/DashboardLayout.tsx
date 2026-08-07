import { NavLink, Outlet } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import LanguageIcon from "@mui/icons-material/LanguageOutlined";
import { Avatar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import styles from "./DashboardLayout.module.css";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useTranslation } from "../../i18n/LanguageContext";
import { getAvatarUrl } from "../../api/profile.api";

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { t, language, setLanguage } = useTranslation();

  // Existing tenants created before this migration may not have modulesEnabled
  // set — default to case_management so nothing disappears for them.
  const enabledModules = user?.modulesEnabled ?? ["case_management"];

  const navItems = [
    { to: "/dashboard", label: t("dashboard"), icon: <DashboardIcon fontSize="small" />, module: null },
    { to: "/cases", label: t("cases"), icon: <GavelIcon fontSize="small" />, module: "case_management" },
    { to: "/hearings", label: t("hearings"), icon: <EventIcon fontSize="small" />, module: "case_management" },
    { to: "/clients", label: t("clients"), icon: <PeopleIcon fontSize="small" />, module: "case_management" },
    { to: "/reports", label: t("reports"), icon: <AssessmentIcon fontSize="small" />, module: "case_management" },
    { to: "/library", label: "Legal Library", icon: <MenuBookIcon fontSize="small" />, module: "case_management" },
    { to: "/roles", label: "Roles & Permissions", icon: <BadgeIcon fontSize="small" />, module: null },
    { to: "/students", label: "Students", icon: <BadgeIcon fontSize="small" />, module: "student_platform" },
    { to: "/live-classes", label: "Live Classes", icon: <BadgeIcon fontSize="small" />, module: "live_classes" },
    { to: "/resources", label: "Resources", icon: <BadgeIcon fontSize="small" />, module: "student_platform" },
    ...(user?.accountType === "LAW_FIRM_ADMIN"
      ? [{ to: "/users", label: t("lawyersAndStaff"), icon: <BadgeIcon fontSize="small" />, module: "case_management" }]
      : []),
  ].filter((item) => item.module === null || enabledModules.includes(item.module));

  return (
    <div>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
            NyayaOne
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Law Firm Dashboard
          </Typography>
        </div>

        <nav>
          {navItems.map((item) => (
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
          <Button
            size="small"
            startIcon={<LanguageIcon fontSize="small" />}
            onClick={() => setLanguage(language === "en" ? "ne" : "en")}
          >
            {language === "en" ? "नेपाली" : "English"}
          </Button>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight={600}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.accountType.replace(/_/g, " ")}
            </Typography>
          </Box>
          <NavLink to="/profile" style={{ textDecoration: "none" }}>
            <Avatar src={getAvatarUrl(user?.avatarUrl)} sx={{ bgcolor: "primary.main", cursor: "pointer" }}>
              {user?.fullName?.charAt(0) ?? "U"}
            </Avatar>
          </NavLink>
          <IconButton onClick={logout} title={t("logout")}>
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
