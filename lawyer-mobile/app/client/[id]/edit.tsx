import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useClient, useUpdateClient } from "../../../src/hooks/useDomainData";
import { colors, spacing, radius } from "../../../src/theme/theme";

export default function EditClientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client, isLoading } = useClient(id);
  const updateClient = useUpdateClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (client) {
      setFullName(client.fullName || "");
      setPhone(client.phone || "");
      setEmail(client.email || "");
      setAddress(client.address || "");
    }
  }, [client]);

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing field", "Client full name is required.");
      return;
    }
    updateClient.mutate(
      { id: id as string, payload: { fullName, phone: phone || undefined, email: email || undefined, address: address || undefined } },
      {
        onSuccess: () => {
          Alert.alert("Success", "Client updated successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not update client.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Full Name *</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#9CA3AF" />
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" />
      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholderTextColor="#9CA3AF" />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={updateClient.isPending}>
        <Text style={styles.submitText}>{updateClient.isPending ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
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
  submitButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: "center", marginTop: spacing.xl },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
