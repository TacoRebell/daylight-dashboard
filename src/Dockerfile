# Base image (Lightweight Node)
FROM node:18-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV PORT 3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build from your computer (We will copy this folder manually)
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs .next/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]