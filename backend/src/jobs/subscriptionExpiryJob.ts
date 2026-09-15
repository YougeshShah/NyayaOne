import { prisma } from "../database/prisma";
import { logger } from "../common/utils/logger";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly is plenty -- subscription expiry is a day-granularity concept, not minute-by-minute

/**
 * Course access everywhere checks CourseSubscription.status === "ACTIVE" --
 * this job is the only thing that ever moves a subscription OUT of ACTIVE
 * once its time is up, so every existing access check starts denying access
 * automatically once this runs, with no need to touch each check site.
 *
 * Cuts access off a day EARLY (expiresAt <= now + 1 day, not just
 * expiresAt <= now) per the explicit requirement that a student should not
 * get the very last day of their nominal subscription window.
 */
async function expireDueSubscriptions() {
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const result = await prisma.courseSubscription.updateMany({
    where: { status: "ACTIVE", expiresAt: { not: null, lte: cutoff } },
    data: { status: "EXPIRED" },
  });
  if (result.count > 0) {
    logger.info(`Expired ${result.count} course subscription(s) (one-day-early cutoff).`);
  }
}

export function startSubscriptionExpiryJob() {
  expireDueSubscriptions().catch((err) => logger.error("Subscription expiry job failed on startup run", err));
  setInterval(() => {
    expireDueSubscriptions().catch((err) => logger.error("Subscription expiry job failed", err));
  }, CHECK_INTERVAL_MS);
}
