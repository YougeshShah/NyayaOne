import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// TEMPORARILY DISABLED for crash diagnosis — re-enable once confirmed safe.
import { ChatWidget } from "../../src/components/ChatWidget";
import { useMyNotifications } from "../../src/hooks";

function NotificationBell() {
  const { data } = useMyNotifications();
  const unread = data?.unreadCount ?? 0;
  return (
    <TouchableOpacity onPress={() => router.push("/notifications")} style={{ marginRight: 16 }}>
      <Ionicons name="notifications-outline" size={24} color="#111827" />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: "#2563EB", headerRight: () => <NotificationBell /> }}>
        <Tabs.Screen
          name="index"
          options={{ title: "Courses", tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="bookmarks"
          options={{ title: "Bookmarks", tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
        />
      </Tabs>
      <ChatWidget />
    </>
  );
}

const styles = StyleSheet.create({
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: "#DC2626", borderRadius: 8, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
