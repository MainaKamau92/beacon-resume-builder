# Beacon — Next.js + puppeteer PDF export, containerized for Render (free tier).
# Uses the distro's Chromium so puppeteer never downloads its own; the app's
# webfonts are served by Next itself, so no extra font packages are needed
# beyond fallbacks/emoji coverage.
FROM node:20.20.2-bookworm-slim

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium fonts-liberation ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps against the committed lockfile (dev deps needed for the build).
COPY package.json package-lock.json ./
RUN npm ci

# Build the app.
COPY . .
RUN npm run build

# Runtime: Render injects PORT (defaults to 10000); `next start` reads $PORT.
ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "run", "start"]
