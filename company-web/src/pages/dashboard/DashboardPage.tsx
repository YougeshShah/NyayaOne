import { Grid, Paper, Typography, Box, Button, Chip, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmptyOutlined";
import { useLawFirms } from "../../hooks/useLawFirms";
import { useCourts } from "../../hooks/useCourts";
import { useTranslation } from "../../i18n/LanguageContext";
import { useAuthStore } from "../../store/authStore";

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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: allFirms } = useLawFirms({ page: 1 });
  const { data: pendingFirms } = useLawFirms({ status: "PENDING", page: 1 });
  const { data: activeFirms } = useLawFirms({ status: "ACTIVE", page: 1 });
  const { data: courts } = useCourts({ page: 1 });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            {getGreeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("overview")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/law-firms")}>
          Add Organization
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("totalLawFirms")} value={allFirms?.pagination.total ?? "—"} icon={<BusinessIcon />} color="#1E3A5F" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("pendingApproval")} value={pendingFirms?.pagination.total ?? "—"} icon={<HourglassEmptyIcon />} color="#B8860B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("activeLawFirms")} value={activeFirms?.pagination.total ?? "—"} icon={<BusinessIcon />} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={t("registeredCourts")} value={courts?.pagination.total ?? "—"} icon={<GavelIcon />} color="#1E3A5F" />
        </Grid>
      </Grid>

      {/* Pending approvals preview -- surfaces the most actionable thing on
          this dashboard instead of leaving it buried in a separate page. */}
      {(pendingFirms?.items.length ?? 0) > 0 && (
        <Paper elevation={0} sx={{ border: "1px solid #FDE68A", bgcolor: "#FFFBEB", borderRadius: 3, p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Pending Approvals
            </Typography>
            <Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />} onClick={() => navigate("/law-firms?status=PENDING")}>
              View All
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pendingFirms!.items.slice(0, 4).map((firm) => (
              <Box
                key={firm.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#fff",
                  borderRadius: 2,
                  p: 1.5,
                  border: "1px solid #FEF3C7",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#B8860B", fontSize: 15 }}>{firm.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {firm.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {firm.email ?? "No email"} · {firm.tenantType === "EDUCATION" ? "Institution" : "Law Firm"}
                    </Typography>
                  </Box>
                </Box>
                <Chip label="Pending" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 600 }} />
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
