#!/bin/sh
# One-command check of this checkout on both ends, with the mock model only:
#   unit     npm test
#   build    client.js matches src/client (build-client.mjs --check)
#   lint     npm run lint (warnings do not fail)
#   smoke    a fresh smoke bench and dev/smoke.mjs
# Every process it starts is stopped at the end, also on failure or Ctrl-C.
#
#   dev/check.sh [--skip step,step] [--only step,step] [--out <dir>]
#
# Logs go to --out (default: shots/check-<YYYYMMDD-HHMM> beside plugin/).
# Ports follow SLOT=n (0-9, default 0): the smoke bench uses 31n1 and 88n1. Bench data:
# <checkout>/.dsh-test-check-smoke.
set -u
PLUGIN="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(dirname "$PLUGIN")"
SLOT=${SLOT:-0}
case "$SLOT" in [0-9]) ;; *) echo "SLOT must be one digit" >&2; exit 2 ;; esac
STEPS="unit build lint smoke"
SKIP=""
ONLY=""
OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skip) SKIP=$(echo "$2" | tr ',' ' '); shift 2 ;;
    --only) ONLY=$(echo "$2" | tr ',' ' '); shift 2 ;;
    --out) OUT=$2; shift 2 ;;
    -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option $1 (see --help)" >&2; exit 2 ;;
  esac
done
for step in $SKIP $ONLY; do
  case " $STEPS " in *" $step "*) ;; *) echo "unknown step $step; steps: $STEPS" >&2; exit 2 ;; esac
done
OUT=${OUT:-"$ROOT/shots/check-$(date +%Y%m%d-%H%M)"}
mkdir -p "$OUT/logs"
OUT="$(cd "$OUT" && pwd)"

SMOKE_PORT=31${SLOT}1 SMOKE_MOCK=88${SLOT}1

cleanup() {
  "$PLUGIN/dev/bench.sh" check-smoke "$SMOKE_PORT" "$SMOKE_MOCK" stop >/dev/null 2>&1
}
trap cleanup EXIT
trap 'exit 130' INT TERM

wanted() {
  if [ -n "$ONLY" ]; then case " $ONLY " in *" $1 "*) ;; *) return 1 ;; esac; fi
  case " $SKIP " in *" $1 "*) return 1 ;; esac
  return 0
}

port_free() { ! node -e "const s=require('net').connect($1,'127.0.0.1');s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1))"; }
# One retry: a bench's dsh web once exited at start with an empty log while other
# sessions used the same dsh, and the next start worked.
bench_reset() {
  dev/bench.sh "$@" reset && return 0
  echo "bench $1 did not start; retrying once"
  dev/bench.sh "$@" reset
}
need_ports() {
  for port in "$@"; do
    port_free "$port" || { echo "port $port is in use; stop what holds it or pick another SLOT" >&2; return 1; }
  done
}

step_unit() { cd "$PLUGIN" && npm test; }
step_build() { cd "$PLUGIN" && node scripts/build-client.mjs --check; }
step_lint() { cd "$PLUGIN" && npm run lint; }
step_smoke() {
  cd "$PLUGIN" || return 1
  dev/bench.sh check-smoke "$SMOKE_PORT" "$SMOKE_MOCK" stop >/dev/null
  need_ports "$SMOKE_PORT" "$SMOKE_MOCK" || return 1
  export CONTEXT_WINDOW=100000 CHECK_RATIO=0.45
  bench_reset check-smoke "$SMOKE_PORT" "$SMOKE_MOCK" || return 1
  node dev/smoke.mjs check-smoke "$SMOKE_PORT"
  status=$?
  dev/bench.sh check-smoke "$SMOKE_PORT" "$SMOKE_MOCK" stop
  return $status
}

SUMMARY=""
FAILED=""
TOTAL_START=$(date +%s)
for step in $STEPS; do
  if ! wanted "$step"; then
    SUMMARY="$SUMMARY$(printf '%-8s skipped' "$step")
"
    continue
  fi
  log="$OUT/logs/$step.log"
  printf '== %-8s ' "$step"
  start=$(date +%s)
  # A subshell keeps each step's cd to itself; login token URLs stay out of the logs.
  ( "step_$step" ) >"$log.raw" 2>&1 </dev/null
  status=$?
  grep -v 'token=' "$log.raw" >"$log"
  rm -f "$log.raw"
  elapsed=$(( $(date +%s) - start ))
  if [ $status -eq 0 ]; then result=ok; else result=FAILED; FAILED="$FAILED $step"; fi
  echo "$result (${elapsed} s)"
  if [ $status -ne 0 ]; then
    echo "   log: $log"
    tail -15 "$log" | sed 's/^/   | /'
  fi
  SUMMARY="$SUMMARY$(printf '%-8s %-7s %4s s  %s' "$step" "$result" "$elapsed" "$log")
"
done

echo
printf '%s' "$SUMMARY"
echo "total $(( $(date +%s) - TOTAL_START )) s; logs: $OUT/logs"
if [ -n "$FAILED" ]; then
  echo "check failed:$FAILED"
  exit 1
fi
echo "check passed"
