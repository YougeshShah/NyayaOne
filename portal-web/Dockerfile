# Multi-stage build for a Vite + React web app, served via nginx.
# Same Dockerfile is used for company-web, law-firm-web, and student-web —
# just point `docker build` at the right directory.
#
# VITE_API_BASE_URL is baked in at BUILD time (Vite inlines env vars into
# the JS bundle) — pass it via --build-arg, it can't be changed at runtime
# without rebuilding the image.

FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
