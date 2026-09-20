import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../src/store/authStore";
import { useUpdateProfile, useMyProfile, useUploadAvatar } from "../src/hooks/useDomainData";
import { colors, spacing, radius } from "../src/theme/theme";
import { useTranslation } from "../src/i18n/LanguageContext";
import Constants from "expo-constants";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [barRegistrationNo, setBarRegistrationNo] = useState("");
  const [specialization, setSpecialization] = useState("");
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
    uploadAvatar.mutate(result.assets[0].uri, {
      onError: () => Alert.alert("Error", "Failed to upload profile picture."),
      onSettled: () => setUploadingAvatar(false),
    });
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert(t("missingName"), t("missingNameMsg"));
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
        barRegistrationNo: barRegistrationNo || undefined,
        specialization: specialization || undefined,
        email: emailChanged ? email.trim() : undefined,
        currentPassword: currentPassword || undefined,
      } as any,
      {
        onSuccess: () => {
          Alert.alert(t("saved"), t("profileUpdated"));
          router.back();
        },
        onError: (err: any) => {
          Alert.alert(t("error"), err?.response?.data?.message || t("couldNotUpdateProfile"));
        },
      }
    );
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const apiBaseUrl = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";
  const serverOrigin = apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, alignItems: "center" }}>
      <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl.startsWith("http") ? avatarUrl : `${serverOrigin}/uploads/${avatarUrl}` }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{fullName?.charAt(0) ?? "U"}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={13} color="#fff" />
        </View>
      </TouchableOpacity>
      {uploadingAvatar && <Text style={styles.uploadingText}>Uploading...</Text>}

      <View style={styles.card}>
        <Text style={styles.label}>{t("fullName")}</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>{t("phone")}</Text>
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

        {user?.accountType === "LAWYER" && (
          <>
            <Text style={styles.label}>{t("barRegistrationNo")}</Text>
            <TextInput style={styles.input} value={barRegistrationNo} onChangeText={setBarRegistrationNo} placeholderTextColor="#9CA3AF" />
            <Text style={styles.label}>{t("specialization")}</Text>
            <TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} placeholderTextColor="#9CA3AF" />
          </>
        )}

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
          <Text style={styles.saveButtonText}>{updateProfile.isPending ? t("saving") : t("saveChanges")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  avatarWrap: { marginTop: spacing.sm, marginBottom: 4 },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
  avatarPlaceholder: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  avatarInitial: { color: "#fff", fontSize: 30, fontWeight: "700" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.background },
  uploadingText: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  card: { width: "100%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  bioInput: { minHeight: 70, textAlignVertical: "top" },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
