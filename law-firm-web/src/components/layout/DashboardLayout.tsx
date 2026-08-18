import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { NavLink, Outlet } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import MicIcon from "@mui/icons-material/MicOutlined";
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
  const { data: myPermissions } = useQuery({
    queryKey: ["my-tenant-permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: string[] }>("/tenant/my-permissions");
      return data.data;
    },
    enabled: user?.accountType !== "LAW_FIRM_ADMIN", // admin always has access -- skip the extra call
  });
  const hasAccountingPermission = user?.accountType === "LAW_FIRM_ADMIN" || (myPermissions?.includes("accounting.manage") ?? false);
  const logout = useLogout();
  const { t, language, setLanguage } = useTranslation();

  // Existing tenants created before this migration may not have modulesEnabled
  // set — default to case_management so nothing disappears for them.
  const enabledModules = user?.modulesEnabled ?? ["case_management"];
  const isEducation = user?.tenantType === "EDUCATION";
  const tenantLabel = user?.tenantName
    ? `${user.tenantName} — ${isEducation ? "Institution" : "Law Firm"} Portal`
    : isEducation ? "Institution Dashboard" : "Law Firm Dashboard";

  useEffect(() => {
    document.title = `NyayaOne — ${tenantLabel}`;
  }, [tenantLabel]);
  const roleLabel = user?.accountType === "LAW_FIRM_ADMIN" ? (isEducation ? "Institution Admin" : "Law Firm Admin") : user?.accountType?.replace(/_/g, " ") ?? "";

  const navItems = [
    { to: "/dashboard", label: t("dashboard"), icon: <DashboardIcon fontSize="small" />, module: null, tenantSpecific: null },
    { to: "/cases", label: t("cases"), icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/hearings", label: t("hearings"), icon: <EventIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/clients", label: t("clients"), icon: <PeopleIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/reports", label: t("reports"), icon: <AssessmentIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/accounting", label: "Accounting", icon: <AssessmentIcon fontSize="small" />, module: null, tenantSpecific: "EDUCATION" },
    { to: "/library", label: "Legal Library", icon: <MenuBookIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/precedents", label: "नजिर खोज (Precedents)", icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
    { to: "/roles", label: "Roles & Permissions", icon: <BadgeIcon fontSize="small" />, module: null, tenantSpecific: null },
    { to: "/students", label: "Students", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
    { to: "/pending-approvals", label: "Pending Approvals", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
    { to: "/live-classes", label: "Live Classes", icon: <BadgeIcon fontSize="small" />, module: "live_classes", tenantSpecific: "EDUCATION" },
    { to: "/resources", label: "Resources", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
    { to: "/mock-tests", label: "Mock Tests", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
    { to: "/speaking-admin", label: "Speaking Prompts", icon: <MicIcon fontSize="small" />, module: "speaking_prompts", tenantSpecific: "EDUCATION" },
    { to: "/usage-limits", label: "Usage Limits", icon: <AssessmentIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
    ...(user?.accountType === "LAW_FIRM_ADMIN"
      ? [{ to: "/users", label: isEducation ? "Staff" : t("lawyersAndStaff"), icon: <BadgeIcon fontSize="small" />, module: null, tenantSpecific: null }]
      : []),
  ]
    // Module gate — the organization must have this feature enabled at all.
    .filter((item) => item.module === null || enabledModules.includes(item.module))
    // Tenant-type gate — Law Firm items never show for an Education tenant
    // and vice versa, even if the underlying module was accidentally left
    // enabled — an institution should only ever see an institution's view.
    .filter((item) => item.tenantSpecific === null || item.tenantSpecific === user?.tenantType)
    .filter((item) => item.to !== "/accounting" || hasAccountingPermission);

  return (
    <div>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
            NyayaOne
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
            {tenantLabel}
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
              {roleLabel}
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
