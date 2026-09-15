import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentVoucherApi, PendingVoucher } from "../../api/paymentVoucher.api";
import { apiClient } from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export function PaymentVouchersPage() {
  const { data: vouchers, isLoading } = useQuery({ queryKey: ["pending-vouchers"], queryFn: () => paymentVoucherApi.pending() });
  const queryClient = useQueryClient();

  const [rejecting, setRejecting] = useState<PendingVoucher | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const approve = useMutation({
    mutationFn: (id: string) => paymentVoucherApi.review(id, "APPROVED"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-vouchers"] }),
  });
  const reject = useMutation({
    mutationFn: () => paymentVoucherApi.review(rejecting!.id, "REJECTED", rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-vouchers"] });
      setRejecting(null);
      setRejectionReason("");
    },
  });

  const viewFile = (id: string) => {
    const base = apiClient.defaults.baseURL;
    const token = useAuthStore.getState().accessToken || "";
    window.open(`${base}/payment-vouchers/${id}/file?token=${encodeURIComponent(token)}`, "_blank");
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Payment Vouchers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review receipts uploaded by students for manual payments (bank transfer/cash). Approving grants access to
        exactly the course they paid for.
      </Typography>

      {!isLoading && (vouchers ?? []).length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No pending vouchers.
        </Typography>
      )}

      {(vouchers ?? []).map((v) => (
        <Paper key={v.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {v.student.fullName} <Chip label={v.course.name} size="small" sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.student.email} · Submitted {new Date(v.submittedAt).toLocaleDateString()}
                {v.amount ? ` · Rs. ${v.amount}` : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => viewFile(v.id)}>
                View Receipt
              </Button>
              <Button size="small" variant="contained" color="success" onClick={() => approve.mutate(v.id)} disabled={approve.isPending}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => setRejecting(v)}>
                Reject
              </Button>
            </Box>
          </Box>
        </Paper>
      ))}

      <Dialog open={!!rejecting} onClose={() => setRejecting(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject Voucher</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => reject.mutate()} disabled={!rejectionReason || reject.isPending}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
