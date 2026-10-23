#!/bin/bash
set -e

# ========================================================
# STUPUL GENESIS v1.1 — Oprire Sigură macOS
# ========================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNTIME_DIR="$SCRIPT_DIR/runtime"
PID_FILE="$RUNTIME_DIR/stupul.pid"
PORT_FILE="$RUNTIME_DIR/stupul.port"

echo "========================================================"
echo "          STUPUL — OPRIRE SERVER LOCAL                 "
echo "========================================================"

if [ ! -f "$PID_FILE" ]; then
  echo "[INFO] Nu a fost găsit niciun server STUPUL activ (fișierul PID lipsește)."
  echo "Serverul este deja oprit."
  exit 0
fi

TARGET_PID=$(cat "$PID_FILE" 2>/dev/null || true)

if [ -z "$TARGET_PID" ]; then
  echo "[INFO] Fișierul PID este gol. Se curăță starea runtime."
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi

# Verificare că procesul există și că aparține într-adevăr serverului STUPUL
if ! ps -p "$TARGET_PID" > /dev/null 2>&1; then
  echo "[INFO] Procesul cu PID $TARGET_PID nu mai rulează. Se curăță fișierele de stare."
  rm -f "$PID_FILE" "$PORT_FILE"
  echo "Serverul este oprit."
  exit 0
fi

CMD_LINE=$(ps -p "$TARGET_PID" -o command= 2>/dev/null || true)
if ! echo "$CMD_LINE" | grep -Eq "vite|stupul"; then
  echo "[EROARE DE SIGURANȚĂ] Procesul $TARGET_PID nu pare să fie serverul STUPUL!"
  echo "Comandă identificată: $CMD_LINE"
  echo "Oprire abandonată pentru a preveni oprirea accidentală a altor procese."
  exit 1
fi

echo "[INFO] Se oprește în siguranță serverul STUPUL (PID: $TARGET_PID)..."
kill -TERM "$TARGET_PID" 2>/dev/null || true

# Așteptare până la 5 secunde pentru oprirea completă
WAIT_COUNT=0
while ps -p "$TARGET_PID" > /dev/null 2>&1 && [ $WAIT_COUNT -lt 5 ]; do
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT + 1))
done

if ps -p "$TARGET_PID" > /dev/null 2>&1; then
  echo "[INFO] Procesul nu a răspuns la semnalul graceful. Se forțează oprirea (SIGKILL)..."
  kill -9 "$TARGET_PID" 2>/dev/null || true
  sleep 1
fi

rm -f "$PID_FILE" "$PORT_FILE"

echo "========================================================"
echo "  STUPUL a fost oprit cu succes."
echo "  Procesul $TARGET_PID a fost eliberat."
echo "  Datele de joc și salvările au rămas intacte."
echo "========================================================"

exit 0
