#!/bin/bash
set -e

# ========================================================
# STUPUL GENESIS v1.1 — Lansator Oficial macOS
# ========================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RUNTIME_DIR="$SCRIPT_DIR/runtime"
mkdir -p "$RUNTIME_DIR"
PID_FILE="$RUNTIME_DIR/stupul.pid"
PORT_FILE="$RUNTIME_DIR/stupul.port"
LOG_FILE="$RUNTIME_DIR/stupul.log"

PORT=5173

echo "========================================================"
echo "          STUPUL — CIVILIZAȚIE PERSISTENTĂ             "
echo "                 GENESIS v1.1                           "
echo "========================================================"
echo "Director proiect: $SCRIPT_DIR"

# 1. Verificare dacă serverul rulează deja
if [ -f "$PID_FILE" ]; then
  EXISTING_PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$EXISTING_PID" ] && ps -p "$EXISTING_PID" > /dev/null 2>&1; then
    CMD_LINE=$(ps -p "$EXISTING_PID" -o command= 2>/dev/null || true)
    if echo "$CMD_LINE" | grep -Eq "vite|stupul"; then
      SAVED_PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "5173")
      echo "[INFO] STUPUL rulează deja la PID $EXISTING_PID pe http://127.0.0.1:$SAVED_PORT"
      echo "[INFO] Deschid jocul în browser..."
      open "http://127.0.0.1:$SAVED_PORT"
      exit 0
    else
      echo "[AVERTISMENT] PID-ul vechi ($EXISTING_PID) nu aparține STUPUL. Curăț fișierul stale."
      rm -f "$PID_FILE"
    fi
  else
    rm -f "$PID_FILE"
  fi
fi

# 2. Verificare Node.js și npm
if ! command -v node >/dev/null 2>&1; then
  echo "[EROARE CRITICĂ] Node.js nu a fost găsit în PATH!"
  echo "Vă rugăm să instalați Node.js (https://nodejs.org) pentru a rula STUPUL."
  read -p "Apăsați Enter pentru a ieși..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[EROARE CRITICĂ] npm nu a fost găsit în PATH!"
  read -p "Apăsați Enter pentru a ieși..."
  exit 1
fi

NODE_VER=$(node -v)
echo "[INFO] Mediu detectat: Node.js $NODE_VER"

# 3. Verificare dependențe instalate
if [ ! -d "node_modules" ] || [ ! -d "node_modules/vite" ]; then
  echo "[INFO] Se instalează dependențele necesare..."
  npm install >> "$LOG_FILE" 2>&1
fi

# 4. Verificare disponibilitate port (fallback sigur dacă portul 5173 este ocupat)
check_port() {
  local p=$1
  if lsof -i :"$p" -sTCP:LISTEN >/dev/null 2>&1; then
    return 1 # Port ocupat
  else
    return 0 # Port liber
  fi
}

TARGET_PORT=$PORT
if ! check_port $TARGET_PORT; then
  echo "[INFO] Portul $TARGET_PORT este ocupat de alt proces. Caut port liber..."
  for p in 5174 5175 5176 5177 5178 5179; do
    if check_port $p; then
      TARGET_PORT=$p
      break
    fi
  done
fi

echo "[INFO] Se pornește serverul STUPUL pe 127.0.0.1:$TARGET_PORT..."

# 5. Pornire server Vite în fundal, legat exclusiv la 127.0.0.1
cd "$SCRIPT_DIR/apps/web"
nohup node "$SCRIPT_DIR/node_modules/vite/bin/vite.js" --host 127.0.0.1 --port "$TARGET_PORT" < /dev/null >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID
cd "$SCRIPT_DIR"

echo "$SERVER_PID" > "$PID_FILE"
echo "$TARGET_PORT" > "$PORT_FILE"
echo "[INFO] Server lansat în fundal (PID: $SERVER_PID). Jurnal: $LOG_FILE"

# 6. Așteptare confirmare HTTP (până la 20 de secunde)
MAX_WAIT=20
WAIT_COUNT=0
READY=0

echo -n "[INFO] Aștept confirmarea pornirii serverului HTTP"
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if ! ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo ""
    echo "[EROARE CRITICĂ] Serverul s-a oprit neașteptat la pornire!"
    tail -n 25 "$LOG_FILE"
    rm -f "$PID_FILE" "$PORT_FILE"
    read -p "Apăsați Enter pentru a închide..."
    exit 1
  fi

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$TARGET_PORT" || true)
  if [ "$HTTP_CODE" = "200" ]; then
    READY=1
    break
  fi

  echo -n "."
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT + 1))
done
echo ""

if [ $READY -eq 1 ]; then
  URL="http://127.0.0.1:$TARGET_PORT"
  echo "========================================================"
  echo "  STUPUL a pornit cu succes!"
  echo "  Adresă: $URL (Exclusiv local)"
  echo "  PID: $SERVER_PID"
  echo "========================================================"
  echo "[INFO] Se deschide jocul în browser..."
  open "$URL"
else
  echo "[AVERTISMENT] Serverul a pornit (PID $SERVER_PID), dar nu a răspuns în timp util pe HTTP."
  echo "Puteți deschide manual: http://127.0.0.1:$TARGET_PORT"
  open "http://127.0.0.1:$TARGET_PORT"
fi

exit 0
