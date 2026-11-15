# ApmixBot in Docker

This directory deploys ApmixBot as a Docker image: the engine's web server with
the ApmixBot plugin installed, ready for a NAS or any always-on
box. The container is the sandbox boundary — see [Permissions](#permissions).
`apmixbot` in the commands below is an internal name: the plugin's package, and the
Compose service and image.

## Requirements

- Docker 24+ with Compose v2.24+ (Docker Desktop, or Docker Engine + the
  compose plugin — `env_file.required` needs 2.24).
- Linux containers, x86-64. arm64 builds should work (`node:24-bookworm-slim` is
  multi-arch) but are untested.
- A model API: its endpoint (any OpenAI- or Anthropic-compatible API: OpenAI,
  Anthropic, OpenRouter, a local server, …) and its API key. You enter both in the
  UI after you log in; see [Model provider](#model-provider).

## Quick start

From the repository root, edit `docker-compose.yml`: add the NAS IP to
`DSH_TRUSTED_HOST`, and set `PUID`/`PGID` to the share owner's IDs.
Environment variables, ports and paths are all configured directly in this
file; no `.env` is needed. No model key goes in this file.

```sh
docker compose up -d --build
docker compose logs apmixbot
```

This builds the image on your machine; there is no published ApmixBot image. The root
Compose file publishes host port **13080**, and stores data and workspace files
in `docker/data` and `docker/workspace`.

The log prints a line like `dsh web: http://172.x.x.x:3080/?token=…` (`dsh` is the
engine's command). Take the token from it and open
`http://<NAS IP>:13080/?token=…` once in your browser: the token sets a signed
cookie (valid 30 days, bound to that authority), after which
`http://<NAS IP>:13080/` opens the UI directly. The printed port is the container's;
use the host port from `ports:` when opening it. The first time the team opens,
ApmixBot creates a Main Bot called Chief, and Chief's chat asks for your model
provider before anything else works.

An alternative for users who prefer `.env` is in `docker/`: create `docker/.env` with the
variables in the table under [Environment variables](#environment-variables), then:

```sh
cd docker
docker compose up -d --build
```

That file publishes host port **3080** by default. Choose one deployment
method; do not run both against the same data directory.

## Permissions

The container is the only sandbox. The engine's own kernel sandbox (bubblewrap /
Landlock) does not run inside Docker's default seccomp profile or on most NAS
kernels, so the image offers exactly one permission preset, **Full access**:
every Bot command runs without asking. Only mount folders the Bots may change
into `/workspace`, and run the container with `PUID`/`PGID` of the share owner
so file ownership stays right.

## Network

The web server binds one concrete address and refuses every interface (`0.0.0.0`).
The entrypoint binds the container's own address, where Docker's published port
arrives, so the publish rule is the real boundary, and the trust fence below still
applies. The UI checks
the `Host` header of every `/api` request: loopback is always trusted, and
every other name or IP you open it at must be listed in `DSH_TRUSTED_HOST`
(no port — a bare entry trusts it on any port), or the API answers 403.
`DSH_HOST=127.0.0.1` narrows the bind to loopback (e.g. a reverse proxy in the
same network namespace); published ports then no longer reach it.

Alternatives:

- **Host network**: set `network_mode: host` in `compose.yml` and drop `ports:`,
  and set `DSH_HOST` to the NAS's LAN address. The server then listens on that
  address directly, on `DSH_LISTEN_PORT` (default 3080).
- **Reverse proxy / HTTPS**: the proxy must preserve the browser-visible
  `Host` header and forward WebSocket upgrades; add the public host name to
  `DSH_TRUSTED_HOST`. The printed login URL is the container's — replace its
  host with the public one when logging in the first time.

**HTTPS is recommended, not required.** The UI works over plain
`http://<LAN IP>`, but the page is not a secure context
there: API keys and secret values you type cross the LAN in clear text. Put a
reverse proxy in front for regular use.

## Environment variables

In the root `docker-compose.yml`, edit container variables under `environment`,
the published port under `ports`, and host directories under `volumes`.
The alternative `docker/compose.yml` reads these settings from a `docker/.env` you create.
The variables are:

| Variable | Purpose |
|---|---|
| `DSH_TRUSTED_HOST` | Comma-separated host names / IPs the UI answers to |
| `DSH_PORT` | Alternative `.env` deployment's host port (default 3080); edit `ports` directly in the root Compose file |
| `DSH_HOST` | Bind address: one address of the machine, by default the container's own; set it with `network_mode: host` |
| `DSH_LISTEN_PORT` | Listen port inside the container (default 3080); only relevant with `network_mode: host` |
| `PUID` / `PGID` | User/group the server runs as and new files belong to |

Extra flags of the engine's `dsh` command can be appended to the container command.

## Model provider

The model is set up in the UI, not in the Compose file:

1. Log in once with the token URL (see [Quick start](#quick-start)).
2. Chief's chat opens on **Connect a model provider**. Enter the endpoint, such
   as `https://api.openai.com/v1`, `https://openrouter.ai/api/v1`, or a server on the Docker host at
   `http://host.docker.internal:11434/v1`. Pick the protocol (OpenAI Chat
   Completions for most APIs, Anthropic Messages for an Anthropic-compatible
   one) and paste the API key.
3. **Fetch models** lists what the endpoint serves; pick the ones you want, or
   type model ids by hand if it lists none. **More options** sets a display
   name and the context window for models whose endpoint does not tell it.
4. **Connect**, then pick Chief's model. Every other Bot picks its own model
   from the same list, in its details or in the Create Bot form.

ApmixBot keeps the provider in `DATA_DIR/profiles/web/cordis.patch.yml` and the key
in `DATA_DIR/.credentials.yaml`; the key is never shown again. Settings →
Models adds more providers, changes a provider's key or models, and removes
it. Models whose provider has no key are not offered to any Bot.

Over plain http the key you type crosses the network in clear text; see
[Network](#network).

## Data

- `/data` (`DATA_DIR`) is the engine's data folder (`DSH_HOME`): the team and chats (`bot/`, `sessions/`),
  profiles, settings, and the login cookie key and model API keys
  (`.credentials.yaml`).
- `/workspace` (`WORKSPACE_DIR`) is the team workspace where the Bots work.

A rebuild reuses the persisted data and workspace. Keep their container
destinations `/data` and `/workspace` unchanged when you rebuild or move the
host directories; the team records those destinations, not the host paths.

**Backup**: stop the container, then copy both `DATA_DIR` and `WORKSPACE_DIR`.
Restore by putting both folders back and starting again.

On every start, entries in `/data` with a different owner or group are assigned
to `PUID`/`PGID`, including existing profiles and restored files. This scans the
data directory, so large histories can take longer to start. It does not follow
symbolic links or descend into other filesystems. A populated `/workspace` keeps
its ownership; if you change `PUID`/`PGID`, grant the new user access to that
share on the host.

## Updating

```sh
docker compose build   # or: docker build -f docker/Dockerfile -t apmixbot:local .
docker compose up -d
```

A rebuild changes the image and the engine it contains. An existing persisted
profile is reused, and the entrypoint does not manage plugin upgrades: a data
directory first started with an older image keeps the plugin that image
installed. To start on the new plugin, stop the container and move `DATA_DIR`
away (keep it as a backup), then start again; the image seeds a fresh profile.

## Your own image

There is no published ApmixBot image. To run the same image on another machine,
build and tag it once, then push it to your own registry or copy it with
`docker save` / `docker load`:

```sh
docker build -f docker/Dockerfile -t apmixbot:local .
```

Save this as `compose.yml` in the directory you want to deploy from, with the
image name you gave it. Fill in your NAS host names before starting it. Running
these commands from the repository root would use the local root Compose file
instead.

```yaml
services:
  apmixbot:
    image: apmixbot:local
    ports:
      - "13080:3080"
    environment:
      PUID: "1000"
      PGID: "1000"
      DSH_TRUSTED_HOST: "localhost,127.0.0.1"
    volumes:
      - ./data:/data
      - ./workspace:/workspace
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    stop_grace_period: 15s
```

```sh
docker compose up -d
```

The root `docker-compose.yml` and `docker/compose.yml` build the image themselves. Choose one setup; do not run both against the same data directory. An
existing persisted profile is not upgraded automatically.

## Limits

- No Bot browser / `read_browser` tool: they need a desktop shell with a webview bridge.
- Over plain http, API keys and secret values you type cross the network in
  clear text — use HTTPS off-box (see [Network](#network)).
- Full access is the only permission mode: a Bot can change everything the
  container can see.

## Testing

After building the image, run `node docker/test.mjs apmixbot:local` from the
repository root. The test uses isolated, network-disabled containers and
temporary Docker volumes, with no host directory mounts or model calls. It
checks entrypoint permissions, first start, UID/GID changes, restored files,
workspace ownership and web startup. All test containers and volumes are
removed when it finishes.
CI builds the image from the Linux checkout and runs this test as part of the
required Test result check.
