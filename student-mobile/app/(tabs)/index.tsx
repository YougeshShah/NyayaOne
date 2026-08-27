import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourses, useMySubscriptions } from "../../src/hooks";
import { useAuthStore } from "../../src/store/authStore";

const categoryColor: Record<string, string> = {
  LAW: "#2563EB",
  LANGUAGE: "#7C3AED",
  OTHER: "#059669",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function CoursesScreen() {
  const { data: courses, isLoading } = useCourses();
  const { data: subscriptions } = useMySubscriptions();
  const user = useAuthStore((s) => s.user);
  const subscribedIds = new Set((subscriptions ?? []).filter((s) => s.status === "ACTIVE" || s.status === "TRIAL").map((s) => s.courseId));

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <FlatList
      data={courses ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 18 }}>
          <Text style={styles.greeting}>
            {getGreeting()}{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </Text>
          <Text style={styles.subtitle}>
            {subscribedIds.size > 0 ? "Pick up where you left off, or explore something new." : "Practice free demo questions, or subscribe to unlock everything."}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const subscribed = subscribedIds.has(item.id);
        const iconColor = categoryColor[item.category] ?? categoryColor.OTHER;
        return (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/course/${item.id}`)} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: iconColor }]}>
              <Ionicons name="school" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.courseName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.courseDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={[styles.badge, subscribed ? styles.badgeSuccess : styles.badgeOutline]}>
              <Text style={subscribed ? styles.badgeTextSuccess : styles.badgeTextOutline}>{subscribed ? "Subscribed" : "Free Demo"}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Ionicons name="school-outline" size={40} color="#D1D5DB" />
          <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 12 }}>No courses available yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  greeting: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#6B7280" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  courseName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  courseDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeSuccess: { backgroundColor: "#DCFCE7" },
  badgeOutline: { borderWidth: 1, borderColor: "#D1D5DB" },
  badgeTextSuccess: { color: "#16A34A", fontSize: 11, fontWeight: "700" },
  badgeTextOutline: { color: "#6B7280", fontSize: 11, fontWeight: "700" },
});
