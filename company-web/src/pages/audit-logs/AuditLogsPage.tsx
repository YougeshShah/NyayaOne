import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { AuditLog } from "../../types/auditLog.types";

export function AuditLogsPage() {
  const [entityType, setEntityType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
                <TableCell align="right">
                  <Button size="small" onClick={() => setSelectedLog(log)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Audit Log Detail</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Action
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {selectedLog?.action.replace(/_/g, " ")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Entity
            </Typography>
            <Typography variant="body2">
              {selectedLog?.entityType} {selectedLog?.entityId ? `(${selectedLog.entityId})` : ""}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Performed By
            </Typography>
            <Typography variant="body2">
              {selectedLog?.user ? `${selectedLog.user.fullName} — ${selectedLog.user.email} (${selectedLog.user.accountType})` : "System"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              When
            </Typography>
            <Typography variant="body2">{selectedLog ? new Date(selectedLog.createdAt).toLocaleString() : ""}</Typography>
          </Box>
          {selectedLog?.metadata && Object.keys(selectedLog.metadata).length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Additional Details
              </Typography>
              <Box component="pre" sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1, fontSize: 12, overflow: "auto", maxHeight: 240 }}>
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSelectedLog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
