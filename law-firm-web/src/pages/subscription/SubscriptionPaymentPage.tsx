import { useState } from "react";
import { Box, Button, Typography, Paper, Chip, TextField, Alert, MenuItem } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { firmPaymentApi } from "../../api/firmPayment.api";
import { useAuthStore } from "../../store/authStore";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number | null;
  maxLawyers: number | null;
  maxCases: number | null;
}

const STATUS_COLOR: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

export function SubscriptionPaymentPage() {
  const user = useAuthStore((s) => s.user);
  const isEducation = user?.tenantType === "EDUCATION";
  const memberLabel = isEducation ? "staff" : "lawyers";
  const itemLabel = isEducation ? "courses" : "cases";
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<"ESEWA" | "KHALTI" | "VOUCHER" | null>(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: plans } = useQuery({
    queryKey: ["firm-subscription-plans"],
    queryFn: async () => {
      const { data } = await apiClient.get("/firm-payment/plans");
      return data.data as Plan[];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["firm-payment-transactions"],
    queryFn: () => firmPaymentApi.myTransactions(),
  });

  const payWithEsewa = async () => {
    if (!selectedPlan?.priceMonthly) return;
    setLoading("ESEWA");
    setError("");
    try {
      const { formUrl, fields } = await firmPaymentApi.initiateEsewa(selectedPlan.id, selectedPlan.priceMonthly);
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
    if (!selectedPlan?.priceMonthly) return;
    setLoading("KHALTI");
    setError("");
    try {
      const { paymentUrl } = await firmPaymentApi.initiateKhalti(selectedPlan.id, selectedPlan.priceMonthly);
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not start Khalti payment.");
      setLoading(null);
    }
  };

  const uploadVoucher = useMutation({
    mutationFn: () => firmPaymentApi.uploadVoucher(selectedPlan!.id, selectedPlan!.priceMonthly!, file!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firm-payment-transactions"] });
      setFile(null);
      setSelectedPlan(null);
    },
  });

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Subscription & Billing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a plan and pay to keep your institution's TechnoOne subscription active.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        {(plans ?? []).map((p) => (
          <Paper
            key={p.id}
            elevation={0}
            onClick={() => setSelectedPlan(p)}
            sx={{
              p: 2.5,
              border: selectedPlan?.id === p.id ? "2px solid #1d4ed8" : "1px solid #E5E7EB",
              borderRadius: 2,
              cursor: "pointer",
              width: 200,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>{p.name}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ my: 1 }}>
              {p.priceMonthly ? `NPR ${p.priceMonthly}/mo` : "Contact Us"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {p.maxLawyers ? `${p.maxLawyers} ${memberLabel}` : `Unlimited ${memberLabel}`} · {p.maxCases ? `${p.maxCases} ${itemLabel}` : `Unlimited ${itemLabel}`}
            </Typography>
          </Paper>
        ))}
      </Box>

      {selectedPlan?.priceMonthly && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E5E7EB", borderRadius: 2, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Pay NPR {selectedPlan.priceMonthly} for {selectedPlan.name}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 320 }}>
            <Button variant="contained" sx={{ bgcolor: "#60BB46", "&:hover": { bgcolor: "#4E9938" } }} onClick={payWithEsewa} disabled={!!loading}>
              {loading === "ESEWA" ? "Redirecting..." : "Pay with eSewa"}
            </Button>
            <Button variant="contained" sx={{ bgcolor: "#5C2D91", "&:hover": { bgcolor: "#4A2374" } }} onClick={payWithKhalti} disabled={!!loading}>
              {loading === "KHALTI" ? "Redirecting..." : "Pay with Khalti"}
            </Button>
            <Button variant="outlined" component="label" disabled={!!loading}>
              {file ? file.name : "Choose Receipt (Bank Transfer / Cash)"}
              <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </Button>
            {file && (
              <Button variant="contained" onClick={() => uploadVoucher.mutate()} disabled={uploadVoucher.isPending}>
                {uploadVoucher.isPending ? "Uploading..." : "Submit Voucher for Review"}
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Payment History
      </Typography>
      {(transactions ?? []).map((t: any) => (
        <Paper key={t.id} elevation={0} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 2, mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>{t.plan.name} — NPR {t.amount}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t.gateway} · {new Date(t.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip label={t.status} size="small" color={STATUS_COLOR[t.status]} />
          </Box>
        </Paper>
      ))}
      {(transactions ?? []).length === 0 && (
        <Typography variant="body2" color="text.secondary">No payments yet.</Typography>
      )}
    </Box>
  );
}
