import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useChangePassword } from "../src/hooks";

export default function ChangePasswordScreen() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "New password and confirmation must match.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password changed.");
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Failed to change password.");
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark-outline" size={32} color="#2563EB" />
      </View>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>Choose a strong password to keep your account secure</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputField}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
            placeholder="Enter current password"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} style={styles.eyeButton}>
            <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputField}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            placeholder="Min 8 characters"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={styles.eyeButton}>
            <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputField}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Re-enter new password"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeButton}>
            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={changePassword.isPending}>
          <Text style={styles.saveButtonText}>{changePassword.isPending ? "Changing..." : "Change Password"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { alignItems: "center", padding: 24, paddingTop: 40 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 28, paddingHorizontal: 16 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 12, marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10 },
  inputField: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827" },
  eyeButton: { paddingHorizontal: 12, paddingVertical: 10 },
  saveButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
