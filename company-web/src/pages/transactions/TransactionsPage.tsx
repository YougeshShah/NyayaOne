import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  TextField,
} from "@mui/material";
import { transactionApi } from "../../api/transaction.api";

const statusColors: Record<string, "default" | "success" | "error" | "warning"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

export function TransactionsPage() {
  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", status, gateway],
    queryFn: () => transactionApi.list({ status: status || undefined, gateway: gateway || undefined }),
  });

  const totalRevenue = (data?.items ?? [])
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Payment Transactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Total completed (this page): <strong>NPR {totalRevenue.toLocaleString()}</strong>
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField select label="Status" size="small" sx={{ minWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </TextField>
        <TextField select label="Gateway" size="small" sx={{ minWidth: 160 }} value={gateway} onChange={(e) => setGateway(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ESEWA">eSewa</MenuItem>
          <MenuItem value="KHALTI">Khalti</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Gateway</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Date</TableCell>
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
            {data?.items.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>
                  {t.student.fullName}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {t.student.email}
                  </Typography>
                </TableCell>
                <TableCell>{t.course.name}</TableCell>
                <TableCell>{t.gateway === "ESEWA" ? "eSewa" : "Khalti"}</TableCell>
                <TableCell align="right">NPR {t.amount.toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Chip label={t.status} size="small" color={statusColors[t.status]} />
                </TableCell>
                <TableCell align="right">{new Date(t.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions yet — payment gateway is likely not activated (see Grant Subscription for manual access).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
