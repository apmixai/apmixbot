# syntax=docker/dockerfile:1

# Build: installs the workspace (the engine and the plugin), then sets up a template data
# folder (the web profile with ApmixBot) that the entrypoint copies into /data on first
# start. Build context is the repository root:
#   docker build -f docker/Dockerfile -t apmixbot:local .
FROM node:24-bookworm-slim AS build

ARG NPM_REGISTRY=https://registry.npmjs.org/

RUN corepack enable \
    && npm config set registry "$NPM_REGISTRY" --global \
    && COREPACK_NPM_REGISTRY="$NPM_REGISTRY" pnpm config set registry "$NPM_REGISTRY" --global

WORKDIR /opt/apmixbot
COPY package.json package-lock.json ./
COPY engine/ engine/
COPY plugin/ plugin/
COPY app/package.json app/package.json

# The desktop app's dependencies are the engine and the plugin; its dev dependencies
# (Electron and the packager) stay out. The web profile installs the plugin from its
# package file, which stays in the image.
RUN npm ci --omit=dev --no-fund --no-audit --workspace apmixbot-desktop \
    && npm pack --workspace apmixbot --pack-destination /tmp \
    && mv /tmp/apmixbot-*.tgz /opt/apmixbot/apmixbot.tgz \
    && DSH_HOME=/opt/dsh-template node_modules/.bin/dsh plugin --profile web add /opt/apmixbot/apmixbot.tgz

FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash git curl ca-certificates \
        python3 python3-pip python3-venv \
        build-essential jq ripgrep unzip zip ffmpeg less procps gosu \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

COPY --from=build /usr/local/ /usr/local/
COPY --from=build /opt/apmixbot /opt/apmixbot
COPY --from=build /opt/dsh-template /opt/dsh-template
COPY --chmod=0755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/docker.patch.yml /opt/apmixbot/docker.patch.yml

ENV DSH_HOME=/data \
    DSH_PERMISSION_MODE=danger-full-access \
    PATH=/opt/apmixbot/node_modules/.bin:$PATH

WORKDIR /workspace
EXPOSE 3080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

LABEL org.opencontainers.image.title="ApmixBot" \
      org.opencontainers.image.description="ApmixBot: a team of long-lived AI Bots, served on the web" \
      org.opencontainers.image.licenses="Apache-2.0"
