import { useForm } from "react-hook-form";
import { Alert, Box, Button, Paper, TextField, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { useLogin } from "../../hooks/useAuth";
import { LoginPayload } from "../../types/auth.types";
import { PasswordField } from "../../components/common/PasswordField";

export function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginPayload>();
  const loginMutation = useLogin();

  const onSubmit = (data: LoginPayload) => {
    loginMutation.mutate({ ...data, asCompany: true });
  };

  return (
    <div className={styles.loginContainer}>
      <Paper elevation={8} className={styles.loginCard}>
        <div className={styles.logoWrap}>
          <Typography variant="h4" className={styles.brandTitle}>
            NyayaOne
          </Typography>
          <Typography className={styles.brandSubtitle}>Company Control Center — Technocraftx</Typography>
        </div>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(loginMutation.error as any)?.response?.data?.message || "Login failed. Please try again."}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            margin="normal"
            {...register("email", { required: true })}
            error={!!formState.errors.email}
            helperText={formState.errors.email ? "Email is required" : ""}
          />

          <PasswordField
            label="Password"
            required
            fullWidth
            margin="normal"
            {...register("password", { required: true })}
            error={!!formState.errors.password}
            helperText={formState.errors.password ? "Password is required" : ""}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, py: 1.3 }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          <MuiLink component={Link} to="/forgot-password">
            Forgot password?
          </MuiLink>
        </Typography>
      </Paper>
    </div>
  );
}
