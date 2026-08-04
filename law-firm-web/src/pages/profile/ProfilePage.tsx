import { useRef, useState } from "react";
import { Alert, Avatar, Box, Button, Divider, Paper, TextField, Typography, IconButton } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { useUpdateProfile, useChangePassword, useUploadAvatar } from "../../hooks/useProfile";
import { getAvatarUrl } from "../../api/profile.api";

interface ProfileFormValues {
  fullName: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: { fullName: user?.fullName || "", phone: user?.phone || "" },
  });
  const passwordForm = useForm<PasswordFormValues>();

  const onSaveProfile = (values: ProfileFormValues) => {
    updateProfile.mutate({ fullName: values.fullName, phone: values.phone || undefined });
  };

  const onChangePassword = (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess(true);
          passwordForm.reset();
        },
      }
    );
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar src={getAvatarUrl(user?.avatarUrl)} sx={{ width: 72, height: 72, fontSize: 28 }}>
              {user?.fullName?.charAt(0) ?? "U"}
            </Avatar>
            <IconButton
              size="small"
              onClick={handleAvatarClick}
              sx={{ position: "absolute", bottom: -4, right: -4, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            {uploadAvatar.isPending && (
              <Typography variant="caption" color="text.secondary">
                Uploading...
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={profileForm.handleSubmit(onSaveProfile)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {updateProfile.isSuccess && <Alert severity="success">Profile updated successfully.</Alert>}
          <TextField label="Full Name" fullWidth {...profileForm.register("fullName", { required: true })} />
          <TextField label="Phone" fullWidth {...profileForm.register("phone")} />
          <TextField label="Email" fullWidth value={user?.email || ""} disabled helperText="Email cannot be changed" />
          <Box>
            <Button type="submit" variant="contained" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <Box component="form" onSubmit={passwordForm.handleSubmit(onChangePassword)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {passwordSuccess && <Alert severity="success">Password changed successfully.</Alert>}
          {changePassword.isError && (
            <Alert severity="error">{(changePassword.error as any)?.response?.data?.message || "Failed to change password"}</Alert>
          )}
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            {...passwordForm.register("currentPassword", { required: true })}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            helperText="Minimum 8 characters"
            {...passwordForm.register("newPassword", { required: true, minLength: 8 })}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            error={!!passwordForm.formState.errors.confirmPassword}
            helperText={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword", { required: true })}
          />
          <Box>
            <Button type="submit" variant="contained" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Changing..." : "Change Password"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
