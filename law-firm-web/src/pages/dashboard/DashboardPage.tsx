import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, Chip, LinearProgress } from "@mui/material";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import VideocamIcon from "@mui/icons-material/VideocamOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import { useCases } from "../../hooks/useCases";
import { useClients } from "../../hooks/useClients";
import { useTodayHearings, useUpcomingHearings } from "../../hooks/useHearings";
import { useMyFirmSubscription } from "../../hooks/useSubscription";
import { useInstitutionStudents } from "../../hooks/useInstitutionStudents";
import { liveClassInstitutionApi } from "../../api/liveClassInstitution.api";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "../../i18n/LanguageContext";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #e5e7eb",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${color}1A`,
          color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isEducation = user?.tenantType === "EDUCATION";

  return isEducation ? <EducationDashboard /> : <LawFirmDashboard />;
}

function EducationDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: students } = useInstitutionStudents();
  const { data: liveClasses } = useQuery({ queryKey: ["institution-dashboard-classes"], queryFn: () => liveClassInstitutionApi.list() });
  const { data: subscription } = useMyFirmSubscription();

  const upcomingClasses = (liveClasses ?? []).filter((c) => c.status === "SCHEDULED").slice(0, 6);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {getGreeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
      </Typography>

      {subscription && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Plan
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {subscription.plan.name}{" "}
              <Chip size="small" label={subscription.status} color={subscription.status === "ACTIVE" ? "success" : subscription.status === "TRIAL" ? "warning" : "error"} sx={{ ml: 1 }} />
            </Typography>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Total Students" value={students?.length ?? "—"} icon={<SchoolIcon />} color="#0F4C3A" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Upcoming Live Classes" value={upcomingClasses.length} icon={<VideocamIcon />} color="#B8860B" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Live Classes Hosted" value={liveClasses?.length ?? "—"} icon={<ArticleIcon />} color="#1D6E52" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Upcoming Live Classes
            </Typography>
            <List dense>
              {upcomingClasses.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No live classes scheduled.
                </Typography>
              )}
              {upcomingClasses.map((c) => (
                <ListItem key={c.id} divider>
                  <ListItemText primary={c.title} secondary={new Date(c.scheduledAt).toLocaleString()} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Recently Added Students
            </Typography>
            <List dense>
              {(!students || students.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No students added yet.
                </Typography>
              )}
              {students?.slice(0, 6).map((s) => (
                <ListItem key={s.id} divider>
                  <ListItemText primary={s.fullName} secondary={s.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function LawFirmDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: allCases } = useCases({ page: 1 });
  const { data: openCases } = useCases({ status: "OPEN", page: 1 });
  const { data: clients } = useClients({ page: 1 });
  const { data: todayHearings } = useTodayHearings();
  const { data: upcomingHearings } = useUpcomingHearings();
  const { data: subscription } = useMyFirmSubscription();

  const daysRemaining = subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {getGreeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
      </Typography>

      {subscription && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("currentPlan")}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {subscription.plan.name}{" "}
              <Chip
                size="small"
                label={subscription.status}
                color={subscription.status === "ACTIVE" ? "success" : subscription.status === "TRIAL" ? "warning" : "error"}
                sx={{ ml: 1 }}
              />
            </Typography>
            {daysRemaining !== null && (
              <Typography variant="caption" color={daysRemaining <= 7 ? "error" : "text.secondary"}>
                {daysRemaining > 0 ? `${daysRemaining} ${t("dayRemaining")}` : t("expired")}
              </Typography>
            )}
          </Box>
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="caption" color="text.secondary">
              {t("lawyersLabel")}: {subscription.usage.lawyers.used} / {subscription.usage.lawyers.limit ?? "∞"}
            </Typography>
            {subscription.usage.lawyers.limit && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (subscription.usage.lawyers.used / subscription.usage.lawyers.limit) * 100)}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {t("casesLabel")}: {subscription.usage.cases.used} / {subscription.usage.cases.limit ?? "∞"}
            </Typography>
            {subscription.usage.cases.limit && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (subscription.usage.cases.used / subscription.usage.cases.limit) * 100)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
          </Box>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("totalCases")} value={allCases?.pagination.total ?? "—"} icon={<GavelIcon />} color="#0F4C3A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("openCases")} value={openCases?.pagination.total ?? "—"} icon={<GavelIcon />} color="#B8860B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("totalClients")} value={clients?.pagination.total ?? "—"} icon={<PeopleIcon />} color="#1D6E52" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("todaysHearings")} value={todayHearings?.length ?? "—"} icon={<EventIcon />} color="#B8860B" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {t("todaysHearings")}
            </Typography>
            <List dense>
              {(!todayHearings || todayHearings.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  {t("noHearingsToday")}
                </Typography>
              )}
              {todayHearings?.map((h) => (
                <ListItem key={h.id} divider>
                  <ListItemText
                    primary={h.case.caseTitle}
                    secondary={`${h.case.caseNumber} — ${new Date(h.hearingDate).toLocaleTimeString()}`}
                  />
                  <Chip size="small" label={h.status} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {t("upcomingHearings")}
            </Typography>
            <List dense>
              {(!upcomingHearings || upcomingHearings.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  {t("noUpcomingHearings")}
                </Typography>
              )}
              {upcomingHearings?.slice(0, 6).map((h) => (
                <ListItem key={h.id} divider>
                  <ListItemText
                    primary={h.case.caseTitle}
                    secondary={`${h.case.caseNumber} — ${new Date(h.hearingDate).toLocaleDateString()}`}
                  />
                  <Chip size="small" label={h.status} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
