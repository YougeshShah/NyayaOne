import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { profileApi } from "../../src/api";
import { SERVER_ORIGIN } from "../../src/api/client";
import { useMySubscriptions } from "../../src/hooks";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useUpdateProfile, useChangePassword } from "../../src/hooks";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { data: subscriptions } = useMySubscriptions();
  const hasLawSubscription = subscriptions?.some(
    (s: any) => s.course?.category === "LAW" && (s.status === "ACTIVE" || s.status === "TRIAL")
  );

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to change your profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploadingAvatar(true);
    try {
      const uploaded = await profileApi.uploadAvatar(result.assets[0].uri);
      updateUser({ avatarUrl: uploaded.avatarUrl } as any);
      Alert.alert("Success", "Profile picture updated.");
    } catch {
      Alert.alert("Error", "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatar}>
        {(user as any)?.avatarUrl ? (
          <Image
            source={{
              uri: (user as any).avatarUrl.startsWith("http")
                ? (user as any).avatarUrl
                : `${SERVER_ORIGIN}/uploads/${(user as any).avatarUrl}`,
            }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? "S"}</Text>
        )}
        <View style={styles.avatarCameraBadge}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/edit-profile")}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/change-password")}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </TouchableOpacity>

      {hasLawSubscription && (
        <TouchableOpacity style={styles.saveButton} onPress={() => router.push("/precedents")}>
          <Text style={styles.saveButtonText}>नजिर खोज (Precedent Search)</Text>
        </TouchableOpacity>
      )}

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
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarCameraBadge: { position: "absolute", bottom: -2, right: -2, backgroundColor: "#2563EB", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", alignSelf: "flex-start", marginBottom: 8, marginTop: 8, color: "#374151" },
  navButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 14, marginBottom: 10 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, width: "100%", borderWidth: 1, borderColor: "#E5E7EB" },
  saveButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 12, width: "100%", alignItems: "center", marginBottom: 20 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  logoutButton: { backgroundColor: "#FEE2E2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 12 },
  logoutText: { color: "#DC2626", fontWeight: "700" },
});
