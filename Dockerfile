# syntax=docker/dockerfile:1

# One image serves both halves of the app from a single origin. That is the
# whole point of packaging it this way: the session lives in cookies, and
# cookies stop being simple the moment the client and the API sit on different
# sites. Same origin means SameSite=lax keeps working, CORS is not involved,
# and the CSRF token stays the second line of defence it was designed to be —
# and it needs no custom domain: a single host has no cross-site cookie to
# share in the first place, so the free onrender.com subdomain is fine.
#
# Build context is the repository root — all three packages are needed.

# Debian rather than Alpine: bcrypt is a native module, and glibc prebuilds are
# published where musl ones are not. The size difference is not worth a build
# that compiles bcrypt from source on every deploy.
ARG NODE_VERSION=24-slim

# ── Client ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS client

WORKDIR /build/frontend
# Manifests first, so a source-only change reuses the installed layer.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Type-only contracts. The frontend's @shared/* alias resolves outside its own
# directory, so the build needs them present even though nothing is emitted.
COPY shared /build/shared
COPY frontend ./

# Empty on purpose: the API answers on the same origin, so every request comes
# out as a relative path. The client also defaults to this when unset.
ENV VITE_API_URL=""
RUN npm run build

# ── Server ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS server

WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY shared /build/shared
COPY server ./

# tsc alone leaves the @config/* style aliases in the emitted JS; tsc-alias
# rewrites them to real relative paths. Dropping it produces a build that
# compiles cleanly and then cannot resolve a single import at runtime.
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

ENV NODE_ENV=production

WORKDIR /app/server

# Production dependencies only: no TypeScript, no Jest, and in particular no
# mongodb-memory-server, which would otherwise pull a MongoDB binary into the
# image for no reason.
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=server /build/server/dist ./dist

# Mirrors the repository layout, so the path staticClient.ts derives on its own
# is correct here too. CLIENT_DIST states it outright regardless: a wrong path
# does not fail anything loudly, it just serves no client at all.
COPY --from=client /build/frontend/dist /app/frontend/dist
ENV CLIENT_DIST=/app/frontend/dist

USER node

# Documentation only — the platform injects PORT and the server reads it.
EXPOSE 3000

CMD ["node", "dist/server.js"]
