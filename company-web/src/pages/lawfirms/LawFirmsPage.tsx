import { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useLawFirms, useLawFirmActions } from "../../hooks/useLawFirms";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LawFirmStatus } from "../../types/lawfirm.types";

const STATUS_OPTIONS: (LawFirmStatus | "ALL")[] = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];

export function LawFirmsPage() {
  const [status, setStatus] = useState<LawFirmStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLawFirms({
    status: status === "ALL" ? undefined : status,
    search: search || undefined,
    page: 1,
  });

  const { approve, suspend, activate } = useLawFirmActions();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Law Firm Management
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value as LawFirmStatus | "ALL")}
          sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search by name or email"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Firm Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Users</TableCell>
              <TableCell align="center">Cases</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No law firms found
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((firm) => (
              <TableRow key={firm.id} hover>
                <TableCell>{firm.name}</TableCell>
                <TableCell>{firm.email}</TableCell>
                <TableCell>
                  <StatusBadge status={firm.status} />
                </TableCell>
                <TableCell align="center">{firm.stats.totalUsers}</TableCell>
                <TableCell align="center">{firm.stats.totalCases}</TableCell>
                <TableCell align="right">
                  {firm.status === "PENDING" && (
                    <Button size="small" variant="contained" onClick={() => approve.mutate(firm.id)} disabled={approve.isPending}>
                      Approve
                    </Button>
                  )}
                  {firm.status === "ACTIVE" && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => suspend.mutate({ id: firm.id })}
                      disabled={suspend.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                  {firm.status === "SUSPENDED" && (
                    <Button size="small" variant="contained" onClick={() => activate.mutate(firm.id)} disabled={activate.isPending}>
                      Reactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
