import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
  IconButton,
  Skeleton,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TuneIcon from "@mui/icons-material/Tune";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { useMyProfile, useUpdateProfile, useChangePassword, useUploadAvatar } from "../../hooks/useProfile";
import { getAvatarUrl } from "../../api/profile.api";
import { useTranslation } from "../../i18n/LanguageContext";

interface ProfileFormValues {
  fullName: string;
  phone: string;
  bio: string;
  barRegistrationNo: string;
  specialization: string;
}
interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  LAW_FIRM_ADMIN: "Organization Admin",
  LAWYER: "Lawyer",
  STAFF: "Staff",
  CLIENT: "Client",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

export function ProfilePage() {
  const authUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const { language, setLanguage } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: { fullName: "", phone: "", bio: "", barRegistrationNo: "", specialization: "" },
  });
  const passwordForm = useForm<PasswordFormValues>();

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName,
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        barRegistrationNo: profile.barRegistrationNo ?? "",
        specialization: profile.specialization ?? "",
      });
    }
  }, [profile]);

  const isLawyer = (profile ?? authUser)?.accountType === "LAWYER";

  const onSaveProfile = (values: ProfileFormValues) => {
    updateProfile.mutate({
      fullName: values.fullName,
      phone: values.phone || undefined,
      bio: values.bio || undefined,
      ...(isLawyer ? { barRegistrationNo: values.barRegistrationNo || undefined, specialization: values.specialization || undefined } : {}),
    });
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

  const displayUser = profile ?? authUser;
  const roleLabel = displayUser?.accountType ? ACCOUNT_TYPE_LABELS[displayUser.accountType] ?? displayUser.accountType : "";

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar src={getAvatarUrl(displayUser?.avatarUrl)} sx={{ width: 80, height: 80, fontSize: 32 }}>
              {displayUser?.fullName?.charAt(0) ?? "U"}
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
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {displayUser?.fullName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              {roleLabel && <Chip label={roleLabel} size="small" color="primary" variant="outlined" />}
              {profile?.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Member since {formatDate(profile.createdAt)}
                </Typography>
              )}
            </Box>
            {uploadAvatar.isPending && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Uploading...
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonOutlineIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={700}>
            Personal Information
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="rectangular" height={180} />
        ) : (
          <Box component="form" onSubmit={profileForm.handleSubmit(onSaveProfile)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {updateProfile.isSuccess && <Alert severity="success">Profile updated successfully.</Alert>}
            <TextField label="Full Name" fullWidth {...profileForm.register("fullName", { required: true })} />
            <TextField label="Phone" fullWidth {...profileForm.register("phone")} />
            {isLawyer && (
              <>
                <TextField label="Bar Registration No." fullWidth {...profileForm.register("barRegistrationNo")} />
                <TextField label="Specialization" fullWidth {...profileForm.register("specialization")} />
              </>
            )}
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={3}
              placeholder="A short line about yourself"
              helperText="Shown on your profile — optional"
              {...profileForm.register("bio")}
            />
            <Box>
              <Button type="submit" variant="contained" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ShieldOutlinedIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={700}>
            Account Security
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Email" fullWidth value={displayUser?.email || ""} disabled helperText="Email cannot be changed" />
          {profile?.lastLoginAt !== undefined && (
            <Typography variant="body2" color="text.secondary">
              Last login: {formatRelativeTime(profile.lastLoginAt)}
            </Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" fontWeight={600}>
            Change Password
          </Typography>
          <Box component="form" onSubmit={passwordForm.handleSubmit(onChangePassword)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {passwordSuccess && <Alert severity="success">Password changed successfully.</Alert>}
            {changePassword.isError && (
              <Alert severity="error">{(changePassword.error as any)?.response?.data?.message || "Failed to change password"}</Alert>
            )}
            <TextField label="Current Password" type="password" fullWidth {...passwordForm.register("currentPassword", { required: true })} />
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
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TuneIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={700}>
            Preferences
          </Typography>
        </Box>
        <TextField select label="Language" value={language} onChange={(e) => setLanguage(e.target.value as any)} sx={{ minWidth: 220 }}>
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ne">नेपाली (Nepali)</MenuItem>
        </TextField>
      </Paper>
    </Box>
  );
}
