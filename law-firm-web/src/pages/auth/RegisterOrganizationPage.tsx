import { useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";

interface RegisterOrgForm {
  lawFirmName: string;
  lawFirmEmail: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone?: string;
  password: string;
  tenantType: "LAW_FIRM" | "EDUCATION";
}

export function RegisterOrganizationPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<RegisterOrgForm>({ defaultValues: { tenantType: "LAW_FIRM" } });

  const onSubmit = async (values: RegisterOrgForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/auth/register/law-firm", values);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F9FAFB", p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, width: 480, borderRadius: 3, border: "1px solid #E5E7EB" }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 0.5 }}>
          Register Your Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Law firm or educational institution — your account will be reviewed and approved by our team
        </Typography>

        {success ? (
          <Alert severity="success">
            Registration submitted! Once approved, you'll receive an email with a verification code to activate your account.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Organization Type" required fullWidth defaultValue="LAW_FIRM" {...register("tenantType", { required: true })}>
              <MenuItem value="LAW_FIRM">Law Firm</MenuItem>
              <MenuItem value="EDUCATION">Educational Institution</MenuItem>
            </TextField>
            <TextField label="Organization Name" required fullWidth {...register("lawFirmName", { required: true })} error={!!formState.errors.lawFirmName} />
            <TextField label="Organization Email" type="email" required fullWidth {...register("lawFirmEmail", { required: true })} error={!!formState.errors.lawFirmEmail} />
            <TextField label="Admin Full Name" required fullWidth {...register("adminFullName", { required: true })} error={!!formState.errors.adminFullName} />
            <TextField label="Admin Email" type="email" required fullWidth {...register("adminEmail", { required: true })} error={!!formState.errors.adminEmail} />
            <TextField label="Admin Phone (optional)" fullWidth {...register("adminPhone")} />
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              helperText="Minimum 8 characters"
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? "Submitting..." : "Register Organization"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2563EB" }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
