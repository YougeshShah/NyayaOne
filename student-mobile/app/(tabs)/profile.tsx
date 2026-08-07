import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? "S"}</Text>
      </View>
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40, backgroundColor: "#F8FAFC" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 32 },
  logoutButton: { backgroundColor: "#FEE2E2", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  logoutText: { color: "#DC2626", fontWeight: "700" },
});
