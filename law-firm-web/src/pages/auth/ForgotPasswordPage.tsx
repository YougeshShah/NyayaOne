import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { detectInstitutionSlug } from "../../utils/detectInstitutionSlug";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const requestCode = useMutation({
    mutationFn: () => apiClient.post("/email-verification/send-code", { email, purpose: "PASSWORD_RESET" }),
    onSuccess: () => setStep("reset"),
  });

  const resetPassword = useMutation({
    mutationFn: () => apiClient.post("/email-verification/reset-password", { email, code, newPassword, institutionSlug: detectInstitutionSlug() }),
    onSuccess: () => setSuccess(true),
  });

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F9FAFB" }}>
      <Paper elevation={0} sx={{ p: 4, width: 420, borderRadius: 3, border: "1px solid #E5E7EB" }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 0.5 }}>
          {step === "request" ? "Forgot Password" : "Reset Password"}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          {step === "request" ? "Enter your email and we'll send you a code" : "Enter the code and your new password"}
        </Typography>

        {success ? (
          <Alert severity="success">Password reset successfully. You can now log in with your new password.</Alert>
        ) : step === "request" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {requestCode.isError && <Alert severity="error">Something went wrong. Please try again.</Alert>}
            <TextField label="Email" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="contained" size="large" onClick={() => requestCode.mutate()} disabled={requestCode.isPending || !email}>
              {requestCode.isPending ? "Sending..." : "Send Code"}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {resetPassword.isError && <Alert severity="error">Invalid or expired code. Please try again.</Alert>}
            <TextField
              label="6-Digit Code"
              required
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: "center" } }}
            />
            <TextField
              label="New Password"
              type="password"
              required
              fullWidth
              helperText="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => resetPassword.mutate()}
              disabled={resetPassword.isPending || code.length !== 6 || newPassword.length < 8}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
