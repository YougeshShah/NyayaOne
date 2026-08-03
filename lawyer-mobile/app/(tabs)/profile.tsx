import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useLogout } from "../../src/hooks/useAuth";
import { useChangePassword } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { colors, spacing, radius } from "../../src/theme/theme";
import { registerForPushNotifications, sendTestPush } from "../../src/utils/pushNotifications";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const changePassword = useChangePassword();
  const { t, language, setLanguage } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const handleTestPush = async () => {
    setSendingTest(true);
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert("Not available", "Push notifications require a physical device with notifications enabled.");
        return;
      }
      await sendTestPush(token);
      Alert.alert("Sent", "Test notification sent — it should arrive within a few seconds.");
    } catch {
      Alert.alert("Error", "Could not send test notification.");
    } finally {
      setSendingTest(false);
    }
  };
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const submitChangePassword = () => {
    if (newPassword.length < 8) {
      Alert.alert("Too short", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password changed successfully.");
          resetForm();
          setModalOpen(false);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not change password.");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? "U"}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <InfoRow label={t("role")} value="Lawyer" />
        <InfoRow label={t("accountStatus")} value={user?.lawFirmStatus || "—"} />
      </Card>

      <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/edit-profile")}>
        <Ionicons name="person-outline" size={20} color={colors.primary} />
        <Text style={styles.actionButtonText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={() => setLanguage(language === "en" ? "ne" : "en")}>
        <Ionicons name="language-outline" size={20} color={colors.primary} />
        <Text style={styles.actionButtonText}>{t("language")}</Text>
        <Text style={styles.langValue}>{language === "en" ? "English" : "नेपाली"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={() => setModalOpen(true)}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
        <Text style={styles.actionButtonText}>{t("changePassword")}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleTestPush} disabled={sendingTest}>
        <Ionicons name="notifications-outline" size={20} color={colors.primary} />
        <Text style={styles.actionButtonText}>{sendingTest ? "Sending..." : t("sendTestNotification")}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>{t("logout")}</Text>
      </TouchableOpacity>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.modalLabel}>Current Password</Text>
            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Minimum 8 characters"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter new password"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity style={styles.saveButton} onPress={submitChangePassword} disabled={changePassword.isPending}>
              <Text style={styles.saveButtonText}>{changePassword.isPending ? "Saving..." : "Save Password"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                resetForm();
                setModalOpen(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  avatarWrap: { alignItems: "center", marginVertical: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButtonText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  langValue: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.sm },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 14,
  },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
});
