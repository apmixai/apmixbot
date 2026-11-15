#!/bin/sh
# Mock test bench: the scripted mock model (dev/mock-llm.mjs) plus the engine's web server, whose
# profile links the plugin to this checkout, so edits need no reinstall (host code needs a restart;
# src/client needs `npm run build` and a page reload).
#
#   dev/bench.sh <name> <web-port> <mock-port> [start|stop|reset|status]
#
# Data lives in <checkout>/.dsh-test-<name>; `reset` wipes its Bot team and Sessions before
# starting. Processes are tracked by pid files and stopped by process group, never by name.
# The mock is a custom model provider ("mock"), set in the bench overlay.
# Environment: CONTEXT_WINDOW (the mock models' context window, in tokens, with an 8,000
# token reply; default: the adapter's own), CHECK_RATIO (the plugin's checkRatio), MOCK_DELAY_MS.
# The engine comes from the workspace install (npm ci at the repository root).
set -eu
NAME=${1:?usage: bench.sh <name> <web-port> <mock-port> [start|stop|reset|status]}
WEB_PORT=${2:?usage: bench.sh <name> <web-port> <mock-port> [start|stop|reset|status]}
MOCK_PORT=${3:?usage: bench.sh <name> <web-port> <mock-port> [start|stop|reset|status]}
ACTION=${4:-start}
case "$NAME" in *[!a-z0-9-]*|'') echo "bench name must match [a-z0-9-]+" >&2; exit 1 ;; esac
if [ "$WEB_PORT" = 3080 ]; then echo "port 3080 belongs to the real service" >&2; exit 1; fi

PLUGIN="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(dirname "$PLUGIN")"
HOME_DIR="$ROOT/.dsh-test-$NAME"
DSH_BIN="$ROOT/node_modules/@apmixbot/dsh/lib/bin.js"
if [ ! -f "$DSH_BIN" ]; then
  echo "no engine: run npm ci at the repository root" >&2
  exit 1
fi

alive() { [ -f "$HOME_DIR/$1.pid" ] && kill -0 "-$(cat "$HOME_DIR/$1.pid")" 2>/dev/null; }

# Each process runs in its own session (setsid), so its pid is also its process group, which
# outlives it: pnpm exits before the dsh it started. The process writes its own pid: the `$!`
# of a background job is the subshell that runs setsid, not the session leader it forks, so
# it cannot name the group to keep and stop. dash's kill takes no `--`.
stop_one() {
  file="$HOME_DIR/$1.pid"
  [ -f "$file" ] || return 0
  pid=$(cat "$file")
  kill -TERM "-$pid" 2>/dev/null || true
  i=0
  while kill -0 "-$pid" 2>/dev/null && [ $i -lt 50 ]; do sleep 0.2; i=$((i + 1)); done
  kill -KILL "-$pid" 2>/dev/null || true
  rm -f "$file"
}

ensure_profile() {
  profile="$HOME_DIR/profiles/web"
  if [ -f "$profile/package.json" ] && grep -q "\"link:$PLUGIN\"" "$profile/package.json"; then return 0; fi
  mkdir -p "$profile"
  cat > "$profile/package.json" <<EOF
{
  "name": "dsh-profile-web",
  "private": true,
  "dependencies": { "apmixbot": "link:$PLUGIN" },
  "dsh": { "profile": { "bundles": ["@apmixbot/dsh-base", "@apmixbot/dsh-web-app", "apmixbot"] } }
}
EOF
  printf 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n' > "$profile/pnpm-workspace.yaml"
  (cd "$profile" && DSH_HOME="$HOME_DIR" pnpm install >/dev/null)
}

# Bench-only config, layered over the profile with --patch: the mock as a custom provider
# whose key comes from APMIXBOT_MOCK_KEY, and the plugin's checkRatio.
write_overlay() {
  overlay="$HOME_DIR/bench.patch.yml"
  window=""
  if [ -n "${CONTEXT_WINDOW:-}" ]; then window=", contextWindow: $CONTEXT_WINDOW, maxTokens: 8000"; fi
  {
    printf -- '- id: llm-pi-ai\n  config:\n    providers:\n      mock:\n'
    printf -- '        displayName: Mock model\n        api: anthropic-messages\n'
    printf -- '        baseURL: "http://127.0.0.1:%s/v1"\n        apiKeyEnv: APMIXBOT_MOCK_KEY\n        models:\n' "$MOCK_PORT"
    printf -- '          - { id: mock-model, name: Mock model%s, input: [text, image] }\n' "$window"
    printf -- '          - { id: mock-model-pro, name: Mock model Pro%s }\n' "$window"
    if [ -n "${CHECK_RATIO:-}" ]; then
      printf -- '- id: bot\n  config:\n    checkRatio: %s\n' "$CHECK_RATIO"
    fi
  } > "$overlay"
}

start() {
  mkdir -p "$HOME_DIR"
  ensure_profile
  write_overlay
  if ! alive mock; then
    rm -f "$HOME_DIR/mock.pid"
    (cd "$PLUGIN" && MOCK_PORT="$MOCK_PORT" MOCK_DELAY_MS="${MOCK_DELAY_MS:-300}" MOCK_LOG="$HOME_DIR/mock.jsonl" \
      exec setsid sh -c 'set -eu; echo $$ >"$1"; shift; exec "$@"' sh "$HOME_DIR/mock.pid" \
      node dev/mock-llm.mjs "$HOME_DIR") </dev/null >"$HOME_DIR/mock.out" 2>&1 &
    # The mock writes its own pid just before it starts; wait for the file so a
    # status or stop right after start does not miss a mock still coming up.
    i=0
    while [ ! -f "$HOME_DIR/mock.pid" ] && [ $i -lt 50 ]; do i=$((i + 1)); sleep 0.1; done
  fi
  if ! alive web; then
    log="$HOME_DIR/web.log"
    rm -f "$log" "$HOME_DIR/web.pid"
    (
      cd "$HOME_DIR"
      set -- node "$DSH_BIN" --profile web
      DSH_HOME="$HOME_DIR" APMIXBOT_MOCK_KEY=mock-key \
        exec setsid sh -c 'set -eu; echo $$ >"$1"; shift; exec "$@"' sh "$HOME_DIR/web.pid" \
        "$@" --patch "$HOME_DIR/bench.patch.yml" --no-open --port "$WEB_PORT"
    ) </dev/null >"$log" 2>&1 &
    # The process writes its own pid just before the engine starts; wait for that file so a
    # start still in progress is not read as an exit.
    i=0
    while [ ! -f "$HOME_DIR/web.pid" ] && [ $i -lt 50 ]; do i=$((i + 1)); sleep 0.1; done
    i=0
    until grep -q "dsh web: http" "$log" 2>/dev/null; do
      i=$((i + 1))
      if [ $i -gt 120 ] || ! alive web; then echo "dsh web did not start; see $log" >&2; tail -20 "$log" | grep -v 'token=' >&2; exit 1; fi
      sleep 1
    done
  fi
  status
}

status() {
  for name in mock web; do
    if alive $name; then echo "$name: running (pid $(cat "$HOME_DIR/$name.pid"))"; else echo "$name: stopped"; fi
  done
  echo "home: $HOME_DIR  web: http://127.0.0.1:$WEB_PORT  mock: $MOCK_PORT"
}

case "$ACTION" in
  start) start ;;
  stop) stop_one web; stop_one mock; status ;;
  reset)
    stop_one web
    stop_one mock
    rm -f "$HOME_DIR/mock.jsonl" "$HOME_DIR/cookies.txt"
    rm -rf "$HOME_DIR/bot" "$HOME_DIR"/sessions/*workspace*/session-*
    start
    ;;
  status) status ;;
  *) echo "unknown action $ACTION" >&2; exit 1 ;;
esac
