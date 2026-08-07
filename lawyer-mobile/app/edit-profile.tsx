import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { useUpdateProfile } from "../src/hooks/useDomainData";
import { colors, spacing, radius } from "../src/theme/theme";
import { useTranslation } from "../src/i18n/LanguageContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [barRegistrationNo, setBarRegistrationNo] = useState("");
  const [specialization, setSpecialization] = useState("");

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert(t("missingName"), t("missingNameMsg"));
      return;
    }
    updateProfile.mutate(
      {
        fullName,
        phone: phone || undefined,
        barRegistrationNo: barRegistrationNo || undefined,
        specialization: specialization || undefined,
      },
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.label}>{t("fullName")}</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>{t("phone")}</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

      {user?.accountType === "LAWYER" && (
        <>
          <Text style={styles.label}>{t("barRegistrationNo")}</Text>
          <TextInput style={styles.input} value={barRegistrationNo} onChangeText={setBarRegistrationNo} placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>{t("specialization")}</Text>
          <TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} placeholderTextColor="#9CA3AF" />
        </>
      )}

      <Text style={styles.label}>{t("emailCannotBeChanged")}</Text>
      <View style={[styles.input, styles.disabledInput]}>
        <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateProfile.isPending}>
        <Text style={styles.saveButtonText}>{updateProfile.isPending ? t("saving") : t("saveChanges")}</Text>
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
