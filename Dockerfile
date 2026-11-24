# syntax=docker/dockerfile:1

# Install from the workspace lockfile, then compile the React frontend.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --no-audit --no-fund
COPY frontend ./frontend
RUN npm run build --workspace frontend

# Keep only the backend's runtime dependencies in the final image.
FROM node:24-bookworm-slim AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace backend --include-workspace-root=false --no-audit --no-fund

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node backend/package.json ./backend/package.json
COPY --chown=node:node backend/src ./backend/src
COPY --chown=node:node scripts/docker-healthcheck.mjs ./scripts/docker-healthcheck.mjs
COPY --from=build --chown=node:node /app/frontend/dist ./frontend/dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD ["node", "scripts/docker-healthcheck.mjs"]
CMD ["node", "backend/src/server.js"]
