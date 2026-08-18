import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { useUpdateProfile } from "../src/hooks";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }
    updateProfile.mutate(
      { fullName, phone: phone || undefined },
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Email (cannot be changed)</Text>
      <View style={[styles.input, styles.disabledInput]}>
        <Text style={{ color: "#6B7280" }}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateProfile.isPending}>
        <Text style={styles.saveButtonText}>{updateProfile.isPending ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  disabledInput: { backgroundColor: "#F3F4F6", justifyContent: "center" },
  saveButton: { backgroundColor: "#2563EB", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
