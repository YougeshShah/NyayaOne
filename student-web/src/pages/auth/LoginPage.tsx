import { Alert, Box, Button, Paper, TextField, Typography, Link as MuiLink } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";
import { LoginPayload } from "../../types/auth.types";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const { register, handleSubmit, formState } = useForm<LoginPayload>();

  const onSubmit = (values: LoginPayload) => {
    login.mutate(values, { onSuccess: () => navigate("/") });
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
          <TextField label="Password" type="password" required fullWidth {...register("password", { required: true })} error={!!formState.errors.password} />
          <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          New here?{" "}
          <MuiLink component={Link} to="/register">
            Create an account
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
