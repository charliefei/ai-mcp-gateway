# =============================================================================
# ai-mcp-gateway-admin-ui · Dockerfile
#
# Multi-stage build:
#   1) builder  — installs deps with npm ci, runs `npm run build` (tsc + vite)
#   2) runtime  — nginx:alpine serves the built SPA, proxies /api-gateway/ to
#                 the Spring Boot backend.
#
# Build:
#   docker build -t ai-mcp-gateway-admin-ui .
#
# Run (with the gateway backend reachable on the same docker network):
#   docker run --rm -p 8080:80 \
#     -e BACKEND_URL=http://ai-mcp-gateway-app:8777 \
#     ai-mcp-gateway-admin-ui
# =============================================================================

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package.json package-lock.json* ./
# `npm ci` requires package-lock.json; fall back to `npm install` if missing.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy sources and build
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts tailwind.config.ts postcss.config.js index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

# Runtime configuration of the upstream backend URL.
# Defaults to a docker-compose service name; override at build or run time.
ARG BACKEND_URL=http://gateway-backend:8777
ENV BACKEND_URL=${BACKEND_URL}

# Drop the default nginx site and ship our SPA-ready config.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inject the backend URL into the served config at container start so
# deployments can override it without rebuilding the image.
RUN sed -i "s|__BACKEND_URL__|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Static assets from the builder.
COPY --from=builder /app/dist /usr/share/nginx/html

# Standard nginx alpine ports
EXPOSE 80

# nginx:alpine already ships a working entrypoint (CMD ["nginx", "-g", "daemon off;"])
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
