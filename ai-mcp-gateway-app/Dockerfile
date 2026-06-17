# =============================================================================
# ai-mcp-gateway-app · Dockerfile
#
# Multi-stage build:
#   1) builder : maven:3.9-eclipse-temurin-17
#                - copies only POMs first to maximise layer caching
#                - runs `mvn dependency:go-offline` to pre-fetch deps
#                - copies sources and packages the Spring Boot fat jar
#   2) runtime : eclipse-temurin:17-jre-alpine  (~180 MB vs ~430 MB for jdk-slim)
#                - non-root user
#                - tini as PID 1 for proper SIGTERM/SIGINT handling
#                - HEALTHCHECK against the admin endpoint
#                - OCI labels for image metadata
#
# Build (from project root):
#   docker build -f ai-mcp-gateway-app/Dockerfile -t ai-mcp-gateway-app .
#
# Run:
#   docker run --rm -p 8777:8777 \
#     -e SPRING_DATASOURCE_URL=... \
#     -e SPRING_DATASOURCE_USERNAME=... \
#     -e SPRING_DATASOURCE_PASSWORD=... \
#     -e DASHSCOPE_API_KEY=... \
#     ai-mcp-gateway-app
# =============================================================================

# =============================================================
# Stage 1 — build the fat jar
# =============================================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy every module's POM first. This layer is cached as long as POMs
# don't change — source edits do not bust it.
COPY pom.xml ./
COPY ai-mcp-gateway-types/pom.xml          ./ai-mcp-gateway-types/
COPY ai-mcp-gateway-domain/pom.xml         ./ai-mcp-gateway-domain/
COPY ai-mcp-gateway-infrastructure/pom.xml ./ai-mcp-gateway-infrastructure/
COPY ai-mcp-gateway-api/pom.xml            ./ai-mcp-gateway-api/
COPY ai-mcp-gateway-case/pom.xml           ./ai-mcp-gateway-case/
COPY ai-mcp-gateway-trigger/pom.xml        ./ai-mcp-gateway-trigger/
COPY ai-mcp-gateway-app/pom.xml            ./ai-mcp-gateway-app/

# Pre-fetch all dependencies (incl. plugins) for the app and its upstream
# modules. `dependency:go-offline` is best-effort — if a plugin refuses
# offline mode the build will re-fetch on the next mvn run.
RUN mvn -B -ntp -DskipTests \
        -pl ai-mcp-gateway-app -am \
        dependency:go-offline

# Now copy the source trees. Anything under `target/` is left out of the
# build context via the project-root .dockerignore so we always rebuild
# from a clean state.
COPY ai-mcp-gateway-types/src          ./ai-mcp-gateway-types/src
COPY ai-mcp-gateway-domain/src         ./ai-mcp-gateway-domain/src
COPY ai-mcp-gateway-infrastructure/src ./ai-mcp-gateway-infrastructure/src
COPY ai-mcp-gateway-api/src            ./ai-mcp-gateway-api/src
COPY ai-mcp-gateway-case/src           ./ai-mcp-gateway-case/src
COPY ai-mcp-gateway-trigger/src        ./ai-mcp-gateway-trigger/src
COPY ai-mcp-gateway-app/src            ./ai-mcp-gateway-app/src

# Package the Spring Boot fat jar. -am pulls in every upstream module.
RUN mvn -B -ntp -DskipTests \
        -pl ai-mcp-gateway-app -am \
        package

# =============================================================
# Stage 2 — minimal JRE runtime
# =============================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# --- OCI image metadata ----------------------------------------------------
LABEL org.opencontainers.image.title="ai-mcp-gateway-app" \
      org.opencontainers.image.description="AI MCP Gateway — Spring Boot application exposing HTTP APIs as MCP tools" \
      org.opencontainers.image.source="https://github.com/charliefei/ai-mcp-gateway" \
      org.opencontainers.image.licenses="Apache-2.0"

# --- OS packages -----------------------------------------------------------
# tini  : proper PID 1 — reaps zombies and forwards signals to the JVM
# curl  : used by HEALTHCHECK below
# tzdata: required for the TZ=Asia/Shanghai lookup
RUN apk add --no-cache tini curl tzdata

# --- Time zone -------------------------------------------------------------
ENV TZ=Asia/Shanghai
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# --- Non-root user ---------------------------------------------------------
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# --- Application artifact --------------------------------------------------
COPY --from=builder --chown=app:app \
    /build/ai-mcp-gateway-app/target/ai-mcp-gateway-app.jar /app/app.jar

USER app

# --- Network ---------------------------------------------------------------
EXPOSE 8777

# --- JVM defaults ----------------------------------------------------------
# -XX:MaxRAMPercentage=75.0    cap heap at 75% of container memory
# -XX:+ExitOnOutOfMemoryError  fail fast on OOM (avoids degraded mode)
# -Djava.security.egd=...      faster SecureRandom on Alpine
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom" \
    PARAMS=""

# --- Health check ----------------------------------------------------------
# Spring Boot Actuator is not enabled; probe an admin endpoint that returns
# 200 once the application context is fully up. /healthz below is also
# exposed by the load balancer (docs/deploy/nginx-app.conf).
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8777/api-gateway/admin/query_gateway_config_list >/dev/null 2>&1 || exit 1

# --- Entrypoint ------------------------------------------------------------
# tini as PID 1 so SIGTERM from `docker stop` reaches the JVM and Spring
# Boot can run its graceful-shutdown hooks.
#
# `exec java` replaces the shell with the JVM so the JVM receives signals
# directly. $JAVA_OPTS / $PARAMS are expanded by the wrapper shell.
ENTRYPOINT ["/sbin/tini", "--", "sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar $PARAMS"]
