import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, Chip, LinearProgress } from "@mui/material";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import { useCases } from "../../hooks/useCases";
import { useClients } from "../../hooks/useClients";
import { useTodayHearings, useUpcomingHearings } from "../../hooks/useHearings";
import { useMyFirmSubscription } from "../../hooks/useSubscription";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2,
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
        Overview
      </Typography>

      {subscription && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Plan
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
                {daysRemaining > 0 ? `${daysRemaining} day(s) remaining` : "Expired"}
              </Typography>
            )}
          </Box>
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="caption" color="text.secondary">
              Lawyers: {subscription.usage.lawyers.used} / {subscription.usage.lawyers.limit ?? "∞"}
            </Typography>
            {subscription.usage.lawyers.limit && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (subscription.usage.lawyers.used / subscription.usage.lawyers.limit) * 100)}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              Cases: {subscription.usage.cases.used} / {subscription.usage.cases.limit ?? "∞"}
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
          <StatCard label="Total Cases" value={allCases?.pagination.total ?? "—"} icon={<GavelIcon />} color="#0F4C3A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Open Cases" value={openCases?.pagination.total ?? "—"} icon={<GavelIcon />} color="#B8860B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Clients" value={clients?.pagination.total ?? "—"} icon={<PeopleIcon />} color="#1D6E52" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Today's Hearings" value={todayHearings?.length ?? "—"} icon={<EventIcon />} color="#B8860B" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Today's Hearings
            </Typography>
            <List dense>
              {(!todayHearings || todayHearings.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No hearings scheduled today.
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
              Upcoming Hearings
            </Typography>
            <List dense>
              {(!upcomingHearings || upcomingHearings.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No upcoming hearings.
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
