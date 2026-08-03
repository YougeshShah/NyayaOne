import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { useUpdateProfile } from "../src/hooks/useDomainData";
import { colors, spacing, radius } from "../src/theme/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing name", "Full name cannot be empty.");
      return;
    }
    updateProfile.mutate(
      { fullName, phone: phone || undefined },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Profile updated successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not update profile.");
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Email (cannot be changed)</Text>
      <View style={[styles.input, styles.disabledInput]}>
        <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateProfile.isPending}>
        <Text style={styles.saveButtonText}>{updateProfile.isPending ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  disabledInput: { backgroundColor: "#F3F4F6", justifyContent: "center" },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
