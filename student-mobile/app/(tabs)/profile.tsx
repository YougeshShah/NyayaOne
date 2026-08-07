import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useUpdateProfile, useChangePassword } from "../../src/hooks";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { fullName, phone },
      { onSuccess: () => Alert.alert("Saved", "Profile updated.") }
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password changed.");
          setCurrentPassword("");
          setNewPassword("");
        },
        onError: () => Alert.alert("Error", "Failed to change password."),
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? "S"}</Text>
      </View>
      <Text style={styles.email}>{user?.email}</Text>

      <Text style={styles.sectionTitle}>Edit Profile</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={updateProfile.isPending}>
        <Text style={styles.saveButtonText}>{updateProfile.isPending ? "Saving..." : "Save Profile"}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change Password</Text>
      <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
      <TextInput style={styles.input} placeholder="New Password (min 8 chars)" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={changePassword.isPending}>
        <Text style={styles.saveButtonText}>{changePassword.isPending ? "Changing..." : "Change Password"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 24, backgroundColor: "#F8FAFC" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", alignSelf: "flex-start", marginBottom: 8, marginTop: 8, color: "#374151" },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, width: "100%", borderWidth: 1, borderColor: "#E5E7EB" },
  saveButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 12, width: "100%", alignItems: "center", marginBottom: 20 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  logoutButton: { backgroundColor: "#FEE2E2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 12 },
  logoutText: { color: "#DC2626", fontWeight: "700" },
});
