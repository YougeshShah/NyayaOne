import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { useUpdateProfile, useMyProfile } from "../src/hooks";
import { profileApi } from "../src/api";
import { SERVER_ORIGIN } from "../src/api/client";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== (user?.email || "").toLowerCase();

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
    } catch {
      Alert.alert("Error", "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }
    if (emailChanged && !currentPassword) {
      Alert.alert("Password required", "Enter your current password to confirm the email change.");
      return;
    }
    updateProfile.mutate(
      {
        fullName,
        phone: phone || undefined,
        bio: bio || undefined,
        email: emailChanged ? email.trim() : undefined,
        currentPassword: currentPassword || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Profile updated.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not update profile.");
        },
      }
    );
  };

  const avatarUrl = (user as any)?.avatarUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, alignItems: "center" }}>
      <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl.startsWith("http") ? avatarUrl : `${SERVER_ORIGIN}/uploads/${avatarUrl}` }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{fullName?.charAt(0) ?? "U"}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      {uploadingAvatar && <Text style={styles.uploadingText}>Uploading...</Text>}

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="A short line about yourself"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />

        {emailChanged && (
          <>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Required to confirm email change"
              placeholderTextColor="#9CA3AF"
            />
          </>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateProfile.isPending}>
          <Text style={styles.saveButtonText}>{updateProfile.isPending ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  avatarWrap: { marginTop: 8, marginBottom: 4 },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  avatarInitial: { color: "#fff", fontSize: 32, fontWeight: "700" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#2563EB", borderRadius: 12, width: 26, height: 26, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#F9FAFB" },
  uploadingText: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  bioInput: { minHeight: 70, textAlignVertical: "top" },
  saveButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
