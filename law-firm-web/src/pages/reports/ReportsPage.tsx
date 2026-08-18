import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
  const navigate = useNavigate();
  const [caseStatus, setCaseStatus] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const [casesList, setCasesList] = useState<any[] | null>(null);
  const [hearingsList, setHearingsList] = useState<any[] | null>(null);
  const [clientsList, setClientsList] = useState<any[] | null>(null);
  const [loadingList, setLoadingList] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      await fn();
    } catch {
      setError("Could not generate the report. Please try again.");
    }
  };

  const handleViewCases = async () => {
    setLoadingList("cases");
    setError(null);
    try {
      const items = await reportApi.listCases(caseStatus === "ALL" ? undefined : caseStatus);
      setCasesList(items);
    } catch {
      setError("Could not load the case list. Please try again.");
    } finally {
      setLoadingList(null);
    }
  };

  const handleViewHearings = async () => {
    setLoadingList("hearings");
    setError(null);
    try {
      const items = await reportApi.listHearings();
      setHearingsList(items);
    } catch {
      setError("Could not load the hearings list. Please try again.");
    } finally {
      setLoadingList(null);
    }
  };

  const handleViewClients = async () => {
    setLoadingList("clients");
    setError(null);
    try {
      const items = await reportApi.listClients();
      setClientsList(items);
    } catch {
      setError("Could not load the client list. Please try again.");
    } finally {
      setLoadingList(null);
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
              onChange={(e) => {
                setCaseStatus(e.target.value);
                setCasesList(null); // stale list -- filter changed, hide until re-viewed
              }}
              sx={{ mb: 2 }}
            >
              {CASE_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
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
            <Button fullWidth variant="text" startIcon={<VisibilityIcon />} onClick={handleViewCases} disabled={loadingList === "cases"}>
              {loadingList === "cases" ? "Loading..." : "View List"}
            </Button>
          </ReportCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard title="Upcoming Hearings" description="Export all scheduled hearings from today onward.">
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadHearings("excel"))}>
                Excel
              </Button>
              <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadHearings("pdf"))}>
                PDF
              </Button>
            </Box>
            <Button fullWidth variant="text" startIcon={<VisibilityIcon />} onClick={handleViewHearings} disabled={loadingList === "hearings"}>
              {loadingList === "hearings" ? "Loading..." : "View List"}
            </Button>
          </ReportCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard title="Client Report" description="Export the full client list with case counts.">
            <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={() => handle(() => reportApi.downloadClients())} sx={{ mb: 1 }}>
              Download Excel
            </Button>
            <Button fullWidth variant="text" startIcon={<VisibilityIcon />} onClick={handleViewClients} disabled={loadingList === "clients"}>
              {loadingList === "clients" ? "Loading..." : "View List"}
            </Button>
          </ReportCard>
        </Grid>
      </Grid>

      {loadingList && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {casesList && (
        <Paper elevation={0} sx={{ mt: 3, border: "1px solid #e5e7eb" }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ p: 2 }}>
            Cases ({casesList.length}) — click a row to open
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Court</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Client(s)</TableCell>
                  <TableCell>Lead Lawyer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {casesList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No cases match this filter.
                    </TableCell>
                  </TableRow>
                )}
                {casesList.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/cases/${c.id}`)}>
                    <TableCell>{c.caseNumber}</TableCell>
                    <TableCell>{c.caseTitle}</TableCell>
                    <TableCell>{c.court?.name || "—"}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{c.clients?.map((cl: any) => cl.client?.fullName).join(", ") || "—"}</TableCell>
                    <TableCell>{c.lawyers?.[0]?.lawyer?.fullName || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {hearingsList && (
        <Paper elevation={0} sx={{ mt: 3, border: "1px solid #e5e7eb" }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ p: 2 }}>
            Upcoming Hearings ({hearingsList.length}) — click a row to open the case
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Case Number</TableCell>
                  <TableCell>Case Title</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hearingsList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No upcoming hearings.
                    </TableCell>
                  </TableRow>
                )}
                {hearingsList.map((h) => (
                  <TableRow key={h.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/cases/${h.caseId}`)}>
                    <TableCell>{new Date(h.hearingDate).toLocaleString()}</TableCell>
                    <TableCell>{h.case?.caseNumber}</TableCell>
                    <TableCell>{h.case?.caseTitle}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {clientsList && (
        <Paper elevation={0} sx={{ mt: 3, border: "1px solid #e5e7eb" }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ p: 2 }}>
            Clients ({clientsList.length}) — click a row to open
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Cases</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientsList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No clients yet.
                    </TableCell>
                  </TableRow>
                )}
                {clientsList.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/clients`)}>
                    <TableCell>{c.fullName}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell>{c._count?.cases ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
