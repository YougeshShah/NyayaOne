import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantRoleApi, TenantRoleWithPermissions } from "../src/api/tenantRole.api";
import { colors, spacing, radius } from "../src/theme/theme";

export default function RolesScreen() {
  const queryClient = useQueryClient();
  const { data: roles, isLoading } = useQuery({ queryKey: ["tenant-roles"], queryFn: () => tenantRoleApi.listRoles() });
  const { data: permissions } = useQuery({ queryKey: ["tenant-permissions"], queryFn: () => tenantRoleApi.listPermissions() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tenant-roles"] });
  const createRole = useMutation({ mutationFn: tenantRoleApi.createRole, onSuccess: invalidate });
  const updatePermissions = useMutation({
    mutationFn: ({ roleId, keys }: { roleId: string; keys: string[] }) => tenantRoleApi.updateRolePermissions(roleId, keys),
    onSuccess: invalidate,
  });
  const deleteRole = useMutation({ mutationFn: tenantRoleApi.deleteRole, onSuccess: invalidate });

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editingRole, setEditingRole] = useState<TenantRoleWithPermissions | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const openEdit = (role: TenantRoleWithPermissions) => {
    setEditingRole(role);
    setSelectedKeys(role.permissionKeys);
  };

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const grouped = (permissions ?? []).reduce<Record<string, typeof permissions>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {} as any);

  const handleDelete = (role: TenantRoleWithPermissions) => {
    Alert.alert("Delete Role?", `Delete "${role.name}"? Staff assigned this role will lose these permissions.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteRole.mutate(role.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roles & Permissions</Text>
        <TouchableOpacity onPress={() => setAddOpen(true)}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={roles ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Text style={styles.emptyText}>No roles created yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleName}>{item.name}</Text>
                {item.description ? <Text style={styles.roleDesc}>{item.description}</Text> : null}
                <Text style={styles.permCount}>{item.permissionKeys.length} permission(s)</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Role Modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Role</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput style={styles.modalInput} value={newName} onChangeText={setNewName} placeholderTextColor="#9CA3AF" />
            <Text style={styles.modalLabel}>Description (optional)</Text>
            <TextInput style={styles.modalInput} value={newDesc} onChangeText={setNewDesc} placeholderTextColor="#9CA3AF" />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (!newName.trim()) {
                  Alert.alert("Missing name", "Please enter a role name.");
                  return;
                }
                createRole.mutate(
                  { name: newName, description: newDesc || undefined },
                  {
                    onSuccess: () => {
                      setAddOpen(false);
                      setNewName("");
                      setNewDesc("");
                    },
                    onError: (err: any) => Alert.alert("Error", err?.response?.data?.message || "Could not create role."),
                  }
                );
              }}
              disabled={createRole.isPending}
            >
              <Text style={styles.saveButtonText}>{createRole.isPending ? "Creating..." : "Create Role"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal visible={!!editingRole} transparent animationType="slide" onRequestClose={() => setEditingRole(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>{editingRole?.name} — Permissions</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {Object.entries(grouped).map(([module, perms]) => (
                <View key={module} style={{ marginBottom: spacing.md }}>
                  <Text style={styles.moduleTitle}>{module}</Text>
                  {(perms ?? []).map((p) => (
                    <TouchableOpacity key={p.key} style={styles.permRow} onPress={() => toggleKey(p.key)}>
                      <Ionicons
                        name={selectedKeys.includes(p.key) ? "checkbox" : "square-outline"}
                        size={20}
                        color={selectedKeys.includes(p.key) ? colors.primary : colors.textSecondary}
                      />
                      <Text style={styles.permLabel}>{p.description || p.key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (!editingRole) return;
                updatePermissions.mutate(
                  { roleId: editingRole.id, keys: selectedKeys },
                  {
                    onSuccess: () => setEditingRole(null),
                    onError: (err: any) => Alert.alert("Error", err?.response?.data?.message || "Could not update permissions."),
                  }
                );
              }}
              disabled={updatePermissions.isPending}
            >
              <Text style={styles.saveButtonText}>{updatePermissions.isPending ? "Saving..." : "Save Permissions"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingRole(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  roleName: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  roleDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  permCount: { fontSize: 11, color: colors.primary, marginTop: 4, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.sm },
  modalLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, fontSize: 14, color: colors.textPrimary },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
  moduleTitle: { fontSize: 12, fontWeight: "700", color: colors.primary, textTransform: "uppercase", marginBottom: 6 },
  permRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  permLabel: { fontSize: 13, color: colors.textPrimary, flex: 1 },
});
