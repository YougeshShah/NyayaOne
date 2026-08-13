import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMyNotifications, useMarkNotificationRead } from "../src/hooks";

export default function NotificationsScreen() {
  const { data } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {data?.items.length === 0 && <Text style={styles.emptyText}>No notifications yet.</Text>}
        {data?.items.map((n: any) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.card, !n.isRead && styles.cardUnread]}
            onPress={() => !n.isRead && markRead.mutate(n.id)}
            activeOpacity={n.isRead ? 1 : 0.7}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={styles.cardTitle}>{n.notification.title}</Text>
              {!n.isRead && <View style={styles.newDot} />}
            </View>
            <Text style={styles.cardBody}>{n.notification.body}</Text>
            <Text style={styles.cardDate}>{new Date(n.notification.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  title: { fontSize: 18, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 40, fontSize: 15 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  cardUnread: { borderColor: "#93C5FD", backgroundColor: "#EFF6FF" },
  cardTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  cardBody: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  cardDate: { fontSize: 11, color: "#9CA3AF", marginTop: 8 },
  newDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginLeft: 8, marginTop: 4 },
});
