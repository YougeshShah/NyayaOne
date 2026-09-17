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
  Grid,
  Button,
} from "@mui/material";
import { apiClient } from "../../api/client";

const statusColors: Record<string, "default" | "success" | "error" | "warning"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

const TYPE_LABEL: Record<string, string> = {
  COURSE: "Course Payment",
  SUBSCRIPTION: "Org. Subscription",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2, height: "100%" }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }}>{value}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </Paper>
  );
}

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["billing-summary"],
    queryFn: async () => {
      const { data } = await apiClient.get("/payment/billing-summary");
      return data.data;
    },
  });

  const { data: txData, isLoading } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/payment/all-transactions", { params: { limit: 100 } });
      return data.data;
    },
  });

  const filteredItems = (txData?.items ?? []).filter((t: any) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Billing
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Revenue (All Time)" value={`NPR ${(summary?.totalRevenue ?? 0).toLocaleString()}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Revenue This Month" value={`NPR ${(summary?.totalRevenueThisMonth ?? 0).toLocaleString()}`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Course Revenue"
            value={`NPR ${(summary?.courseRevenue ?? 0).toLocaleString()}`}
            sub="From student course payments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Subscription Revenue"
            value={`NPR ${(summary?.firmRevenue ?? 0).toLocaleString()}`}
            sub="From org. subscriptions"
          />
        </Grid>
      </Grid>

      {(summary?.pendingVoucherCount ?? 0) > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#FFF8E1", border: "1px solid #F0D98A", borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">
            {summary.pendingVoucherCount} organization voucher(s) awaiting your review.
          </Typography>
          <Button size="small" variant="outlined" href="/firm-vouchers">
            Review Vouchers
          </Button>
        </Paper>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField select label="Type" size="small" sx={{ minWidth: 180 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="COURSE">Course Payments</MenuItem>
          <MenuItem value="SUBSCRIPTION">Org. Subscriptions</MenuItem>
        </TextField>
        <TextField select label="Status" size="small" sx={{ minWidth: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Payer</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Gateway</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            )}
            {filteredItems.map((t: any) => (
              <TableRow key={t.id} hover>
                <TableCell>
                  <Chip label={TYPE_LABEL[t.type]} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {t.payerName}
                  {t.payerEmail && (
                    <Typography variant="caption" display="block" color="text.secondary">{t.payerEmail}</Typography>
                  )}
                </TableCell>
                <TableCell>{t.itemName}</TableCell>
                <TableCell>
                  {t.gateway === "ESEWA" ? "eSewa" : t.gateway === "KHALTI" ? "Khalti" : "Voucher"}
                  {t.voucherFileUrl && (
                    <Button size="small" component="a" href={t.voucherFileUrl} target="_blank" rel="noopener noreferrer" sx={{ ml: 1, minWidth: 0, p: 0 }}>
                      View
                    </Button>
                  )}
                </TableCell>
                <TableCell align="right">NPR {t.amount.toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Chip label={t.status} size="small" color={statusColors[t.status]} />
                </TableCell>
                <TableCell align="right">{new Date(t.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No transactions match this filter.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
