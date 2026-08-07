import { Grid, Paper, Typography, Box } from "@mui/material";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import { useLawFirms } from "../../hooks/useLawFirms";
import { useCourts } from "../../hooks/useCourts";
import { useTranslation } from "../../i18n/LanguageContext";

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
  const { t } = useTranslation();
  const { data: allFirms } = useLawFirms({ page: 1 });
  const { data: pendingFirms } = useLawFirms({ status: "PENDING", page: 1 });
  const { data: activeFirms } = useLawFirms({ status: "ACTIVE", page: 1 });
  const { data: courts } = useCourts({ page: 1 });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t("overview")}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("totalLawFirms")} value={allFirms?.pagination.total ?? "—"} icon={<BusinessIcon />} color="#1E3A5F" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("pendingApproval")} value={pendingFirms?.pagination.total ?? "—"} icon={<BusinessIcon />} color="#B8860B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("activeLawFirms")} value={activeFirms?.pagination.total ?? "—"} icon={<BusinessIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("registeredCourts")} value={courts?.pagination.total ?? "—"} icon={<GavelIcon />} color="#1E3A5F" />
        </Grid>
      </Grid>
    </Box>
  );
}
