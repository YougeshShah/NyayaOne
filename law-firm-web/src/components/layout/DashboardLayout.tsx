import { useEffect, useState } from "react";
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
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Box, Button, Collapse, Drawer, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useTranslation } from "../../i18n/LanguageContext";
import { getAvatarUrl } from "../../api/profile.api";

const SIDEBAR_WIDTH = 260;

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const { data: myPermissions } = useQuery({
    queryKey: ["my-tenant-permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: string[] }>("/tenant/my-permissions");
      return data.data;
    },
    enabled: user?.accountType !== "LAW_FIRM_ADMIN",
  });
  const hasAccountingPermission = user?.accountType === "LAW_FIRM_ADMIN" || (myPermissions?.includes("accounting.manage") ?? false);
  const logout = useLogout();
  const { t, language, setLanguage } = useTranslation();

  const enabledModules = user?.modulesEnabled ?? ["case_management"];
  const isEducation = user?.tenantType === "EDUCATION";
  const tenantLabel = user?.tenantName
    ? `${user.tenantName} — ${isEducation ? "Institution" : "Law Firm"} Portal`
    : isEducation ? "Institution Dashboard" : "Law Firm Dashboard";

  useEffect(() => {
    document.title = `TechnoOne — ${tenantLabel}`;
  }, [tenantLabel]);
  const roleLabel = user?.accountType === "LAW_FIRM_ADMIN" ? (isEducation ? "Institution Admin" : "Law Firm Admin") : user?.accountType?.replace(/_/g, " ") ?? "";

  type NavItem = { to: string; label: string; icon: JSX.Element; module: string | null; tenantSpecific: string | null };
  type NavGroup = { label: string; items: NavItem[] };

  const groups: NavGroup[] = [
    {
      label: "",
      items: [
        { to: "/dashboard", label: t("dashboard"), icon: <DashboardIcon fontSize="small" />, module: null, tenantSpecific: null },
      ],
    },
    {
      label: "Organization",
      items: [
        ...(user?.accountType === "LAW_FIRM_ADMIN"
          ? [{ to: "/users", label: isEducation ? "Staff" : t("lawyersAndStaff"), icon: <BadgeIcon fontSize="small" />, module: null, tenantSpecific: null }]
          : []),
        { to: "/roles", label: "Roles & Permissions", icon: <BadgeIcon fontSize="small" />, module: null, tenantSpecific: null },
      ],
    },
    {
      label: "Case Management",
      items: [
        { to: "/clients", label: t("clients"), icon: <PeopleIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/cases", label: t("cases"), icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/hearings", label: t("hearings"), icon: <EventIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
      ],
    },
    {
      label: "Institution",
      items: [
        { to: "/pending-approvals", label: "Pending Approvals", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
        { to: "/students", label: "Students", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
        { to: "/live-classes", label: "Live Classes", icon: <BadgeIcon fontSize="small" />, module: "live_classes", tenantSpecific: "EDUCATION" },
        { to: "/resources", label: "Resources", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
        { to: "/mock-tests", label: "Mock Tests", icon: <BadgeIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
        { to: "/speaking-admin", label: "Speaking Prompts", icon: <MicIcon fontSize="small" />, module: "speaking_prompts", tenantSpecific: "EDUCATION" },
        { to: "/usage-limits", label: "Usage Limits", icon: <AssessmentIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
        { to: "/course-content", label: "Course Content", icon: <MenuBookIcon fontSize="small" />, module: "student_platform", tenantSpecific: "EDUCATION" },
      ],
    },
    {
      label: "Legal Research & AI",
      items: [
        { to: "/library", label: "Legal Library", icon: <MenuBookIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/precedents", label: "नजिर खोज (Precedents)", icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/drafting", label: "Drafting Panel", icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/uk-precedents", label: "UK Case Law", icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "/ai-assistant", label: "AI Assistant", icon: <GavelIcon fontSize="small" />, module: "ai_legal_assistant", tenantSpecific: "LAW_FIRM" },
        { to: "/ai-content", label: "AI Content Generator", icon: <GavelIcon fontSize="small" />, module: "ai_legal_assistant", tenantSpecific: null },
      ],
    },
    {
      label: "Billing",
      items: [
        { to: "/subscription", label: "Subscription", icon: <AssessmentIcon fontSize="small" />, module: null, tenantSpecific: null },
        { to: "/accounting", label: "Accounting", icon: <AssessmentIcon fontSize="small" />, module: null, tenantSpecific: "EDUCATION" },
        { to: "/payment-vouchers", label: "Payment Vouchers", icon: <AssessmentIcon fontSize="small" />, module: null, tenantSpecific: "EDUCATION" },
      ],
    },
    {
      label: "Reports",
      items: [
        { to: "/reports", label: t("reports"), icon: <AssessmentIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
        { to: "external:https://judgments.ecourts.gov.in/", label: "India Case Law ↗", icon: <GavelIcon fontSize="small" />, module: "case_management", tenantSpecific: "LAW_FIRM" },
      ],
    },
  ];

  const filterItem = (item: NavItem) =>
    (item.module === null || enabledModules.includes(item.module)) &&
    (item.tenantSpecific === null || item.tenantSpecific === user?.tenantType) &&
    (item.to !== "/accounting" || hasAccountingPermission);

  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter(filterItem) }))
    .filter((g) => g.items.length > 0);

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: "100%", bgcolor: "#0F172A", color: "#fff", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>TechnoOne</Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>{tenantLabel}</Typography>
      </Box>
      <Box component="nav" sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {visibleGroups.map((group, gi) => {
          const isOpen = group.label === "" || (openGroups[group.label] ?? true);
          return (
          <Box key={gi} sx={{ mb: 1 }}>
            {group.label && (
              <Box
                onClick={() => toggleGroup(group.label)}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 0.5, cursor: "pointer" }}
              >
                <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700 }}>
                  {group.label}
                </Typography>
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{ color: "rgba(255,255,255,0.4)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                />
              </Box>
            )}
            <Collapse in={isOpen} timeout={150}>
            {group.items.map((item) =>
              item.to.startsWith("external:") ? (
                <Box
                  key={item.to}
                  component="a"
                  href={item.to.replace("external:", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ) : (
                <Box
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2.5,
                    py: 1,
                    color: "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                    fontSize: 14,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    "&.active": { bgcolor: "primary.main", color: "#fff" },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              )
            )}
            </Collapse>
          </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}>
          {sidebarContent}
        </Drawer>
      ) : (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>{sidebarContent}</Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Toolbar sx={{ bgcolor: "#fff", borderBottom: "1px solid #e5e7eb", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            <Button
              size="small"
              startIcon={<LanguageIcon fontSize="small" />}
              onClick={() => setLanguage(language === "en" ? "ne" : "en")}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              {language === "en" ? "नेपाली" : "English"}
            </Button>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={600}>{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">{roleLabel}</Typography>
            </Box>
            <NavLink to="/profile" style={{ textDecoration: "none" }}>
              <Avatar src={getAvatarUrl(user?.avatarUrl)} sx={{ bgcolor: "primary.main", cursor: "pointer" }}>
                {user?.fullName?.charAt(0) ?? "U"}
              </Avatar>
            </NavLink>
            <IconButton onClick={logout} title={t("logout")}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, overflowX: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
