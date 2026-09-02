import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../src/theme/theme";
import { useTranslation } from "../../src/i18n/LanguageContext";
import { notificationApi } from "../../src/api/notification.api";

function NotificationBell() {
  const { data } = useQuery({ queryKey: ["my-notifications"], queryFn: () => notificationApi.myNotifications() });
  const unread = data?.unreadCount ?? 0;
  return (
    <TouchableOpacity onPress={() => router.push("/notifications")} style={{ marginRight: 16 }}>
      <Ionicons name="notifications-outline" size={24} color="#fff" />
      {unread > 0 && (
        <View style={bellStyles.badge}>
          <Text style={bellStyles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const bellStyles = StyleSheet.create({
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: "#DC2626", borderRadius: 8, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerRight: () => <NotificationBell />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("dashboard"),
          headerTitle: "NyayaOne",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: t("cases"),
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hearings"
        options={{
          title: t("hearings"),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: t("clients"),
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
