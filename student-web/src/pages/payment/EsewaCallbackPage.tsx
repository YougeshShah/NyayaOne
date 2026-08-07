import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { paymentApi } from "../../api/payment.api";

export function EsewaCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      setStatus("error");
      setMessage("No payment data received.");
      return;
    }
    paymentApi
      .verifyEsewa(data)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Payment verification failed.");
      });
  }, [searchParams]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
      {status === "verifying" && (
        <>
          <CircularProgress />
          <Typography>Verifying your payment...</Typography>
        </>
      )}
      {status === "success" && (
        <>
          <Typography variant="h5" fontWeight={700}>
            🎉 Payment Successful
          </Typography>
          <Typography color="text.secondary">Your subscription is now active.</Typography>
          <Button variant="contained" onClick={() => navigate("/")}>
            Go to My Courses
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <Typography variant="h5" fontWeight={700} color="error">
            Payment Verification Failed
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
          <Button variant="outlined" onClick={() => navigate("/")}>
            Back to Courses
          </Button>
        </>
      )}
    </Box>
  );
}
