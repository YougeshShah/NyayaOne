import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { notificationApi } from "../src/api/notification.api";
import { colors, spacing } from "../src/theme/theme";

function formatRelativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-notifications"], queryFn: () => notificationApi.myNotifications() });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
  });
  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  return (
    <View style={styles.container}>
      {(data?.unreadCount ?? 0) > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={() => markAllRead.mutate()}>
          <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-outline" size={32} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => !item.isRead && markRead.mutate(item.id)}
          >
            <View style={styles.row}>
              <Text style={styles.title}>{item.notification.title}</Text>
              {!item.isRead && <View style={styles.dot} />}
            </View>
            <Text style={styles.body}>{item.notification.body}</Text>
            <Text style={styles.time}>{formatRelativeTime(item.notification.createdAt)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", marginRight: spacing.md, marginTop: spacing.sm },
  markAllText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardUnread: { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8, marginTop: 4 },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  time: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
});
