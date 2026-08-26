import { View, Text, StyleSheet, ScrollView } from "react-native";
import Constants from "expo-constants";

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, alignItems: "center" }}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>N</Text>
      </View>
      <Text style={styles.appName}>NyayaOne</Text>
      <Text style={styles.tagline}>Law, IELTS, IOE, Doctors, Loksewa — all in one place</Text>
      <Text style={styles.version}>Version {appVersion}</Text>

      <View style={styles.divider} />

      <Text style={styles.p}>NyayaOne is developed and operated by Technocraftx Pvt. Ltd.</Text>
      <Text style={styles.p}>© {new Date().getFullYear()} Technocraftx Pvt. Ltd. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginTop: 20 },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  appName: { fontSize: 22, fontWeight: "800", color: "#111827", marginTop: 16 },
  tagline: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 6, paddingHorizontal: 24 },
  version: { fontSize: 12, color: "#9CA3AF", marginTop: 10 },
  divider: { height: 1, width: "100%", backgroundColor: "#E5E7EB", marginVertical: 24 },
  p: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 6 },
});
