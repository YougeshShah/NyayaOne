import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography, Link as MuiLink } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/useAuth";
import { RegisterPayload } from "../../types/auth.types";
import { publicCourseApi } from "../../api/publicCourse.api";
import { detectInstitutionSlug } from "../../utils/detectInstitutionSlug";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState } = useForm<RegisterPayload>();
  const { data: courses } = useQuery({ queryKey: ["public-courses"], queryFn: () => publicCourseApi.list() });

  const onSubmit = (values: RegisterPayload) => {
    const institutionSlug = detectInstitutionSlug();
    registerMutation.mutate({ ...values, institutionSlug }, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => navigate("/verify-email", { state: { email: values.email } }), 1500);
      },
    });
  };

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
          Create Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Free to join — pick a course and start practicing right away
        </Typography>

        {success ? (
          <Alert severity="success">Account created! Redirecting to login...</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {registerMutation.isError && (
              <Alert severity="error">
                {(() => {
                  const respData = (registerMutation.error as any)?.response?.data;
                  const fieldErrors = respData?.errors as { field: string; message: string }[] | undefined;
                  if (fieldErrors && fieldErrors.length > 0) {
                    return fieldErrors.map((e) => `${e.field}: ${e.message}`).join(" — ");
                  }
                  return respData?.message || "Registration failed";
                })()}
              </Alert>
            )}
            <TextField label="Full Name" required fullWidth {...register("fullName", { required: true })} error={!!formState.errors.fullName} />
            <TextField label="Email" type="email" required fullWidth {...register("email", { required: true })} error={!!formState.errors.email} />
            <TextField label="Phone (optional)" fullWidth {...register("phone")} />

            {courses && courses.length > 0 && (
              <TextField select label="What are you preparing for? (optional)" fullWidth defaultValue="" {...register("interestedCourseId")}>
                <MenuItem value="">Not sure yet — I'll browse</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              helperText="Minimum 8 characters"
              {...register("password", { required: true, minLength: 8 })}
              error={!!formState.errors.password}
            />
            <Button type="submit" variant="contained" size="large" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Already have an account?{" "}
          <MuiLink component={Link} to="/login">
            Sign in
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
