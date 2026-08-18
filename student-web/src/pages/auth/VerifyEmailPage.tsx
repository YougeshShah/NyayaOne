import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Alert, Box, Button, Paper, TextField, Typography, Link as MuiLink } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { emailVerificationApi } from "../../api/emailVerification.api";

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);

  const verify = useMutation({
    mutationFn: () => emailVerificationApi.verifyEmail(email, code),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    },
  });

  const resend = useMutation({
    mutationFn: () => emailVerificationApi.sendCode(email, "REGISTRATION"),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
      }}
    >
      <Paper elevation={0} sx={{ p: 4, width: 420, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 0.5 }}>
          Verify Your Email
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          We sent a 6-digit code to your email. Enter it below to activate your account.
        </Typography>

        {success ? (
          <Alert severity="success">Email verified! Redirecting to login...</Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {verify.isError && <Alert severity="error">Invalid or expired code. Please try again.</Alert>}
            {resend.isSuccess && <Alert severity="success">A new code has been sent.</Alert>}

            <TextField label="Email" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField
              label="6-Digit Code"
              required
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: "center" } }}
            />
            <Button variant="contained" size="large" onClick={() => verify.mutate()} disabled={verify.isPending || code.length !== 6 || !email}>
              {verify.isPending ? "Verifying..." : "Verify Email"}
            </Button>
            <Button variant="text" onClick={() => resend.mutate()} disabled={resend.isPending || !email}>
              {resend.isPending ? "Sending..." : "Resend Code"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          <MuiLink component={Link} to="/login">
            Back to Login
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
