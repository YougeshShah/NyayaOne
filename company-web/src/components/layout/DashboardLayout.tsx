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
import LanguageIcon from "@mui/icons-material/LanguageOutlined";
import { Avatar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import styles from "./DashboardLayout.module.css";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useTranslation } from "../../i18n/LanguageContext";
import { TranslationKey } from "../../i18n/translations";
import { getAvatarUrl } from "../../api/profile.api";

const NAV_ITEMS: { to: string; labelKey: TranslationKey; icon: JSX.Element }[] = [
  { to: "/dashboard", labelKey: "dashboard", icon: <DashboardIcon fontSize="small" /> },
  { to: "/law-firms", labelKey: "lawFirms", icon: <BusinessIcon fontSize="small" /> },
  { to: "/courts", labelKey: "courts", icon: <GavelIcon fontSize="small" /> },
  { to: "/library", labelKey: "legalLibrary", icon: <MenuBookIcon fontSize="small" /> },
  { to: "/document-templates", labelKey: "documentTemplates", icon: <DescriptionIcon fontSize="small" /> },
  { to: "/notifications", labelKey: "notifications", icon: <NotificationsIcon fontSize="small" /> },
  { to: "/audit-logs", labelKey: "auditLogs", icon: <HistoryIcon fontSize="small" /> },
  { to: "/company-staff", labelKey: "companyStaff", icon: <BadgeIcon fontSize="small" /> },
  { to: "/subscriptions", labelKey: "subscriptions", icon: <PaymentIcon fontSize="small" /> },
];

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { t, language, setLanguage } = useTranslation();

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
              {t(item.labelKey)}
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
              {user?.email}
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
