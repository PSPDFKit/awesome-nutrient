#!/usr/bin/env bash
#
# Sets the Nutrient licence keys on the Fly.io deployment, prompting for one at a time.
#
#   ./scripts/set-fly-secrets.sh              # prompt for both
#   ./scripts/set-fly-secrets.sh --show       # show which are currently set
#   ./scripts/set-fly-secrets.sh --app other  # target a different app
#
# Keys are read with the terminal echo off and passed to flyctl on stdin, so they never
# appear on screen, in `ps`, or in your shell history.

set -euo pipefail

APP="nutrient-office-templating"
SHOW_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app)   APP="${2:?--app needs a value}"; shift 2 ;;
    --show)  SHOW_ONLY=true; shift ;;
    -h|--help)
      # The comment block at the top of this file is the help text.
      sed -n '3,11p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) printf 'Unknown option: %s\n' "$1" >&2; exit 2 ;;
  esac
done

# ------------------------------------------------------------------ presentation

if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  CORAL=$'\033[38;5;209m'; GREEN=$'\033[38;5;71m'; YELLOW=$'\033[38;5;179m'
else
  BOLD=""; DIM=""; RESET=""; CORAL=""; GREEN=""; YELLOW=""
fi

say()  { printf '%s\n' "$*"; }
ok()   { printf '%s✓%s %s\n' "$GREEN" "$RESET" "$*"; }
warn() { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*"; }
die()  { printf '%s✗%s %s\n' "$CORAL" "$RESET" "$*" >&2; exit 1; }

# ------------------------------------------------------------------ preflight

command -v flyctl >/dev/null 2>&1 || die "flyctl is not installed. See https://fly.io/docs/flyctl/install/"

flyctl auth whoami >/dev/null 2>&1 || die "Not logged in to Fly. Run: flyctl auth login"

ACCOUNT="$(flyctl auth whoami 2>/dev/null)"

flyctl status --app "$APP" >/dev/null 2>&1 \
  || die "App '$APP' not found for $ACCOUNT. Check the name, or pass --app."

say ""
say "${BOLD}Nutrient licence keys${RESET} ${DIM}→ $APP${RESET}"
say "${DIM}signed in as $ACCOUNT${RESET}"
say ""

# ------------------------------------------------------------------ current state

# `flyctl secrets list` shows names and digests, never values.
current="$(flyctl secrets list --app "$APP" 2>/dev/null || true)"

is_set() { grep -qE "^$1[[:space:]]" <<<"$current"; }

report() {
  local name="$1" label="$2"
  if is_set "$name"; then
    ok "$label ${DIM}($name is set)${RESET}"
  else
    warn "$label ${DIM}($name not set — evaluation mode)${RESET}"
  fi
}

say "${BOLD}Current state${RESET}"
report NUTRIENT_LICENSE_KEY     ".NET SDK   — server-side generation"
report NUTRIENT_WEB_LICENSE_KEY "Web SDK    — in-browser PDF viewer"
say ""

if [[ "$SHOW_ONLY" == true ]]; then
  exit 0
fi

# ------------------------------------------------------------------ prompting

# Collected here and staged, so both keys are applied in one deploy rather than two.
STAGED=()

prompt_key() {
  local name="$1" label="$2" note="$3" value="" confirm=""

  say "${BOLD}$label${RESET}"
  say "${DIM}$note${RESET}"

  if is_set "$name"; then
    read -r -p "Already set. Replace it? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { say "${DIM}Keeping the existing value.${RESET}"; say ""; return; }
  fi

  # -s keeps the key off the screen; the trailing echo restores the newline it eats.
  read -r -s -p "Paste the key (or press Enter to skip): " value
  echo

  if [[ -z "$value" ]]; then
    say "${DIM}Skipped.${RESET}"
    say ""
    return
  fi

  # A pasted key with surrounding whitespace or quotes is a common accident, and the
  # resulting failure is silent — the SDK just behaves as if unlicensed.
  value="$(printf '%s' "$value" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/")"

  if [[ -z "$value" ]]; then
    warn "That was only whitespace — skipped."
    say ""
    return
  fi

  # `read` stops at the first newline, so a key pasted across several lines arrives
  # truncated — and a truncated key fails silently as "unlicensed". Interior whitespace
  # is the tell: real keys have none.
  if [[ "$value" =~ [[:space:]] ]]; then
    warn "That key contains a space or tab."
    say "${DIM}If you pasted a multi-line key, only the first line was read. Paste it as a${RESET}"
    say "${DIM}single line, or set it directly:${RESET}"
    say "${DIM}  flyctl secrets set $name=\"\$(pbpaste | tr -d '\\r\\n')\" --app $APP${RESET}"
    read -r -p "Use it anyway? [y/N] " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      say "${DIM}Skipped.${RESET}"
      say ""
      return
    fi
  fi

  STAGED+=("$name=$value")
  ok "Staged ${DIM}(${#value} characters)${RESET}"
  say ""
}

prompt_key NUTRIENT_LICENSE_KEY \
  ".NET SDK licence key" \
  "Server-side. Without it, generated documents are watermarked and the process stops after an hour."

prompt_key NUTRIENT_WEB_LICENSE_KEY \
  "Web SDK licence key" \
  "Client-side — served to the browser, so it is public by nature. Without it the viewer runs in trial mode."

# ------------------------------------------------------------------ apply

if [[ ${#STAGED[@]} -eq 0 ]]; then
  say "${DIM}Nothing to change.${RESET}"
  exit 0
fi

say "${BOLD}Applying ${#STAGED[@]} secret(s) to $APP${RESET}"
say "${DIM}This triggers a rolling restart so the new values take effect.${RESET}"
say ""

# Values go in on stdin rather than argv, so they stay out of the process list.
#
# flyctl's own output is captured and echoed on failure. Swallowing it and printing a
# generic "rejected" line throws away the only thing that explains the failure.
LOG="$(mktemp -t fly-secrets)"
trap 'rm -f "$LOG"' EXIT

if printf '%s\n' "${STAGED[@]}" | flyctl secrets import --app "$APP" >"$LOG" 2>&1; then
  # Echo the rollout so a slow restart doesn't look like a hang.
  sed 's/^/  /' "$LOG"
  say ""
  ok "Secrets applied."
else
  status=$?
  say ""
  printf '%s✗%s flyctl exited %s. Its output:\n' "$CORAL" "$RESET" "$status" >&2
  sed 's/^/  /' "$LOG" >&2
  say "" >&2
  say "${DIM}Nothing was changed. Common causes:${RESET}" >&2
  say "${DIM}  · the key was pasted with a line break — paste it as one line${RESET}" >&2
  say "${DIM}  · no permission on the '$APP' app in this Fly org${RESET}" >&2
  say "${DIM}  · a stale session — try: flyctl auth login${RESET}" >&2
  exit 1
fi

# Clear the staged values from the shell as soon as they are no longer needed.
STAGED=()

say ""
say "${BOLD}Verifying${RESET}"

# Wait for the restart, then ask the app itself what it sees. /api/config reports whether
# each SDK considers itself licensed — the only end-to-end check that matters.
URL="https://$APP.fly.dev"
for attempt in $(seq 1 30); do
  sleep 4
  if config="$(curl -fsS -m 10 "$URL/api/config" 2>/dev/null)"; then
    web_trial="$(sed -n 's/.*"webSdkTrialMode":[[:space:]]*\([a-z]*\).*/\1/p' <<<"$config")"
    net_trial="$(sed -n 's/.*"dotNetTrialMode":[[:space:]]*\([a-z]*\).*/\1/p' <<<"$config")"

    [[ "$net_trial" == "false" ]] && ok ".NET SDK   — licensed" || warn ".NET SDK   — still evaluation mode"
    [[ "$web_trial" == "false" ]] && ok "Web SDK    — licensed" || warn "Web SDK    — still trial mode"

    say ""
    say "$URL"
    exit 0
  fi
done

warn "The app did not answer within two minutes."
say "${DIM}The secrets were set. Check the rollout with:  flyctl status --app $APP${RESET}"
