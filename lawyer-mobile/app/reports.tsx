import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { colors, spacing, radius } from "../src/theme/theme";
import { useAuthStore } from "../src/store/authStore";

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

function ReportButton({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.reportButton} onPress={onPress}>
      <View style={styles.reportIconBox}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.reportButtonText}>{label}</Text>
      <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ReportsScreen() {
  const download = (path: string, params: Record<string, string> = {}) => {
    const token = useAuthStore.getState().accessToken;
    const query = new URLSearchParams({ ...params, ...(token ? { token } : {}) }).toString();
    Linking.openURL(`${API_BASE_URL}${path}?${query}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.sectionTitle}>Cases</Text>
      <View style={styles.card}>
        <ReportButton icon="document-outline" label="Download as Excel" onPress={() => download("/reports/cases", { format: "excel" })} />
        <View style={styles.divider} />
        <ReportButton icon="document-text-outline" label="Download as PDF" onPress={() => download("/reports/cases", { format: "pdf" })} />
      </View>

      <Text style={styles.sectionTitle}>Hearings</Text>
      <View style={styles.card}>
        <ReportButton icon="document-outline" label="Download as Excel" onPress={() => download("/reports/hearings", { format: "excel" })} />
        <View style={styles.divider} />
        <ReportButton icon="document-text-outline" label="Download as PDF" onPress={() => download("/reports/hearings", { format: "pdf" })} />
      </View>

      <Text style={styles.sectionTitle}>Clients</Text>
      <View style={styles.card}>
        <ReportButton icon="document-outline" label="Download as Excel" onPress={() => download("/reports/clients")} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginBottom: 8, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  reportButton: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  reportIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}1A`, justifyContent: "center", alignItems: "center" },
  reportButtonText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 36 + spacing.sm },
});
