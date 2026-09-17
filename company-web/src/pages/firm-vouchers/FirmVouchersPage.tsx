import { Box, Button, Typography, Paper, Chip } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

export function FirmVouchersPage() {
  const queryClient = useQueryClient();

  const { data: vouchers } = useQuery({
    queryKey: ["pending-firm-vouchers"],
    queryFn: async () => {
      const { data } = await apiClient.get("/firm-payment/pending-vouchers");
      return data.data;
    },
  });

  const review = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => apiClient.patch(`/firm-payment/vouchers/${id}/review`, { approve }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-firm-vouchers"] }),
  });

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Organization Subscription Vouchers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manually-uploaded receipts from law firms/institutions paying for their platform subscription. Verify the
        receipt is real before approving — approval activates their subscription immediately.
      </Typography>

      {(vouchers ?? []).length === 0 && (
        <Typography variant="body2" color="text.secondary">No pending vouchers.</Typography>
      )}
      {(vouchers ?? []).map((v: any) => (
        <Paper key={v.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="body1" fontWeight={600}>{v.lawFirm.name}</Typography>
              <Typography variant="body2" color="text.secondary">{v.plan.name} — NPR {v.amount}</Typography>
              <Chip label="PENDING" size="small" color="warning" sx={{ mt: 1 }} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {v.voucherFileUrl && (
                <Button size="small" variant="outlined" component="a" href={v.voucherFileUrl} target="_blank" rel="noopener noreferrer">
                  View Receipt
                </Button>
              )}
              <Button size="small" variant="contained" onClick={() => review.mutate({ id: v.id, approve: true })}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => review.mutate({ id: v.id, approve: false })}>
                Reject
              </Button>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
