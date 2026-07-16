import axios from "axios";
import { prisma } from "../../../database/prisma";
import { logger } from "../../../common/utils/logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const pushRepository = {
  saveToken(userId: string, pushToken: string) {
    return prisma.user.update({ where: { id: userId }, data: { pushToken } });
  },

  clearToken(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { pushToken: null } });
  },

  /**
   * Sends a batch of push messages via Expo's push service. Expo push tokens
   * look like "ExponentPushToken[xxxx]" — no Firebase/APNs config needed on
   * our side, Expo's service relays to the right platform.
   */
  async sendPushBatch(messages: { to: string; title: string; body: string; data?: Record<string, unknown> }[]) {
    if (messages.length === 0) return;
    try {
      await axios.post(EXPO_PUSH_URL, messages, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
    } catch (err) {
      logger.error(`Failed to send push batch: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};
