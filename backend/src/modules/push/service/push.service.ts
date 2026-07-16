import { pushRepository } from "../repository/push.repository";

export const pushService = {
  async registerToken(userId: string, pushToken: string) {
    await pushRepository.saveToken(userId, pushToken);
    return { message: "Push token registered" };
  },

  async unregisterToken(userId: string) {
    await pushRepository.clearToken(userId);
    return { message: "Push token removed" };
  },

  async sendTestPush(pushToken: string) {
    await pushRepository.sendPushBatch([
      {
        to: pushToken,
        title: "NyayaOne Test Notification",
        body: "If you see this, push notifications are working correctly! 🎉",
      },
    ]);
    return { message: "Test push sent" };
  },
};
