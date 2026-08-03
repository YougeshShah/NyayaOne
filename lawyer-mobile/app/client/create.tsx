import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useCreateClient } from "../../src/hooks/useDomainData";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";

export default function CreateClientScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const createClient = useCreateClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [identificationType, setIdentificationType] = useState("");
  const [identificationNo, setIdentificationNo] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert("Missing field", "Client full name is required.");
      return;
    }
    createClient.mutate(
      {
        fullName,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        identificationType: identificationType || undefined,
        identificationNo: identificationNo || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Client added successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Could not add client.");
        },
      }
    );
  };

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

      <Text style={styles.label}>Identification Type</Text>
      <TextInput
        style={styles.input}
        value={identificationType}
        onChangeText={setIdentificationType}
        placeholder="e.g. Citizenship"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Identification No.</Text>
      <TextInput style={styles.input} value={identificationNo} onChangeText={setIdentificationNo} placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={createClient.isPending}>
        <Text style={styles.submitText}>{createClient.isPending ? "Saving..." : "Add Client"}</Text>
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
