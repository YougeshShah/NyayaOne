import { useState } from "react";
import { Alert, Box, Button, Paper, TextField, Typography, Link as MuiLink } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth.api";

interface FormValues {
  email: string;
  note?: string;
}

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>();

  const requestReset = useMutation({
    mutationFn: (values: FormValues) => authApi.requestPasswordReset(values.email, values.note),
    onSuccess: () => setSubmitted(true),
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
          Forgot Password?
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          We don't have automatic email reset set up yet — submit your email below and your institution (or our
          support team) will reset it for you directly.
        </Typography>

        {submitted ? (
          <Alert severity="success">
            Request submitted. Your institution admin or our support team will reach out to reset your password
            shortly.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit((v) => requestReset.mutate(v))} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {requestReset.isError && <Alert severity="error">Something went wrong — please try again.</Alert>}
            <TextField
              label="Your Account Email"
              type="email"
              required
              fullWidth
              {...register("email", { required: true })}
              error={!!formState.errors.email}
            />
            <TextField
              label="Note (optional)"
              fullWidth
              multiline
              rows={2}
              placeholder="Anything that helps us find your account faster"
              {...register("note")}
            />
            <Button type="submit" variant="contained" size="large" disabled={requestReset.isPending}>
              {requestReset.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          <MuiLink component={Link} to="/login">
            Back to Sign In
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
