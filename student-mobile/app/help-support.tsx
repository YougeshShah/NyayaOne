import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpSupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Need Help?</Text>
      <Text style={styles.subtitle}>Reach out to us using any of the options below — we're happy to help.</Text>

      <TouchableOpacity style={styles.row} onPress={() => Linking.openURL("mailto:support@technocraftx.com")}>
        <Ionicons name="mail-outline" size={22} color="#2563EB" style={{ marginRight: 14 }} />
        <View>
          <Text style={styles.rowTitle}>Email Support</Text>
          <Text style={styles.rowSubtitle}>support@technocraftx.com</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

      <Text style={styles.faqQ}>How do I reset my password?</Text>
      <Text style={styles.faqA}>Use the "Forgot Password?" link on the login screen — you'll receive a verification code by email.</Text>

      <Text style={styles.faqQ}>How do I enroll in a course?</Text>
      <Text style={styles.faqA}>Browse courses from the Dashboard and select a subscription plan that fits your needs.</Text>

      <Text style={styles.faqQ}>I registered under an institution — why can't I log in yet?</Text>
      <Text style={styles.faqA}>Your institution needs to approve your registration first. You'll receive an email once approved.</Text>

      <Text style={styles.faqQ}>How do I delete my account?</Text>
      <Text style={styles.faqA}>Go to Settings → Delete Account. This action is permanent.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 24 },
  faqTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  faqQ: { fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 12 },
  faqA: { fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 19 },
});
