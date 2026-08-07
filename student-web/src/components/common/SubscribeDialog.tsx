import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Box, Typography } from "@mui/material";
import { paymentApi } from "../../api/payment.api";

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export function SubscribeDialog({ open, onClose, courseId, courseName }: SubscribeDialogProps) {
  const [amount, setAmount] = useState(999);
  const [loading, setLoading] = useState<"ESEWA" | "KHALTI" | null>(null);
  const [error, setError] = useState("");

  const payWithEsewa = async () => {
    setLoading("ESEWA");
    setError("");
    try {
      const { formUrl, fields } = await paymentApi.initiateEsewa(courseId, amount);
      // eSewa requires an actual HTML form POST (not fetch/XHR) — build one
      // in memory and submit it, which navigates the browser to eSewa.
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Subscribe to {courseName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Amount (NPR)"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          sx={{ mb: 2 }}
        />
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={!!loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
