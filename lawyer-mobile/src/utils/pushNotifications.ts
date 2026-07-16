import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permission (if not already granted) and registers
 * the device's Expo push token with the backend, linked to the logged-in user.
 * Safe to call on every app start / after login — it's idempotent.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device (not a simulator).");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const pushToken = tokenResponse.data;

  try {
    await apiClient.post("/push/register", { pushToken });
  } catch (err) {
    console.log("Failed to register push token with backend:", err);
  }

  return pushToken;
}

export async function sendTestPush(pushToken: string) {
  await apiClient.post("/push/test", { pushToken });
}
