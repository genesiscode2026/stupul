#!/bin/bash
set -uo pipefail

# ========================================================
# STUPUL GENESIS v1.1 — Oprire Sigură macOS
# ========================================================

resolve_script_path() {
  local target="$1"
  while [ -L "$target" ]; do
    local dir link
    dir="$(cd -P "$(dirname "$target")" 2>/dev/null && pwd)"
    link="$(readlink "$target")"
    case "$link" in
      /*) target="$link" ;;
      *) target="$dir/$link" ;;
    esac
  done
  cd -P "$(dirname "$target")" 2>/dev/null && pwd
}

PROJECT_DIR="$(resolve_script_path "$0")"
RUNTIME_DIR="$PROJECT_DIR/runtime"
PID_FILE="$RUNTIME_DIR/stupul.pid"
PORT_FILE="$RUNTIME_DIR/stupul.port"

say()  { echo "[INFO] $*"; }
warn() { echo "[AVERTISMENT] $*"; }
err()  { echo "[EROARE DE SIGURANȚĂ] $*"; }

echo "========================================================"
echo "          STUPUL — OPRIRE SERVER LOCAL                 "
echo "========================================================"

if [ ! -f "$PID_FILE" ]; then
  say "Nu a fost găsit niciun server STUPUL activ (fișierul PID lipsește)."
  say "Serverul este deja oprit."
  exit 0
fi

TARGET_PID="$(tr -d '[:space:]' < "$PID_FILE")"
if [ -z "$TARGET_PID" ]; then
  say "Fișierul PID este gol. Curăț starea runtime."
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi

# Verifică identitatea procesului înainte de orice semnal
if ! ps -p "$TARGET_PID" >/dev/null 2>&1; then
  say "Procesul $TARGET_PID nu mai rulează. Curăț fișierele de stare."
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi

CMD_LINE="$(ps -p "$TARGET_PID" -o command= 2>/dev/null || true)"
if ! echo "$CMD_LINE" | grep -q "$PROJECT_DIR"; then
  err "Procesul $TARGET_PID NU este serverul STUPUL (comandă: $CMD_LINE)."
  err "Oprirea a fost abandonată pentru a nu afecta alte proiecte."
  exit 1
fi

say "Opresc în siguranță serverul STUPUL (PID $TARGET_PID)..."
kill -TERM "$TARGET_PID" 2>/dev/null || true

for i in $(seq 1 8); do
  if ! ps -p "$TARGET_PID" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ps -p "$TARGET_PID" >/dev/null 2>&1; then
  say "Procesul nu a răspuns la SIGTERM. Forțez oprirea (SIGKILL) doar a acestui PID..."
  kill -9 "$TARGET_PID" 2>/dev/null || true
  sleep 1
fi

SAVED_PORT="$(tr -d '[:space:]' < "$PORT_FILE" 2>/dev/null || true)"
if [ -n "$SAVED_PORT" ] && lsof -i :"$SAVED_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  warn "Portul $SAVED_PORT pare încă ocupat de alt proces; NU îl opresc (nu este STUPUL)."
else
  say "Portul $SAVED_PORT a fost eliberat."
fi

rm -f "$PID_FILE" "$PORT_FILE"

BACKEND_PID_FILE="$RUNTIME_DIR/stupul_backend.pid"
if [ -f "$BACKEND_PID_FILE" ]; then
  BPID="$(tr -d '[:space:]' < "$BACKEND_PID_FILE")"
  if [ -n "$BPID" ] && ps -p "$BPID" >/dev/null 2>&1; then
    CMD_LINE_B="$(ps -p "$BPID" -o command= 2>/dev/null || true)"
    if echo "$CMD_LINE_B" | grep -q "$PROJECT_DIR"; then
      say "Opresc serverul autoritativ multiplayer (PID $BPID)..."
      kill -TERM "$BPID" 2>/dev/null || true
    else
      warn "PID-ul de backend $BPID nu aparține STUPUL (comandă: $CMD_LINE_B); ignorat pentru siguranță."
    fi
  fi
  rm -f "$BACKEND_PID_FILE"
fi


echo "========================================================"
say "STUPUL a fost oprit cu succes."
say "Procesul $TARGET_PID a fost eliberat."
say "Datele de joc și salvările au rămas intacte."
echo "========================================================"
exit 0
