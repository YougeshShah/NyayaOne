import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ticketApi } from "../../src/api/ticket.api";
import { colors, spacing, radius } from "../../src/theme/theme";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

interface PendingFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export default function NewTicketScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to attach a screenshot.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_ATTACHMENT_BYTES) {
      Alert.alert("File too large", "Maximum attachment size is 8MB.");
      return;
    }
    const fileName = asset.uri.split("/").pop() || "screenshot.jpg";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeType = asset.mimeType || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
    setPendingFile({ uri: asset.uri, name: fileName, mimeType, size: asset.fileSize });
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"] });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_ATTACHMENT_BYTES) {
      Alert.alert("File too large", "Maximum attachment size is 8MB.");
      return;
    }
    setPendingFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType || "application/pdf", size: asset.size });
  };

  const handleAttach = () => {
    Alert.alert("Attach", "What would you like to attach?", [
      { text: "Photo / Screenshot", onPress: pickImage },
      { text: "Document (PDF)", onPress: pickDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim() || submitting) return;
    setSubmitting(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;
      if (pendingFile) {
        const uploaded = await ticketApi.uploadAttachment(pendingFile.uri, pendingFile.mimeType, pendingFile.name);
        attachmentUrl = uploaded.attachmentUrl;
        attachmentType = uploaded.attachmentType;
      }
      const ticket = await ticketApi.create(subject.trim(), description.trim(), attachmentUrl, attachmentType);
      router.replace({ pathname: "/tickets/[id]", params: { id: ticket.id } });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Could not open ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="Brief summary of the issue"
        placeholderTextColor="#9CA3AF"
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue in detail..."
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
      />

      {pendingFile ? (
        <View style={styles.pendingRow}>
          <Ionicons name={pendingFile.mimeType.startsWith("image/") ? "image-outline" : "document-outline"} size={18} color={colors.textSecondary} />
          <Text style={styles.pendingName} numberOfLines={1}>{pendingFile.name}</Text>
          <TouchableOpacity onPress={() => setPendingFile(null)}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.attachButton} onPress={handleAttach}>
          <Ionicons name="attach" size={18} color={colors.primary} />
          <Text style={styles.attachButtonText}>Attach a screenshot</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.submitButton, (!subject.trim() || !description.trim() || submitting) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!subject.trim() || !description.trim() || submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Open Ticket</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, color: colors.textPrimary },
  textArea: { height: 130, textAlignVertical: "top", paddingTop: 10 },
  attachButton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md, alignSelf: "flex-start" },
  attachButtonText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm },
  pendingName: { flex: 1, fontSize: 12, color: colors.textSecondary },
  submitButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: spacing.xl },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
