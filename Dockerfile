# 1. Base Image: Install dependencies only when needed
FROM node:22-alpine AS base

# 2. Dependencies Stage: Install packages
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Use 'npm ci' for a clean, deterministic install
RUN npm ci

# 3. Builder Stage: Build the Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env vars (NEXT_PUBLIC_ vars must be available at build time)
ARG NEXT_PUBLIC_WEATHER_KEY
ENV NEXT_PUBLIC_WEATHER_KEY=$NEXT_PUBLIC_WEATHER_KEY

RUN npm run build

# 4. Runner Stage: The actual production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install su-exec for privilege dropping in entrypoint
RUN apk add --no-cache su-exec

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create cache directory with correct ownership
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 3000
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]