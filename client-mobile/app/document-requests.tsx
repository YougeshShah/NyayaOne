import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../src/api/client";

interface DocRequest {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  createdAt: string;
  case?: { caseNumber: string };
}

const STATUS_COLORS: Record<string, string> = { PENDING: "#F59E0B", FULFILLED: "#10B981", CANCELLED: "#9CA3AF" };

export default function DocumentRequestsScreen() {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-document-requests"],
    queryFn: async () => (await apiClient.get("/client-portal/document-requests")).data.data as DocRequest[],
  });

  const fulfillRequest = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: DocumentPicker.DocumentPickerAsset }) => {
      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType || "application/octet-stream" } as any);
      return apiClient.post(`/client-portal/document-requests/${id}/fulfill`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-document-requests"] });
      Alert.alert("Submitted", "Your document was uploaded successfully.");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.message || "Could not upload this document.");
    },
    onSettled: () => setUploadingId(null),
  });

  const handleFulfill = async (id: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"] });
    if (result.canceled || !result.assets?.[0]) return;
    setUploadingId(id);
    fulfillRequest.mutate({ id, file: result.assets[0] });
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} color="#2563EB" />}
      <FlatList
        data={requests ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No document requests from your lawyer yet.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.statusPillText}>{item.status}</Text>
              </View>
            </View>
            {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
            {item.case ? <Text style={styles.cardMeta}>Case: {item.case.caseNumber}</Text> : null}
            {item.status === "PENDING" && (
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleFulfill(item.id)} disabled={uploadingId === item.id}>
                {uploadingId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                    <Text style={styles.uploadButtonText}>Upload This Document</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  list: { padding: 16, paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1 },
  cardDesc: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  cardMeta: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  uploadButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#2563EB", borderRadius: 8, paddingVertical: 10, marginTop: 10 },
  uploadButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
