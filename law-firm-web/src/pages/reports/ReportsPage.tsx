import { useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography, Grid, Alert } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { reportApi } from "../../api/report.api";

const CASE_STATUS_OPTIONS = ["ALL", "OPEN", "ONGOING", "ON_HOLD", "CLOSED", "DISMISSED"];

function ReportCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", height: "100%" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {children}
    </Paper>
  );
}

export function ReportsPage() {
  const [caseStatus, setCaseStatus] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      await fn();
    } catch {
      setError("Could not generate the report. Please try again.");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ReportCard title="Case Report" description="Export all cases, optionally filtered by status.">
            <TextField
              select
              size="small"
              label="Status Filter"
              fullWidth
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              {CASE_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handle(() => reportApi.downloadCases("excel", caseStatus === "ALL" ? undefined : caseStatus))}
              >
                Excel
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handle(() => reportApi.downloadCases("pdf", caseStatus === "ALL" ? undefined : caseStatus))}
              >
                PDF
              </Button>
            </Box>
          </ReportCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ReportCard title="Upcoming Hearings" description="Export all scheduled hearings from today onward.">
            <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
              <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadHearings("excel"))}>
                Excel
              </Button>
              <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadHearings("pdf"))}>
                PDF
              </Button>
            </Box>
          </ReportCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ReportCard title="Client Report" description="Export the full client list with case counts.">
            <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadClients())}>
              Download Excel
            </Button>
          </ReportCard>
        </Grid>
      </Grid>
    </Box>
  );
}
