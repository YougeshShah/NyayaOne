import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClients, useInviteClient } from "../../src/hooks/useDomainData";
import { Card } from "../../src/components/Card";
import { colors, spacing, radius } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";
import { Client } from "../../src/types";

export default function ClientsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useClients(search || undefined);
  const inviteClient = useInviteClient();

  const [invitingClient, setInvitingClient] = useState<Client | null>(null);
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const openInviteModal = (client: Client) => {
    setInvitingClient(client);
    setInvitePassword("");
  };

  const submitInvite = () => {
    if (!invitingClient || invitePassword.length < 8) {
      Alert.alert("Password too short", "Password must be at least 8 characters.");
      return;
    }
    inviteClient.mutate(
      { id: invitingClient.id, password: invitePassword },
      {
        onSuccess: () => {
          Alert.alert(
            "Portal Access Granted",
            `Share these login details with ${invitingClient.fullName} securely:\n\nEmail: ${invitingClient.email}\nPassword: ${invitePassword}`
          );
          setInvitingClient(null);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || "Failed to grant access.");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t("searchClients")}
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.sm }}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}
            {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}
            <View style={styles.bottomRow}>
              <Text style={styles.caseCount}>{item._count?.cases ?? 0} case(s)</Text>
              {item.userId ? (
                <View style={styles.accessBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.accessBadgeText}>App Access Granted</Text>
                </View>
              ) : item.email ? (
                <TouchableOpacity style={styles.inviteButton} onPress={() => openInviteModal(item)}>
                  <Ionicons name="key-outline" size={14} color={colors.primary} />
                  <Text style={styles.inviteButtonText}>Grant App Access</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noEmailText}>Add email to grant app access</Text>
              )}
            </View>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>{t("noClientsFound")}</Text> : <Text style={styles.emptyText}>{t("loading")}</Text>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/client/create")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={!!invitingClient} transparent animationType="slide" onRequestClose={() => setInvitingClient(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Grant App Access</Text>
            <Text style={styles.modalSubtitle}>
              {invitingClient?.fullName} will be able to log into the Client Mobile App with this email and password.
            </Text>
            <Text style={styles.modalLabel}>Email</Text>
            <View style={[styles.modalInput, styles.disabledInput]}>
              <Text style={{ color: colors.textSecondary }}>{invitingClient?.email}</Text>
            </View>
            <Text style={styles.modalLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={invitePassword}
                onChangeText={setInvitePassword}
                secureTextEntry={!showPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={submitInvite} disabled={inviteClient.isPending}>
              <Text style={styles.saveButtonText}>{inviteClient.isPending ? "Granting..." : "Grant Access"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setInvitingClient(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  caseCount: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  accessBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  accessBadgeText: { fontSize: 11, color: "#059669", fontWeight: "600" },
  inviteButton: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${colors.primary}1A`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  inviteButtonText: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  noEmailText: { fontSize: 11, color: "#9CA3AF", fontStyle: "italic" },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginBottom: 6 },
  modalSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14 },
  disabledInput: { backgroundColor: "#F3F4F6", justifyContent: "center" },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  passwordInput: { flex: 1, padding: spacing.sm, fontSize: 14 },
  eyeButton: { paddingHorizontal: 10, paddingVertical: 10 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
});
