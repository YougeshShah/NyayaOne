import { useState } from "react";
import {
  Box,
  Chip,
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
import { useAuditLogs, useAuditLogEntityTypes } from "../../hooks/useAuditLogs";

export function AuditLogsPage() {
  const [entityType, setEntityType] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAuditLogs({
    entityType: entityType === "ALL" ? undefined : entityType,
    search: search || undefined,
    page: 1,
  });
  const { data: entityTypes } = useAuditLogEntityTypes();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Audit Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {data?.pagination.total ?? 0} recorded actions
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Entity Type" size="small" value={entityType} onChange={(e) => setEntityType(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="ALL">All Types</MenuItem>
          {entityTypes?.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Search by action" size="small" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>When</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Chip size="small" label={log.action.replace(/_/g, " ")} variant="outlined" />
                </TableCell>
                <TableCell>{log.entityType}</TableCell>
                <TableCell>{log.user ? `${log.user.fullName} (${log.user.accountType})` : "System"}</TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
