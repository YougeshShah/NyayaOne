import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourses, useMySubscriptions } from "../../src/hooks";

export default function CoursesScreen() {
  const { data: courses, isLoading } = useCourses();
  const { data: subscriptions } = useMySubscriptions();

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
      renderItem={({ item }) => {
        const subscribed = subscribedIds.has(item.id);
        return (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/course/${item.id}`)}>
            <View style={styles.iconBox}>
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
        <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}>No courses available yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  courseName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  courseDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeSuccess: { backgroundColor: "#DCFCE7" },
  badgeOutline: { borderWidth: 1, borderColor: "#D1D5DB" },
  badgeTextSuccess: { color: "#16A34A", fontSize: 11, fontWeight: "700" },
  badgeTextOutline: { color: "#6B7280", fontSize: 11, fontWeight: "700" },
});
