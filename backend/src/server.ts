import app from "./app";
import { env } from "./config/env";
import { logger } from "./common/utils/logger";
import { prisma } from "./database/prisma";
import { startReminderScheduler } from "./jobs/reminderScheduler";

async function bootstrap() {
  try {
    // Verify database connectivity before accepting traffic
    await prisma.$connect();
    logger.info("Database connected successfully");

    app.listen(env.port, () => {
      logger.info(`NyayaOne API running on http://localhost:${env.port}/api/${env.apiVersion}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });

    startReminderScheduler();
  } catch (error) {
    logger.error("Failed to start server");
    logger.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Without these, one unhandled error anywhere in the app (e.g. a bug in an
// IELTS route, a Law Firm route, doesn't matter which) can silently crash
// the ENTIRE Node process — taking down every module, every tenant, all at
// once. This is the single biggest "one bug brings down everything" risk
// in a Node app, and it's fixed by handling these two events explicitly:
// log the error with full context, then exit cleanly so the process
// manager (PM2/systemd/Docker) restarts it in seconds rather than the
// process hanging in a broken, half-crashed state indefinitely.
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION — shutting down for restart");
  logger.error(error.stack || error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED PROMISE REJECTION — shutting down for restart");
  logger.error(reason instanceof Error ? reason.stack || reason.message : String(reason));
  process.exit(1);
});

bootstrap();
