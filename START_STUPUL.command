#!/bin/bash
set -uo pipefail

# ========================================================
# STUPUL GENESIS v1.1 — Lansator Oficial macOS
# ========================================================

# Rezolvă directorul real al proiectului, inclusiv când scriptul
# este apelat printr-un symlink de pe Desktop (macOS nu are readlink -f).
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
mkdir -p "$RUNTIME_DIR"
PID_FILE="$RUNTIME_DIR/stupul.pid"
PORT_FILE="$RUNTIME_DIR/stupul.port"
LOG_FILE="$RUNTIME_DIR/stupul.log"

say()  { echo "[INFO] $*"; }
warn() { echo "[AVERTISMENT] $*"; }
err()  { echo "[EROARE CRITICĂ] $*"; }

echo "========================================================"
echo "          STUPUL — CIVILIZAȚIE PERSISTENTĂ             "
echo "                 GENESIS v1.1                           "
echo "========================================================"
say "Director proiect: $PROJECT_DIR"

# Verifică dacă un PID dat este serverul STUPUL (proces viu + comandă care referă proiectul)
is_stupul_pid() {
  local pid="$1"
  [ -n "$pid" ] || return 1
  ps -p "$pid" >/dev/null 2>&1 || return 1
  local cmd
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  echo "$cmd" | grep -q "$PROJECT_DIR"
}

# Portul pe care ascultă un proces dat (sau gol)
port_of_pid() {
  lsof -nP -iTCP -sTCP:LISTEN -a -p "$1" 2>/dev/null | awk 'NR>1{print $9}' | sed -E 's/.*:([0-9]+)$/\1/' | head -n 1
}

open_browser() {
  say "Deschid jocul în browser: $1"
  open "$1" 2>/dev/null || true
}

# 1. Dacă există deja un proces STUPUL viu (PID file valid), deschidem doar browserul
if [ -f "$PID_FILE" ]; then
  EXISTING_PID="$(tr -d '[:space:]' < "$PID_FILE")"
  if is_stupul_pid "$EXISTING_PID"; then
    SAVED_PORT="$(tr -d '[:space:]' < "$PORT_FILE" 2>/dev/null || true)"
    SAVED_PORT="${SAVED_PORT:-5173}"
    say "STUPUL rulează deja (PID $EXISTING_PID) pe http://127.0.0.1:$SAVED_PORT"
    open_browser "http://127.0.0.1:$SAVED_PORT"
    exit 0
  fi
  warn "PID-ul vechi ($EXISTING_PID) nu mai aparține STUPUL. Curăț fișierul de stare."
  rm -f "$PID_FILE" "$PORT_FILE"
fi

# 1b. Caută orice proces vite/Node orfan care rulează deja pentru acest proiect
ORPHAN_PID=""
for pid in $(pgrep -f "vite" 2>/dev/null); do
  if is_stupul_pid "$pid"; then
    ORPHAN_PID="$pid"
    break
  fi
done
if [ -n "$ORPHAN_PID" ]; then
  ORPHAN_PORT="$(port_of_pid "$ORPHAN_PID")"
  ORPHAN_PORT="${ORPHAN_PORT:-5173}"
  echo "$ORPHAN_PID" > "$PID_FILE"
  echo "$ORPHAN_PORT" > "$PORT_FILE"
  say "Am detectat serverul STUPUL deja pornit (PID $ORPHAN_PID) pe http://127.0.0.1:$ORPHAN_PORT"
  open_browser "http://127.0.0.1:$ORPHAN_PORT"
  exit 0
fi

# 2. Verificare Node.js și npm
if ! command -v node >/dev/null 2>&1; then
  err "Node.js nu a fost găsit în PATH! Instalați Node.js (https://nodejs.org)."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  err "npm nu a fost găsit în PATH!"
  exit 1
fi
say "Mediu detectat: Node.js $(node -v)"

# 3. Verificare dependențe instalate
if [ ! -d "$PROJECT_DIR/node_modules" ] || [ ! -d "$PROJECT_DIR/node_modules/vite" ]; then
  say "Instalez dependențele necesare (poate dura puțin)..."
  ( cd "$PROJECT_DIR" && npm install ) >> "$LOG_FILE" 2>&1
fi

# 4. Găsește un port liber începând cu 5173 (fără a deranja alte proiecte)
port_free() { ! lsof -i :"$1" -sTCP:LISTEN >/dev/null 2>&1; }

TARGET_PORT=""
for p in $(seq 5173 5180); do
  if port_free "$p"; then
    TARGET_PORT="$p"
    break
  fi
done
if [ -z "$TARGET_PORT" ]; then
  err "Niciun port liber în intervalul 5173–5180. Eliberați un port și reîncercați."
  exit 1
fi
say "Port selectat: 127.0.0.1:$TARGET_PORT"

# 5. Pornește serverul Vite legat exclusiv la 127.0.0.1
say "Pornesc serverul STUPUL în fundal..."
(
  cd "$PROJECT_DIR/apps/web" || exit 1
  exec nohup node "$PROJECT_DIR/node_modules/vite/bin/vite.js" \
    --host 127.0.0.1 --port "$TARGET_PORT" \
    < /dev/null >> "$LOG_FILE" 2>&1
) &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true

echo "$SERVER_PID" > "$PID_FILE"
echo "$TARGET_PORT" > "$PORT_FILE"
say "Server lansat (PID: $SERVER_PID). Jurnal: $LOG_FILE"

# 6. Așteaptă răspuns HTTP 200 (max 25 secunde)
MAX_WAIT=25
READY=0
for i in $(seq 1 "$MAX_WAIT"); do
  if ! ps -p "$SERVER_PID" >/dev/null 2>&1; then
    err "Serverul s-a oprit neașteptat la pornire."
    echo "--- Ultimele rânduri din jurnal ---"
    tail -n 25 "$LOG_FILE" 2>/dev/null || true
    rm -f "$PID_FILE" "$PORT_FILE"
    exit 1
  fi
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$TARGET_PORT" 2>/dev/null || true)"
  if [ "$CODE" = "200" ]; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" = "1" ]; then
  echo "========================================================"
  say "STUPUL a pornit cu succes!"
  say "Adresă: http://127.0.0.1:$TARGET_PORT (exclusiv local)"
  say "PID: $SERVER_PID"
  echo "========================================================"
  open_browser "http://127.0.0.1:$TARGET_PORT"
else
  warn "Serverul a pornit (PID $SERVER_PID), dar nu a răspuns HTTP în $MAX_WAIT s."
  warn "Încercați manual: http://127.0.0.1:$TARGET_PORT"
  open_browser "http://127.0.0.1:$TARGET_PORT"
fi

exit 0
