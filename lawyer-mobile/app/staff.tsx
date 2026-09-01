import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFirmUsers, useFirmUserActions } from "../src/hooks/useDomainData";
import { colors, spacing, radius } from "../src/theme/theme";
import { FirmUser } from "../src/api/domain.api";

const statusColor: Record<string, string> = {
  ACTIVE: "#059669",
  INACTIVE: "#6B7280",
  SUSPENDED: "#DC2626",
  PENDING_VERIFICATION: "#D97706",
};

export default function StaffScreen() {
  const { data, isLoading } = useFirmUsers({});
  const { create, updateStatus, resetPassword } = useFirmUserActions();
  const [addOpen, setAddOpen] = useState(false);
  const [tempPasswordShown, setTempPasswordShown] = useState<{ email: string; password: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"LAWYER" | "STAFF">("LAWYER");
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setAccountType("LAWYER");
  };

  const handleAdd = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in name, email, and password.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password too short", "Password must be at least 8 characters.");
      return;
    }
    create.mutate(
      { fullName, email, phone: phone || undefined, password, accountType },
      {
        onSuccess: () => {
          setAddOpen(false);
          resetForm();
          Alert.alert("Success", `${accountType === "LAWYER" ? "Lawyer" : "Staff"} added successfully.`);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not add user.");
        },
      }
    );
  };

  const handleResetPassword = (user: FirmUser) => {
    Alert.alert("Reset Password?", `Generate a new temporary password for ${user.fullName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: () => {
          resetPassword.mutate(user.id, {
            onSuccess: (result) => {
              setTempPasswordShown({ email: user.email, password: result.newPassword });
            },
            onError: () => Alert.alert("Error", "Could not reset password."),
          });
        },
      },
    ]);
  };

  const handleToggleStatus = (user: FirmUser) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateStatus.mutate({ id: user.id, status: newStatus });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff & Lawyers</Text>
        <TouchableOpacity onPress={() => setAddOpen(true)}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Text style={styles.emptyText}>No staff or lawyers added yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.rowTags}>
                  <View style={[styles.tag, { backgroundColor: colors.primary + "1A" }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.accountType}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: (statusColor[item.status] ?? "#6B7280") + "1A" }]}>
                    <Text style={[styles.tagText, { color: statusColor[item.status] ?? "#6B7280" }]}>{item.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleResetPassword(item)} style={styles.actionBtn}>
                  <Ionicons name="key-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggleStatus(item)} style={styles.actionBtn}>
                  <Ionicons
                    name={item.status === "ACTIVE" ? "pause-circle-outline" : "play-circle-outline"}
                    size={18}
                    color={item.status === "ACTIVE" ? "#DC2626" : "#059669"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Staff/Lawyer Modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Staff / Lawyer</Text>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, accountType === "LAWYER" && styles.typeBtnActive]}
                onPress={() => setAccountType("LAWYER")}
              >
                <Text style={[styles.typeBtnText, accountType === "LAWYER" && styles.typeBtnTextActive]}>Lawyer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, accountType === "STAFF" && styles.typeBtnActive]}
                onPress={() => setAccountType("STAFF")}
              >
                <Text style={[styles.typeBtnText, accountType === "STAFF" && styles.typeBtnTextActive]}>Staff</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput style={styles.modalInput} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput style={styles.modalInput} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />

            <Text style={styles.modalLabel}>Phone (optional)</Text>
            <TextInput style={styles.modalInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

            <Text style={styles.modalLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAdd} disabled={create.isPending}>
              <Text style={styles.saveButtonText}>{create.isPending ? "Adding..." : "Add User"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setAddOpen(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Temp Password Result Modal */}
      <Modal visible={!!tempPasswordShown} transparent animationType="fade" onRequestClose={() => setTempPasswordShown(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Password Reset</Text>
            <Text style={styles.modalLabel}>{tempPasswordShown?.email} can now log in with:</Text>
            <View style={styles.passwordDisplay}>
              <Text style={styles.passwordDisplayText}>{tempPasswordShown?.password}</Text>
            </View>
            <Text style={styles.warningText}>Save this password now — it will not be shown again.</Text>
            <TouchableOpacity style={styles.saveButton} onPress={() => setTempPasswordShown(null)}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowTags: { flexDirection: "row", gap: 6, marginTop: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, maxHeight: "85%" },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.sm },
  typeToggle: { flexDirection: "row", backgroundColor: colors.background, borderRadius: radius.sm, padding: 3, marginBottom: spacing.sm },
  typeBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: radius.sm - 2 },
  typeBtnActive: { backgroundColor: colors.primary },
  typeBtnText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  typeBtnTextActive: { color: "#fff" },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, color: colors.textPrimary },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  passwordInput: { flex: 1, padding: spacing.sm, fontSize: 14 },
  eyeButton: { paddingHorizontal: 10, paddingVertical: 10 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
  passwordDisplay: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.md, alignItems: "center", marginVertical: spacing.sm },
  passwordDisplayText: { fontSize: 20, fontWeight: "800", color: colors.primary, letterSpacing: 1 },
  warningText: { fontSize: 12, color: "#D97706", textAlign: "center", marginBottom: spacing.sm },
});
