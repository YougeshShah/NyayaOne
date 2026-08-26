import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { authExtraApi } from "../src/api/authExtra.api";
import { useAuthStore } from "../src/store/authStore";

export default function DeleteAccountScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState("");

  const deleteAccount = useMutation({
    mutationFn: (pw: string) => authExtraApi.deleteAccount(pw),
    onSuccess: () => {
      Alert.alert("Account Deleted", "Your account has been deleted.", [
        {
          text: "OK",
          onPress: () => {
            logout();
            router.replace("/(auth)/login");
          },
        },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.message || "Failed to delete account.");
    },
  });

  const handleDelete = () => {
    if (!password) {
      Alert.alert("Password required", "Enter your password to confirm.");
      return;
    }
    Alert.alert("Are you sure?", "This will permanently delete your account. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAccount.mutate(password) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.warningBox}>
        <Ionicons name="warning-outline" size={24} color="#DC2626" />
        <Text style={styles.warningText}>
          Deleting your account is permanent. Your personal information will be removed, and you will lose access to your cases,
          clients, and documents.
        </Text>
      </View>

      <Text style={styles.label}>Enter your password to confirm</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleteAccount.isPending}>
        <Text style={styles.deleteButtonText}>{deleteAccount.isPending ? "Deleting..." : "Delete My Account"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  warningBox: { flexDirection: "row", backgroundColor: "#FEF2F2", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#FECACA", marginBottom: 24 },
  warningText: { flex: 1, marginLeft: 12, color: "#991B1B", fontSize: 13, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#111827" },
  deleteButton: { backgroundColor: "#DC2626", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  deleteButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelButton: { paddingVertical: 15, alignItems: "center", marginTop: 8 },
  cancelButtonText: { color: "#6B7280", fontWeight: "600", fontSize: 15 },
});
