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
    shouldShowBanner: true,
    shouldShowList: true,
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

  try {
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
    console.log("Registering push notifications — projectId:", projectId || "(none found in app config!)");

    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const pushToken = tokenResponse.data;
    console.log("Got Expo push token:", pushToken);

    await apiClient.post("/push/register", { pushToken });
    console.log("Push token registered with backend successfully.");

    return pushToken;
  } catch (err) {
    // Previously this error was silently swallowed by the caller's .catch(() => {}) —
    // logging it here is the only way to actually see what's going wrong.
    console.log("registerForPushNotifications FAILED:", err);
    return null;
  }
}

export async function sendTestPush(pushToken: string) {
  await apiClient.post("/push/test", { pushToken });
}
