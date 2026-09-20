# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# --- Production stage ---
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL and libc6-compat required by Prisma immediately --
# without this, Prisma's query engine fails to detect libssl on
# Alpine, causing the container to crash-loop at startup.
RUN apk update && apk add --no-cache libc6-compat openssl

COPY package*.json ./
RUN npm ci --omit=dev
RUN npx prisma generate --schema=./prisma/schema.prisma || true

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Uploaded files (avatars, library PDFs) persist outside the container via a
# mounted volume — see docker-compose.prod.yml.
RUN mkdir -p /app/uploads

EXPOSE 5000
CMD ["node", "dist/server.js"]
