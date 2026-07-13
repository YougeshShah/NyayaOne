import app from "./app";
import { env } from "./config/env";
import { logger } from "./common/utils/logger";
import { prisma } from "./database/prisma";

async function bootstrap() {
  try {
    // Verify database connectivity before accepting traffic
    await prisma.$connect();
    logger.info("Database connected successfully");

    app.listen(env.port, () => {
      logger.info(`NyayaOne API running on http://localhost:${env.port}/api/${env.apiVersion}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });
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

bootstrap();
