import { Alert, Box, Button, Paper, TextField, Typography, Link as MuiLink , IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";
import { detectInstitutionSlug } from "../../utils/detectInstitutionSlug";
import { LoginPayload } from "../../types/auth.types";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useLogin();
  const { register, handleSubmit, formState } = useForm<LoginPayload>();

  const onSubmit = (values: LoginPayload) => {
    const institutionSlug = detectInstitutionSlug();
    login.mutate({ ...values, institutionSlug }, { onSuccess: () => navigate("/") });
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
      <Paper elevation={0} sx={{ p: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 0.5 }}>
          NyayaOne Learn
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Law, IELTS, IOE, Doctors, Loksewa — exam prep, all in one place
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {login.isError && (
            <Alert severity="error">
              {(login.error as any)?.response?.data?.message || "Login failed. Please check your credentials."}
            </Alert>
          )}
          <TextField label="Email" type="email" required fullWidth {...register("email", { required: true })} error={!!formState.errors.email} />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            fullWidth
            {...register("password", { required: true })}
            error={!!formState.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          <MuiLink component={Link} to="/forgot-password">
            Forgot password?
          </MuiLink>
        </Typography>

        <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
          New here?{" "}
          <MuiLink component={Link} to="/register">
            Create an account
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
