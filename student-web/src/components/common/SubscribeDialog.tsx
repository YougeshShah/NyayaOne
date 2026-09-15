import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Box, Typography, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "../../api/payment.api";
import { institutionFeeApi } from "../../api/institutionFee.api";

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export function SubscribeDialog({ open, onClose, courseId, courseName }: SubscribeDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"ESEWA" | "KHALTI" | null>(null);
  const [error, setError] = useState("");

  // Real fee for THIS student's institution (falls back to Company's
  // default price if the institution hasn't set its own) -- never a
  // student-editable amount, since that would let them set their own price.
  const { data: amountDue, isLoading: loadingFee } = useQuery({
    queryKey: ["amount-due", courseId],
    queryFn: () => institutionFeeApi.myAmountDue(courseId),
    enabled: open,
  });
  const amount = amountDue?.amountDue ?? 0;

  const payWithEsewa = async () => {
    setLoading("ESEWA");
    setError("");
    try {
      const { formUrl, fields } = await paymentApi.initiateEsewa(courseId, amount);
      const form = document.createElement("form");
      form.method = "POST";
      form.action = formUrl;
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start eSewa payment.");
      setLoading(null);
    }
  };

  const payWithKhalti = async () => {
    setLoading("KHALTI");
    setError("");
    try {
      const { paymentUrl } = await paymentApi.initiateKhalti(courseId, amount);
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start Khalti payment.");
      setLoading(null);
    }
  };

  const uploadVoucher = () => {
    onClose();
    navigate(`/payment/voucher?courseId=${courseId}`);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Subscribe to {courseName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loadingFee ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              NPR {amount}
            </Typography>
            {amountDue?.discount ? (
              <Typography variant="caption" color="success.main" sx={{ display: "block", mb: 2 }}>
                Discount of NPR {amountDue.discount} applied.
              </Typography>
            ) : (
              <Box sx={{ mb: 2 }} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Choose a payment method:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: "#60BB46", "&:hover": { bgcolor: "#4E9938" } }}
                onClick={payWithEsewa}
                disabled={!!loading}
              >
                {loading === "ESEWA" ? "Redirecting..." : "Pay with eSewa"}
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: "#5C2D91", "&:hover": { bgcolor: "#4A2374" } }}
                onClick={payWithKhalti}
                disabled={!!loading}
              >
                {loading === "KHALTI" ? "Redirecting..." : "Pay with Khalti"}
              </Button>
              <Button variant="outlined" fullWidth onClick={uploadVoucher} disabled={!!loading}>
                Paid by Bank Transfer / Cash? Upload Voucher
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={!!loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
